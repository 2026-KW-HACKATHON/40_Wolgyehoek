import { getT } from "@/lib/i18n/server";
import { ButtonLink } from "@/components/ui";
export default async function NotFound() { const { t } = await getT(); return <div className="flex flex-col items-center gap-5 px-6 py-24 text-center"><h1 className="text-xl font-extrabold">{t.system.notFound}</h1><ButtonLink href="/" variant="secondary">{t.system.home}</ButtonLink></div>; }
