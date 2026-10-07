import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getWallet } from "@/lib/credits";
import { currentDevice } from "@/lib/device";
import { unreadCount } from "@/lib/queries";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "400 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "동네서랍",
  description: "매년 다시 나오는 동네 아이디어를 지난 시도·멈춘 이유·빈칸과 함께 보여주는 지역 아이디어의 기억",
  metadataBase: new URL("https://dongne-seorap.vercel.app"),
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await currentDevice();
  const unread = me ? await unreadCount() : 0;
  const wallet = me ? await getWallet() : null;
  return <html lang="ko" className={pretendard.variable}><body className="antialiased"><AppShell balance={wallet?.balance ?? 0} points={!!wallet?.enabled} unread={unread} nickname={me?.nickname} operator={!!me?.isOperator}>{children}</AppShell></body></html>;
}
