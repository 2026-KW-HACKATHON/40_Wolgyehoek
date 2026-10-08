import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { myInstitution } from "@/lib/queries";
import { InstitutionEntryForm } from "./forms";

export default async function OrgPage() {
  const [{ t }, institution] = await Promise.all([getT(), myInstitution()]);
  return <div className="mx-auto w-full max-w-lg space-y-5 px-4 py-8">
    <h1 className="text-2xl font-extrabold">{t.org.entryTitle}</h1>
    {institution ? <div className="space-y-3 rounded-2xl bg-muted p-5">
      <p className="break-words text-lg font-bold">{institution.name}</p>
      <p className="text-sm text-muted-foreground">{t.org.linked}</p>
      <Link href="/" className="inline-flex min-h-11 items-center text-sm font-bold text-primary">{t.org.browse}</Link>
    </div> : <>
      <p className="text-sm text-muted-foreground">{t.org.entryGuide}</p>
      <InstitutionEntryForm />
    </>}
  </div>;
}
