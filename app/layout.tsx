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
  description: "월계1동의 지역 문제 해결 아이디어가 주민 수요를 확인하고, 결론을 기록해 다음 시도로 이어지게 하는 플랫폼",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fffaf3" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await currentDevice();
  const unread = me ? await unreadCount() : 0;
  const wallet = me ? await getWallet() : null;
  return <html lang="ko" className={pretendard.variable}><body className="antialiased"><AppShell balance={wallet?.balance ?? 0} unread={unread} nickname={me?.nickname} operator={!!me?.isOperator}>{children}</AppShell></body></html>;
}
