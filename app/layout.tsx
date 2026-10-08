import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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
  description: "지역 문제를 풀려는 청년 팀이 바로 쓸 수 있는 아이디어 온톨로지. 같은 문제를 누가, 어디서, 어떻게 시도했고 왜 멈췄는지 보고 시작합니다.",
  metadataBase: new URL("https://dongne-seorap.vercel.app"),
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await currentDevice();
  const unread = me ? await unreadCount() : 0;
  return <html lang="ko" className={pretendard.variable}><body className="antialiased"><AppShell unread={unread} nickname={me?.nickname} operator={!!me?.isOperator}>{children}</AppShell></body></html>;
}
