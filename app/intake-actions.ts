"use server";

import { lookup } from "node:dns/promises";
import type { LookupAddress } from "node:dns";
import { isIP } from "node:net";
import { publishCard, type ActionState } from "@/app/actions";
import { api, ApiError } from "@/lib/api";
import { draftFromText, type Draft } from "@/lib/domain/draft";
import type { IdeaCheck } from "@/lib/domain/ideas";
import { buildProblems, elsewhere, precedentsFor, type Problem } from "@/lib/domain/problems";
import { knowledgeGraph } from "@/lib/queries";
import { extractPageText, TEXT_LIMIT } from "@/components/intake/source";

function isPrivate(address: string): boolean {
  if (address.includes(":")) {
    const a = address.toLowerCase();
    return a === "::" || a === "::1" || /^f[cd]|^fe[89ab]/.test(a) ||
      (a.startsWith("::ffff:") && (isIP(a.slice(7)) !== 4 || isPrivate(a.slice(7))));
  }
  const [a, b] = address.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

async function publicUrl(raw: string, signal: AbortSignal) {
  signal.throwIfAborted();
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("URL");
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = await new Promise<LookupAddress[]>((resolve, reject) => {
    const abort = () => reject(new Error("TIMEOUT"));
    signal.addEventListener("abort", abort, { once: true });
    lookup(hostname, { all: true }).then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
  if (!addresses.length || addresses.some((a) => isPrivate(a.address))) throw new Error("URL");
  return url;
}

async function fetchSource(raw: string) {
  const signal = AbortSignal.timeout(10000);
  let url = await publicUrl(raw, signal);
  for (let i = 0; i < 5; i++) {
    const response = await fetch(url, { signal, redirect: "manual", cache: "no-store" });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("URL");
      url = await publicUrl(new URL(location, url).href, signal);
      continue;
    }
    if (!response.ok || !/text\/html|text\/plain|application\/xhtml/i.test(response.headers.get("content-type") ?? "")) {
      await response.body?.cancel();
      throw new Error("URL");
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("URL");
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 2 * 1024 * 1024) throw new Error("SIZE");
        chunks.push(value);
      }
    } finally { await reader.cancel(); }
    const bytes = Buffer.concat(chunks);
    const charset = response.headers.get("content-type")?.match(/charset\s*=\s*["']?([\w-]+)/i)?.[1] ??
      bytes.toString().match(/<meta[^>]*charset\s*=\s*["']?([\w-]+)/i)?.[1] ?? "utf-8";
    const html = new TextDecoder(charset).decode(bytes);
    return /text\/plain/i.test(response.headers.get("content-type") ?? "") ? html.slice(0, TEXT_LIMIT) : extractPageText(html);
  }
  throw new Error("URL");
}

export async function analyzeIntake(input: { mode: "text" | "url" | "file"; text: string; source: string; place: string }) {
  let text = String(input.text ?? "").trim();
  let source = input.mode === "file" ? String(input.source ?? "").trim().slice(0, 200) : "";
  if (input.mode === "url") {
    if (text.length > 2000) return { ok: false as const, error: "URL을 다시 확인해 주세요." };
    try {
      source = new URL(text).href;
      text = await fetchSource(source);
    } catch { return { ok: false as const, error: "페이지를 읽지 못했어요. 공개 기사·회의록 URL을 확인하거나 본문을 직접 붙여 주세요." }; }
  }
  if (text.length < 10 || text.length > TEXT_LIMIT) return { ok: false as const, error: "아이디어를 10~6000자로 적어 주세요." };
  const warnings: string[] = [];
  let draft: Draft;
  try {
    const result = await api<Draft>("/api/assist/draft", { method: "POST", body: { text: text.slice(0, 2000) } });
    draft = { ...result, source: result.source.toLowerCase() as Draft["source"] };
  } catch {
    draft = draftFromText(text);
    warnings.push("초안 도우미에 연결하지 못해 입력에서 초안을 만들었어요.");
  }
  if (!draft.place.trim() || (draft.source === "rule" && draft.place === "월계1동" && !/월계/.test(text))) {
    draft.place = input.place.trim().slice(0, 100) || draft.place;
  }
  let check: IdeaCheck | null = null;
  try {
    check = await api<IdeaCheck>("/api/ideas/check", { method: "POST", body: { title: draft.title, body: text.slice(0, 2000), place: draft.place } });
  } catch (error) {
    warnings.push(error instanceof ApiError ? `선례 조회: ${error.message}` : "선례를 조회하지 못했어요.");
  }
  const needs = check?.concepts.map((c) => c.key) ?? [];
  let local: Problem[] = [];
  if (check) {
    try {
      const problems = buildProblems(await knowledgeGraph());
      const seen = new Map<string, Problem>();
      for (const need of needs) {
        for (const p of elsewhere(problems, { need: { key: need, label: "" }, place: check.zone }).local) seen.set(p.id, p);
      }
      local = [...seen.values()];
    } catch { warnings.push("다른 장소의 시도를 조회하지 못했어요."); }
  }
  return { ok: true as const, text, source, draft, check, precedents: precedentsFor(needs), local, warning: warnings.join(" ") || null };
}

export async function publishIntake(state: ActionState, form: FormData): Promise<ActionState> {
  const source = String(form.get("intakeSource") ?? "").trim().slice(0, 2000);
  const body = String(form.get("body") ?? "").trim();
  const withSource = source && !body.endsWith(`출처: ${source}`) ? `${body}\n\n출처: ${source}` : body;
  if (withSource.length > 2000) return { ok: false, error: "조사 메모와 출처를 포함해 내용을 2000자 이하로 줄여 주세요." };
  form.set("body", withSource);
  return publishCard(state, form);
}
