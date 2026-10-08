import { getT } from "@/lib/i18n/server";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { currentDevice } from "@/lib/device";
import { openFlags } from "@/lib/queries";
import { moderate } from "@/app/actions";
import { SectionTitle, fmtDate } from "@/components/ui";
import { OperatorForm, CreateInstitutionForm } from "./operator-form";
import { api } from "@/lib/api";

export default async function AdminPage() { const { t } = await getT();
  const me = await currentDevice();
  if (!me?.isOperator) {
    return (
      <div className="space-y-6 px-4 pb-8 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">{t.system.operations}</h1>
        <OperatorForm />
      </div>
    );
  }
  const [flags, institutions] = await Promise.all([openFlags(), api<{ id: string; name: string }[]>("/api/operator/institutions")]);
  return (
    <div className="space-y-6 px-4 pb-8 pt-2">
      <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">{t.system.operations}</h1>
      <section className="space-y-4">
        <SectionTitle sub={institutions.length}>{t.org.adminTitle}</SectionTitle>
        <CreateInstitutionForm />
        {institutions.length ? <ul className="divide-y divide-border">{institutions.map(i => <li key={i.id} className="break-words py-3 text-sm font-semibold">{i.name}</li>)}</ul>
          : <p className="text-sm text-muted-foreground">{t.org.noInstitutions}</p>}
      </section>
      <section>
        <SectionTitle sub={flags.length}>{t.system.flags}</SectionTitle>
        {flags.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-4)]">{t.system.noFlags}</p>
        ) : (
          <ul className="space-y-3">
            {flags.map((f) => (
              <li key={f.id} className="space-y-3 rounded-[22px] border border-border p-4">
                <p className="text-xs text-[var(--text-4)]">{f.targetType} · {fmtDate(f.createdAt)}</p>
                <p className="text-[15px] font-medium">{f.reason}</p>
                {f.targetType === "card" && <Link href={`/cards/${f.targetId}`} className="text-sm font-bold text-primary">{t.system.viewCard}</Link>}
                <form className="flex flex-wrap gap-2">
                  <Input name="note" placeholder={t.system.moderationReason} variant="soft" className="min-w-0 flex-1 rounded-full" />
                  <Button type="submit" formAction={moderate.bind(null, f.id, "hide")} className="bg-none bg-foreground">{t.system.hide}</Button>
                  <Button type="submit" variant="soft" formAction={moderate.bind(null, f.id, "keep")}>{t.system.keep}</Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
