"use server";

import { revalidatePath, updateTag } from "next/cache";
import { api, ApiError, PUBLIC_DATA_TAG } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
import type { ActionState } from "@/app/actions";

export type InstitutionState = ActionState & { code?: string; name?: string };
const refresh = (path: string) => { updateTag(PUBLIC_DATA_TAG); revalidatePath("/", "layout"); revalidatePath(path); };
async function failure(error: unknown): Promise<ActionState> {
  const { t } = await getT();
  const messages: Record<string, string> = t.org.errors;
  return { ok: false, error: error instanceof ApiError ? messages[error.message] ?? t.org.failed : t.org.failed };
}

export async function enterInstitution(code: string): Promise<ActionState> {
  const { t } = await getT();
  if (!code.trim()) return { ok: false, error: t.org.codeRequired };
  try {
    await api("/api/institutions/enter", { method: "POST", body: { code: code.trim() } });
    refresh("/org");
    return { ok: true, message: t.org.entered };
  } catch (error) { return failure(error); }
}

export async function saveInstitutionResponse(cardId: string, form: FormData): Promise<ActionState> {
  const { t } = await getT();
  const stance = String(form.get("stance") ?? "");
  const comment = String(form.get("comment") ?? "").trim();
  if (!["EMPATHY", "SUPPORT", "PARTNER"].includes(stance)) return { ok: false, error: t.org.stanceRequired };
  if ([...comment].length < 2 || [...comment].length > 500) return { ok: false, error: t.org.commentLength };
  try {
    await api(`/api/cards/${encodeURIComponent(cardId)}/institution-response`, { method: "PUT", body: { stance, comment } });
    refresh(`/cards/${cardId}`);
    revalidatePath("/problems/[id]", "page");
    return { ok: true, message: t.org.saved };
  } catch (error) { return failure(error); }
}

export async function createInstitution(form: FormData): Promise<InstitutionState> {
  const { t } = await getT();
  const name = String(form.get("name") ?? "").trim();
  if (!name || name.length > 100) return { ok: false, error: t.org.nameLength };
  try {
    const created = await api<{ id: string; name: string; code: string }>("/api/operator/institutions", { method: "POST", body: { name } });
    refresh("/admin");
    return { ok: true, message: t.org.created, code: created.code, name: created.name };
  } catch (error) { return failure(error); }
}
