import { IntakeForm } from "@/components/intake/IntakeForm";

import { getT } from "@/lib/i18n/server";

export default async function NewPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ t }, { q }] = await Promise.all([getT(), searchParams]);
  return <div className="mx-auto w-full max-w-[1200px] px-8 py-8">
    <div className="mb-8">
      <h1 className="text-[28px] font-extrabold tracking-[-0.04em]">{t.intake.newTitle}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t.intake.newIntro}</p>
    </div>
    <IntakeForm initialText={q?.trim().slice(0, 500) ?? ""} />
  </div>;
}
