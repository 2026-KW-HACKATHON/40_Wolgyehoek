import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { TEAM_REPORTS } from "@/lib/domain/team-reports";
import { inputCls } from "@/components/ui";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t.teams.metadataTitle };
}

export default async function TeamsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { t } = await getT();
  const { q = "" } = await searchParams;
  const term = q.trim().toLowerCase();
  const list = TEAM_REPORTS.filter((r) => !term || `${r.teamName} ${r.service} ${r.category}`.toLowerCase().includes(term));

  return <div className="mx-auto w-full max-w-[960px] px-6 pt-8 pb-16">
    <p className="text-sm font-bold text-primary">{t.teams.kicker}</p>
    <h1 className="mt-1 text-[32px] font-black tracking-[-0.04em]">{t.teams.title}</h1>
    <p className="mt-2 text-[16px] text-muted-foreground">{t.teams.intro}</p>
    <form className="mt-6"><input name="q" defaultValue={q} aria-label={t.teams.search} placeholder={t.teams.search} className={inputCls} /></form>
    <ul className="mt-4 divide-y divide-border">
      {list.map((r) => {
        const n = r.check?.related.length ?? 0;
        return <li key={r.no}>
          <Link href={`/teams/${r.no}`} className="group flex items-center gap-4 py-4">
            <span className="tnum w-10 shrink-0 text-sm font-bold text-muted-foreground">{r.no}조</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[17px] font-extrabold group-hover:text-primary">{r.service}</span>
              <span className="block truncate text-sm text-muted-foreground">{r.teamName} · {r.category}</span>
            </span>
            <span className={n ? "shrink-0 text-sm font-bold text-primary" : "shrink-0 text-sm font-bold text-muted-foreground"}>{n ? t.teams.matched(n) : t.teams.newProblem}</span>
            <ChevronRight className="size-4 shrink-0 text-[var(--text-4)]" />
          </Link>
        </li>;
      })}
    </ul>
  </div>;
}
