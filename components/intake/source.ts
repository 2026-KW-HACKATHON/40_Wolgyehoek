import type { Locale } from "@/lib/i18n/config";
import { intake } from "@/lib/i18n/messages/intake";

export const FILE_LIMIT = 5 * 1024 * 1024;
export const TEXT_LIMIT = 6000;

function decodeEntities(text: string) {
  const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (all, entity: string) => {
    if (!entity.startsWith("#")) return entities[entity.toLowerCase()] ?? all;
    const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
  });
}

export function extractPageText(html: string) {
  const clean = (value: string) => decodeEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
  const title = clean(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  let description = "";
  for (const meta of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = Object.fromEntries([...meta.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
      .map((m) => [m[1].toLowerCase(), m[2] ?? m[3]]));
    if (attrs.name?.toLowerCase() === "description" || attrs.property?.toLowerCase() === "og:description") {
      description = clean(attrs.content ?? "");
      break;
    }
  }
  const body = html.replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template|head)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
  return [title, description, clean(body)].filter(Boolean).join("\n\n").slice(0, TEXT_LIMIT);
}

export async function readIntakeFile(file: File, locale: Locale = "ko"): Promise<string> {
  const t = { intake: intake[locale] };
  if (file.size > FILE_LIMIT) throw new Error(t.intake.fileSizeError);
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["txt", "md", "pdf"].includes(extension ?? "")) throw new Error(t.intake.fileTypeError);
  let text: string;
  if (extension === "pdf") {
    const { extractText } = await import("unpdf");
    text = (await extractText(new Uint8Array(await file.arrayBuffer()), { mergePages: true })).text;
  } else {
    text = await file.text();
  }
  if (text.trim().length < 10) throw new Error(t.intake.fileTextError);
  return text.trim().slice(0, TEXT_LIMIT);
}
