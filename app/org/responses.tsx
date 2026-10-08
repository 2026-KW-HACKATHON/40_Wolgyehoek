import { Building2 } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import type { InstitutionResponse, InstitutionStance } from "@/lib/queries";

const tones: Record<InstitutionStance, string> = {
  EMPATHY: "bg-blue-100 text-blue-900",
  SUPPORT: "bg-emerald-100 text-emerald-900",
  PARTNER: "bg-violet-100 text-violet-900",
};
export async function InstitutionResponses({ responses }: { responses: InstitutionResponse[] }) {
  const { t, locale } = await getT();
  if (!responses.length) return <p className="text-sm text-muted-foreground">{t.org.empty}</p>;
  return <ul className="space-y-3">{responses.map(response => <li key={response.institutionName} className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
    <div className="flex flex-wrap items-center gap-2">
      <Building2 aria-hidden="true" className="size-4 shrink-0 text-blue-700" />
      <span className="text-xs font-semibold text-blue-700">{t.org.verified}</span>
      <span className="min-w-0 break-all text-sm font-bold">{response.institutionName}</span>
    </div>
    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${tones[response.stance]}`}>{t.org.stances[response.stance]}</span>
    <p className="mt-2 whitespace-pre-line break-words text-[15px] leading-6">{response.comment}</p>
    <time dateTime={response.createdAt.toISOString()} className="mt-2 block text-xs text-muted-foreground">{response.createdAt.toLocaleDateString(locale)}</time>
  </li>)}</ul>;
}
