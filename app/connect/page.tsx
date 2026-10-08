import type { Metadata } from "next";
import { toolCatalog } from "@/lib/mcp/catalog";
import { getT } from "@/lib/i18n/server";
import { ConnectorPanel } from "./connect-guide";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: `${t.connect.title} · ${t.shell.brand}`, description: t.connect.lead };
}

export default async function ConnectPage() {
  const { t } = await getT();
  return <div className="mx-auto w-full max-w-[1200px] space-y-8 px-4 pt-8 md:px-8">
    <header>
      <h1 className="text-[34px] font-black tracking-[-0.04em]">{t.connect.title}</h1>
      <p className="mt-2 text-[17px] font-medium text-muted-foreground">{t.connect.lead}</p>
    </header>
    <ConnectorPanel tools={toolCatalog.map((tool) => tool.name)} />
  </div>;
}
