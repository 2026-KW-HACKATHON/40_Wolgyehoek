import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { currentDevice } from "@/lib/device";
import { unreadCount } from "@/lib/queries";
import { getT } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import { toolCatalog } from "@/lib/mcp/catalog";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "400 900",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.shell.brand, description: t.shell.description, metadataBase: new URL("https://dongne-seorap.vercel.app") };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

const tools = toolCatalog.map((tool) => tool.name);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ locale }, me] = await Promise.all([getT(), currentDevice()]);
  const unread = me ? await unreadCount() : 0;
  return <html lang={locale} className={pretendard.variable}><body className="antialiased">
    <I18nProvider locale={locale}>
      <AppShell unread={unread} nickname={me?.nickname} operator={!!me?.isOperator} tools={tools}>{children}</AppShell>
    </I18nProvider>
  </body></html>;
}
