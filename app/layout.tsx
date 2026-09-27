import type { Metadata, Viewport } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { currentDevice } from "@/lib/device";
import { unreadCount } from "@/lib/queries";
import "./globals.css";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "동네서랍 — 월계1동 아이디어 수요 검증·기록",
  description: "월계1동의 지역 문제 해결 아이디어가 주민 수요를 확인하고, 결론을 기록해 다음 시도로 이어지게 하는 플랫폼",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await currentDevice();
  const unread = me ? await unreadCount(me.id) : 0;
  return (
    <html lang="ko" className={`${GeistSans.variable} ${GeistMono.variable} ${pretendard.variable}`}>
      <body className="min-h-dvh antialiased">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur" style={{ boxShadow: "0 1px 0 0 var(--ring)" }}>
          <nav className="mx-auto flex h-14 max-w-[1040px] items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-[-0.02em]">
              <DrawerMark />
              동네서랍
            </Link>
            <div className="flex items-center gap-1 text-sm font-medium">
              <Link href="/me" className="relative rounded-md px-3 py-2 text-ink-2 hover:bg-subtle hover:text-ink">
                내 참여
                {unread > 0 && (
                  <span className="tnum ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--step-4)] px-1.5 text-[11px] font-semibold text-white">{unread}</span>
                )}
              </Link>
              <Link href="/new" className="rounded-md bg-primary px-3 py-2 text-white transition-colors hover:bg-[var(--primary-hover)]">
                아이디어 올리기
              </Link>
            </div>
          </nav>
          {me?.isOperator && <div className="bg-ink py-1 text-center font-mono text-[11px] tracking-wider text-white">OPERATOR MODE · 운영자 모드</div>}
        </header>
        <main className="mx-auto w-full max-w-[1040px] px-4 pb-24 pt-8 sm:px-6">{children}</main>
        <footer className="mx-auto max-w-[1040px] px-4 pb-10 text-xs text-ink-3 sm:px-6">
          2026 광운대학교 KW해커톤 · 40조 월계획 · 결과는 비공식 의견 조사이며 공식 결정이 아닙니다.
        </footer>
      </body>
    </html>
  );
}

function DrawerMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="3" width="12" height="8" rx="2" fill="var(--step-4)" />
      <rect x="2.5" y="9" width="19" height="12.5" rx="2.5" fill="#fff" stroke="#171717" strokeWidth="1.8" />
      <rect x="9" y="14" width="6" height="1.8" rx="0.9" fill="#171717" />
    </svg>
  );
}
