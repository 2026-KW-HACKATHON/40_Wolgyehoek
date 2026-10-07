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
      <div className="space-y-6 px-4 pb-8 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">운영</h1>
        <OperatorForm />
      </div>
    );
  }
  const flags = await openFlags();
  return (
    <div className="space-y-6 px-4 pb-8 pt-2">
      <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">운영</h1>
      <section>
        <SectionTitle sub={flags.length}>신고</SectionTitle>
        {flags.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-4)]">처리할 신고가 없어요</p>
        ) : (
          <ul className="space-y-3">
            {flags.map((f) => (
              <li key={f.id} className="space-y-3 rounded-[22px] border border-border p-4">
                <p className="text-xs text-[var(--text-4)]">{f.targetType} · {fmtDate(f.createdAt)}</p>
                <p className="text-[15px] font-medium">{f.reason}</p>
                {f.targetType === "card" && <Link href={`/cards/${f.targetId}`} className="text-sm font-bold text-primary">카드 보기</Link>}
                <form className="flex flex-wrap gap-2">
                  <Input name="note" placeholder="처리 사유" variant="soft" className="min-w-0 flex-1 rounded-full" />
                  <Button type="submit" formAction={moderate.bind(null, f.id, "hide")} className="bg-none bg-foreground">가리기</Button>
                  <Button type="submit" variant="soft" formAction={moderate.bind(null, f.id, "keep")}>유지</Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
