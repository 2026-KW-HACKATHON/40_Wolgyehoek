import { PageHeaderBar } from "@/components/PageHeaderBar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { currentDevice } from "@/lib/device";
import { openFlags } from "@/lib/queries";
import { moderate } from "@/app/actions";
import { SectionTitle, fmtDate } from "@/components/ui";
import { OperatorForm } from "./operator-form";

export default async function AdminPage() {
  const me = await currentDevice();
  if (!me?.isOperator) {
    return (
      <div className="mx-auto max-w-[560px] space-y-4 px-4 py-8 sm:px-8">
        <PageHeaderBar title="운영" className="-mx-4 sm:-mx-8" />
        <p className="text-sm text-ink-2">운영 코드를 입력하면 이 기기에서 신고 처리와 검증 즉시 종료를 할 수 있어요.</p>
        <OperatorForm />
      </div>
    );
  }
  const flags = await openFlags();
  return (
    <div className="mx-auto max-w-[800px] space-y-8 px-4 py-6 sm:px-8">
      <PageHeaderBar title="운영" className="-mx-4 sm:-mx-8" />
      <section>
        <SectionTitle sub={`${flags.length}건`}>처리 대기 신고</SectionTitle>
        {flags.length === 0 ? (
          <p className="rounded-lg bg-subtle px-4 py-6 text-center text-sm text-ink-3 ring-line">처리할 신고가 없어요.</p>
        ) : (
          <ul className="space-y-3">
            {flags.map((f) => (
              <li key={f.id} className="ring-card space-y-3 rounded-lg bg-white p-4">
                <p className="text-sm">
                  <span className="font-mono text-[12px] text-ink-3">{f.targetType} · {fmtDate(f.createdAt)}</span>
                  <br />
                  사유: {f.reason}
                </p>
                {f.targetType === "card" && <Link href={`/cards/${f.targetId}`} className="text-sm underline">카드 보기</Link>}
                <form className="flex flex-wrap gap-2">
                  <Input name="note" placeholder="처리 사유" className="rounded-md bg-white px-2 py-1.5 text-sm ring-line" />
                  <Button type="submit" formAction={moderate.bind(null, f.id, "hide")} className="rounded-md bg-ink px-3 py-1.5 text-sm text-white">가리기</Button>
                  <Button type="submit" formAction={moderate.bind(null, f.id, "keep")} className="rounded-md bg-white px-3 py-1.5 text-sm ring-line">유지</Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="text-sm text-ink-2">카드 상세 화면에서 [운영자] 검증 즉시 종료 버튼으로 시연용 마감을 할 수 있어요.</p>
    </div>
  );
}
