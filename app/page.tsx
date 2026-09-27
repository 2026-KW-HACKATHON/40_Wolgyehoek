import Link from "next/link";
import { listCards } from "@/lib/queries";
import { CardItem } from "@/components/card-item";
import { ButtonLink, Disclaimer } from "@/components/ui";

const TABS = [
  { key: "open", label: "검증 중" },
  { key: "done", label: "결론·종료" },
  { key: "all", label: "전체" },
] as const;

export default async function Home({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  const sp = await searchParams;
  const tab = (TABS.find((t) => t.key === sp.tab)?.key ?? "all") as "open" | "done" | "all";
  const q = sp.q ?? "";
  const cards = await listCards({ tab, q });
  return (
    <div>
      <section className="pb-10 pt-4">
        <p className="mb-3 font-mono text-[12px] uppercase tracking-wider text-ink-3">Wolgye 1-dong · Demand check & archive</p>
        <h1 className="max-w-[640px] text-[32px] font-semibold leading-[1.15] tracking-[-0.04em] sm:text-[40px]">
          월계1동의 아이디어,
          <br />
          주민 반응으로 검증하고 서랍에 남깁니다.
        </h1>
        <p className="mt-4 max-w-[560px] text-[16px] leading-7 text-ink-2">
          광운대 캡스톤, 지역연계 수업, 공모전, 주민 제안까지. 좋은 시도가 다음 단계로 가도록, 주민 수요를 단계별로 확인하고 결론을 응답자에게 돌려드려요.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <ButtonLink href="/new">아이디어 올리기</ButtonLink>
          <ButtonLink href="/?tab=done" variant="secondary">
            멈춘 아이디어 이어받기
          </ButtonLink>
        </div>
      </section>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-subtle p-1 ring-line" role="tablist">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/?tab=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              role="tab"
              aria-selected={t.key === tab}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${t.key === tab ? "bg-white text-ink ring-card" : "text-ink-3 hover:text-ink"}`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <form className="flex gap-2" action="/">
          <input type="hidden" name="tab" value={tab} />
          <input name="q" defaultValue={q} placeholder="플리마켓, 경춘선숲길…" aria-label="카드 검색" className="w-full rounded-md bg-white px-3 py-2 text-sm ring-line sm:w-64" />
          <button className="shrink-0 whitespace-nowrap rounded-md bg-white px-3 text-sm font-medium ring-line hover:bg-subtle">검색</button>
        </form>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-lg bg-subtle px-5 py-10 text-center text-sm text-ink-3 ring-line">조건에 맞는 카드가 없어요.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((s) => (
            <CardItem key={s.card.id} s={s} />
          ))}
        </div>
      )}
      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
