import type { CSSProperties, ReactNode } from 'react';
import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { useSlidePageNumber } from '@open-slide/core';
import mark from './assets/mark.svg';
import deskExplore from './assets/desk-explore.png';
import deskIntake from './assets/desk-intake.png';
import deskIntakeNext from './assets/desk-intake-next.png';
import deskLeave from './assets/desk-leave.png';
import deskLeaveNext from './assets/desk-leave-next.png';
import deskProblem from './assets/desk-problem.png';
import deskProblemNext from './assets/desk-problem-next.png';
import deskReport from './assets/desk-report.png';
import agentChat from './assets/agent-chat.png';
import teamCollage from './assets/team-collage.png';
import qrTeams from './assets/qr-teams.png';
import rep0 from './assets/rep-1.png';
import rep1 from './assets/rep-6.png';
import rep2 from './assets/rep-9.png';
import rep3 from './assets/rep-12.png';
import rep4 from './assets/rep-19.png';
import rep5 from './assets/rep-25.png';
import rep6 from './assets/rep-32.png';
import rep7 from './assets/rep-35.png';
import rep8 from './assets/rep-37.png';
import logoClaude from './assets/logos/claude.svg';
import logoChatgpt from './assets/logos/chatgpt.svg';
import logoCursor from './assets/logos/cursor.svg';
import logoClaudeCode from './assets/logos/claude-code.svg';
import logoCodex from './assets/logos/codex.svg';

export const design: DesignSystem = {
  palette: { bg: '#ffffff', text: '#212124', accent: '#ff6f0f' },
  fonts: {
    display: '"Pretendard Variable", Pretendard, -apple-system, sans-serif',
    body: '"Pretendard Variable", Pretendard, -apple-system, sans-serif',
  },
  typeScale: { hero: 168, body: 40 },
  radius: 28,
};

const sub = '#4d5159';
const muted = '#868b94';
const line = '#eaebee';
const soft = '#f2f3f6';
const tint = '#fff1e7';
const dark = '#141416';
const accentText = '#e8650e';

const FONT_URL = new URL('./assets/PretendardVariable.woff2', import.meta.url).href;
const FONT_STYLE_ID = 'osd-webfont-dongne-seorap-pitch';
const fontCss = `@font-face{font-family:"Pretendard Variable";src:url("${FONT_URL}") format("woff2-variations");font-weight:45 920;font-display:block;}`;
if (typeof document !== 'undefined') {
  let style = document.getElementById(FONT_STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = FONT_STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== fontCss) style.textContent = fontCss;
}

const PAD_X = 140;

const fill: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  fontFamily: 'var(--osd-font-body)',
  color: 'var(--osd-text)',
  background: 'var(--osd-bg)',
  letterSpacing: '-0.02em',
  wordBreak: 'keep-all',
};

const eyebrow: CSSProperties = { fontSize: 30, fontWeight: 700, color: accentText, margin: 0 };
const heading: CSSProperties = {
  fontFamily: 'var(--osd-font-display)',
  fontSize: 76,
  fontWeight: 850,
  lineHeight: 1.2,
  letterSpacing: '-0.04em',
  margin: '24px 0 0',
};

const Footer = ({ onDark = false }: { onDark?: boolean }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: PAD_X,
        right: PAD_X,
        bottom: 52,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 22,
        fontWeight: 600,
        color: onDark ? '#868b94' : muted,
      }}
    >
      <span>동네서랍</span>
      <span>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};


const Browser = ({ src, path, width, left, top }: { src: string; path: string; width: number; left: number; top: number }) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width,
      borderRadius: 18,
      overflow: 'hidden',
      background: '#ffffff',
      boxShadow: '0 30px 80px rgba(20,20,22,0.16), 0 0 0 1px rgba(20,20,22,0.06)',
    }}
  >
    <div style={{ height: 44, display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px', background: soft }}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
      <span style={{ marginLeft: 16, fontSize: 18, fontWeight: 600, color: muted, background: '#ffffff', borderRadius: 999, padding: '4px 18px' }}>
        dongne-seorap.vercel.app{path}
      </span>
    </div>
    <img src={src} alt="" style={{ display: 'block', width, height: Math.round((width * 900) / 1440) }} />
  </div>
);

const Column = ({ left, width, children }: { left: number; width: number; children: ReactNode }) => (
  <div
    style={{
      position: 'absolute',
      left,
      top: 0,
      bottom: 0,
      width,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    {children}
  </div>
);



const Title = ({ kicker, children, onDark = false, top = 110 }: { kicker: string; children: ReactNode; onDark?: boolean; top?: number }) => (
  <div style={{ position: 'absolute', left: PAD_X, right: PAD_X, top }}>
    <p style={{ ...eyebrow, color: onDark ? 'var(--osd-accent)' : accentText }}>{kicker}</p>
    <h2 style={{ ...heading, fontSize: 66, color: onDark ? '#ffffff' : 'var(--osd-text)' }}>{children}</h2>
  </div>
);

/* 1. 표지 */
const Cover: Page = () => (
  <div style={fill}>
    <Column left={PAD_X} width={780}>
      <img src={mark} alt="" style={{ width: 128, height: 128 }} />
      <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 'var(--osd-size-hero)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1.05, margin: '40px 0 0' }}>동네서랍</h1>
      <p style={{ fontSize: 56, fontWeight: 850, color: accentText, margin: '28px 0 0', letterSpacing: '-0.03em' }}>아이디어 전에, 문제부터</p>
      <p style={{ fontSize: 32, fontWeight: 750, color: sub, margin: '22px 0 0', lineHeight: 1.4 }}>정책·예산·이해관계인·선례를 대신 찾아 주는<br />지역 문제 조사 에이전트</p>
      <p style={{ fontSize: 26, fontWeight: 600, color: muted, margin: '56px 0 0' }}>2026 KW해커톤 · 40조 월계획</p>
    </Column>
    <Browser src={deskExplore} path="" width={900} left={900} top={250} />
  </div>
);

/* 2. 저희 이야기: 처음 아이디어였던 광운대 앞 플리마켓 */
const ourOrder = ['문제를 고른다', '아이디어를 낸다', '설문을 돌린다', '발표한다'];
const skipped = ['정책', '예산', '이해관계인', '선례'];
const ourPast = [
  { y: '2019', t: '광운대 주민 플리마켓' },
  { y: '2022', t: '주민 협업 플리마켓' },
  { y: '2024', t: '월계1동 한마음축제 마켓' },
];
const Hook: Page = () => (
  <div style={{ ...fill, background: dark, color: '#ffffff' }}>
    <Title kicker="문제 정의" onDark>지역사회 문제, 저희는 이렇게 접근했습니다</Title>
    <div style={{ position: 'absolute', left: PAD_X, top: 330, display: 'flex', alignItems: 'center', gap: 18 }}>
      {ourOrder.map((o, i) => (
        <div key={o} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ background: '#2a2a2f', borderRadius: 999, padding: '20px 32px', fontSize: 32, fontWeight: 850 }}>{o}</span>
          {i < 3 && <span style={{ fontSize: 40, fontWeight: 900, color: '#5a5d66' }}>›</span>}
        </div>
      ))}
    </div>
    <p style={{ position: 'absolute', left: PAD_X, top: 436, margin: 0, fontSize: 26, fontWeight: 700, color: '#868b94' }}>한 학기 동안 저희가 밟은 순서입니다</p>
    <div style={{ position: 'absolute', left: PAD_X, top: 520, right: PAD_X, borderTop: '2px solid #34343a', paddingTop: 44 }}>
      <div style={{ fontSize: 34, fontWeight: 850, color: '#ff6f0f' }}>한 번도 확인하지 않은 것</div>
      <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
        {skipped.map((k) => (
          <div key={k} style={{ flex: 1, border: '3px dashed #ff6f0f', borderRadius: 28, padding: '28px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 900 }}>{k}</div>
            <div style={{ fontSize: 24, fontWeight: 750, color: '#868b94', marginTop: 8 }}>확인 못 함</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ position: 'absolute', left: PAD_X, right: PAD_X, top: 810 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#b0b3ba' }}>그래서 몰랐습니다 — 같은 플리마켓이 이미 세 번 열렸다는 것을</div>
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        {ourPast.map((p) => (
          <span key={p.y} style={{ background: '#2a2a2f', borderRadius: 18, padding: '16px 24px', fontSize: 26, fontWeight: 800 }}>
            <span style={{ color: '#ff6f0f', marginRight: 12 }}>{p.y}</span>{p.t}
          </span>
        ))}
      </div>
    </div>
    <Footer onDark />
  </div>
);

/* 3. 흩어진 네 가지 */
const pillars = [
  { k: '정책', s: '무엇이 이미 있나', n: '구청 공지 · 사업 계획 · 조례', c: 57 },
  { k: '예산', s: '돈이 어디서 나오나', n: '주민참여예산 · 구 예산서', c: 25 },
  { k: '이해관계인', s: '누가 쥐고 있나', n: '담당 부서 · 주민자치회 · 상인회', c: 60 },
  { k: '선례', s: '다른 동네는 어떻게 했나', n: '국내외 사례', c: 20 },
];
const Pillar = ({ i }: { i: number }) => {
  const o = '#ff6f0f';
  if (i === 0) return (
    <svg width={190} height={150} viewBox="0 0 190 150">
      <rect x="34" y="14" width="106" height="130" rx="10" fill="#ffffff" stroke={o} strokeWidth="5" />
      <rect x="54" y="40" width="66" height="7" rx="3.5" fill="#ffd0ad" />
      <rect x="54" y="60" width="66" height="7" rx="3.5" fill="#ffd0ad" />
      <rect x="54" y="80" width="42" height="7" rx="3.5" fill="#ffd0ad" />
      <circle cx="132" cy="112" r="26" fill={o} opacity="0.18" />
      <circle cx="132" cy="112" r="18" fill="none" stroke={o} strokeWidth="5" />
    </svg>
  );
  if (i === 1) return (
    <svg width={190} height={150} viewBox="0 0 190 150">
      <rect x="28" y="92" width="34" height="48" rx="6" fill="#ffd0ad" />
      <rect x="76" y="62" width="34" height="78" rx="6" fill="#ffb37f" />
      <rect x="124" y="30" width="34" height="110" rx="6" fill={o} />
      <circle cx="141" cy="18" r="14" fill="#ffffff" stroke={o} strokeWidth="5" />
    </svg>
  );
  if (i === 2) return (
    <svg width={190} height={150} viewBox="0 0 190 150">
      {[40, 95, 150].map((cx, k) => (
        <g key={cx}>
          <circle cx={cx} cy={k === 1 ? 52 : 64} r={k === 1 ? 24 : 20} fill={k === 1 ? o : '#ffd0ad'} />
          <path d={'M' + (cx - (k === 1 ? 32 : 27)) + ' ' + (k === 1 ? 128 : 134) + ' a' + (k === 1 ? 32 : 27) + ' ' + (k === 1 ? 38 : 32) + ' 0 0 1 ' + (k === 1 ? 64 : 54) + ' 0 z'} fill={k === 1 ? o : '#ffd0ad'} />
        </g>
      ))}
      <path d="M118 22 h54 a8 8 0 0 1 8 8 v22 a8 8 0 0 1 -8 8 h-30 l-12 12 v-12 h-12 a8 8 0 0 1 -8 -8 v-22 a8 8 0 0 1 8 -8 z" fill="#ffffff" stroke={o} strokeWidth="4" />
    </svg>
  );
  return (
    <svg width={190} height={150} viewBox="0 0 190 150">
      <path d="M26 112 C66 58, 118 142, 164 48" fill="none" stroke={o} strokeWidth="5" strokeDasharray="12 10" />
      {[[26, 112], [164, 48]].map(([x, y], k) => (
        <g key={k}>
          <path d={'M' + x + ' ' + (y - 34) + ' a20 20 0 0 1 20 20 c0 14 -20 32 -20 32 c0 0 -20 -18 -20 -32 a20 20 0 0 1 20 -20 z'} fill={k === 0 ? '#ffd0ad' : o} />
          <circle cx={x} cy={y - 14} r="7" fill="#ffffff" />
        </g>
      ))}
    </svg>
  );
};
const Repeat: Page = () => (
  <div style={{ ...fill, background: soft }}>
    <Title kicker="지역사회 문제의 특성">아이디어보다 먼저, 이 네 가지가 얽혀 있습니다</Title>
    <div style={{ position: 'absolute', left: PAD_X, right: PAD_X, top: 330, display: 'flex', gap: 24 }}>
      {pillars.map((p, i) => (
        <div key={p.k} style={{ flex: 1, background: '#ffffff', borderRadius: 36, boxShadow: '0 20px 50px rgba(20,20,22,0.10)', padding: '34px 30px 30px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Pillar i={i} /></div>
          <div style={{ fontSize: 42, fontWeight: 900, marginTop: 18 }}>{p.k}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: accentText, marginTop: 8 }}>{p.s}</div>
          <div style={{ fontSize: 23, fontWeight: 700, color: muted, marginTop: 14, lineHeight: 1.4 }}>{p.n}</div>
        </div>
      ))}
    </div>
    <p style={{ position: 'absolute', left: PAD_X, right: PAD_X, top: 840, margin: 0, fontSize: 34, fontWeight: 850, textAlign: 'center' }}>네 가지가 서로 다른 곳에 흩어져 있어, 한 번에 보는 방법이 없습니다</p>
    <p style={{ position: 'absolute', left: PAD_X, bottom: 105, margin: 0, fontSize: 22, color: muted }}>월계1동·노원구 공개 자료를 원문으로 확인해 모은 기록 160건 · 출처 60곳</p>
    <Footer />
  </div>
);

/* 4. 멈춘 이유는 회의록 속에 */
const HID = { total: 160, reasons: 20, council: 17 };
const Zero: Page = () => (
  <div style={{ ...fill, background: dark, color: '#ffffff' }}>
    <Title kicker="그런데" onDark>멈춘 이유는, 회의록 속 답변에 묻혀 있었습니다</Title>
    <div style={{ position: 'absolute', left: PAD_X, top: 330, width: 700, display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: 8 }}>
      {Array.from({ length: HID.total }, (_, i) => {
        const hit = i % 8 === 3 && i < HID.reasons * 8;
        const council = hit && Math.floor(i / 8) < HID.council;
        return <span key={i} style={{ height: 40, borderRadius: 8, background: hit ? (council ? '#ff6f0f' : '#ffb37f') : '#2a2a2f' }} />;
      })}
    </div>
    <svg width={420} height={470} viewBox="0 0 420 470" style={{ position: 'absolute', left: 860, top: 320 }}>
      <rect x="40" y="20" width="320" height="420" rx="16" fill="#ffffff" />
      <rect x="76" y="60" width="150" height="12" rx="6" fill="#d1d3d8" />
      {[110, 140, 170, 290, 320, 350, 380].map((y) => <rect key={y} x="76" y={y} width={y > 280 ? 230 : 250} height="10" rx="5" fill="#e6e7ea" />)}
      <rect x="62" y="200" width="296" height="66" rx="10" fill="#ffe3cf" />
      <rect x="62" y="200" width="7" height="66" rx="3.5" fill="#ff6f0f" />
      <text x="84" y="228" fontSize="20" fontWeight="800" fill="#ff6f0f">과장 답변</text>
      <text x="84" y="254" fontSize="19" fontWeight="700" fill="#2a2a2f">“재정 형편이 어려워 폐지했습니다”</text>
      <circle cx="320" cy="400" r="54" fill="none" stroke="#ff6f0f" strokeWidth="8" />
      <line x1="358" y1="438" x2="398" y2="478" stroke="#ff6f0f" strokeWidth="12" strokeLinecap="round" />
    </svg>
    <div style={{ position: 'absolute', left: 1340, top: 340, width: 470 }}>
      <div style={{ fontSize: 26, fontWeight: 750, color: '#b0b3ba' }}>공개 기록 {HID.total}건 중 멈춘 이유가 확인된 기록</div>
      <div style={{ fontSize: 150, fontWeight: 900, color: '#ff6f0f', lineHeight: 1.05, letterSpacing: '-0.04em' }}>{HID.reasons}건</div>
      <div style={{ fontSize: 34, fontWeight: 850, marginTop: 18 }}>그중 <span style={{ color: '#ff6f0f' }}>{HID.council}건</span>은 구의회 회의록 속 답변</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#b0b3ba', marginTop: 22, lineHeight: 1.5 }}>사업 공고와 기사에는 시작만 남고,<br />왜 멈췄는지는 질의응답에만 남습니다</div>
    </div>
    <p style={{ position: 'absolute', left: PAD_X, bottom: 110, margin: 0, fontSize: 22, color: '#868b94' }}>주황 = 구의회 회의록에서 확인한 멈춘 이유 · 연한 주황 = 그 밖의 출처 · 예산·공간 부족 11 · 수요 부족 2 · 기타 12(중복 포함)</p>
    <Footer onDark />
  </div>
);

/* 5. 한 팀의 한 학기 */
const painRows = [
  { q: '무엇이 이미 있는지 모른다', a: '구청 공지·사업 계획을 어디서 보는지 모른다' },
  { q: '왜 멈췄는지 모른다', a: '회의록 답변까지 찾아 읽을 시간이 없다' },
  { q: '누구에게 물어볼지 모른다', a: '담당 부서 이름조차 알기 어렵다' },
];
const Persona: Page = () => (
  <div style={{ ...fill, background: dark, color: '#ffffff' }}>
    <Title kicker="페르소나" onDark>지역사회 문제를 직접 풀어보려는 청년</Title>
    <svg width={380} height={380} viewBox="0 0 420 420" style={{ position: 'absolute', left: 170, top: 400 }}>
      <circle cx="210" cy="210" r="190" fill="#2a2a2f" />
      <circle cx="210" cy="160" r="72" fill="#ff6f0f" />
      <path d="M100 360 a110 120 0 0 1 220 0 z" fill="#ff6f0f" />
      <path d="M236 92 h108 a12 12 0 0 1 12 12 v56 a12 12 0 0 1 -12 12 h-52 l-20 22 v-22 h-36 a12 12 0 0 1 -12 -12 v-56 a12 12 0 0 1 12 -12 z" fill="#ffffff" />
      <text x="258" y="130" fontSize="22" fontWeight="800" fill="#2a2a2f">우리 동네,</text>
      <text x="258" y="158" fontSize="22" fontWeight="800" fill="#2a2a2f">이건 바꿔보고 싶다</text>
    </svg>
    <div style={{ position: 'absolute', left: 640, top: 310, width: 1140 }}>
      <div style={{ fontSize: 34, fontWeight: 850, color: '#ff6f0f' }}>광운대 3학년 · 월계1동에서 무언가 해보려는 팀</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#868b94', marginTop: 10 }}>수업 과제일 수도, 공모전일 수도, 그냥 불편해서일 수도 있습니다</div>
      <div style={{ marginTop: 26 }}>
        {painRows.map((r, i) => (
          <div key={r.q} style={{ display: 'flex', alignItems: 'center', gap: 24, background: '#2a2a2f', borderRadius: 26, padding: '20px 32px', marginBottom: 14 }}>
            <span style={{ flexShrink: 0, width: 54, height: 54, borderRadius: '50%', background: '#ff6f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900 }}>{i + 1}</span>
            <span><span style={{ display: 'block', fontSize: 36, fontWeight: 900 }}>{r.q}</span><span style={{ display: 'block', fontSize: 24, fontWeight: 700, color: '#868b94', marginTop: 6 }}>{r.a}</span></span>
          </div>
        ))}
      </div>
      <div style={{ background: '#ffffff', color: dark, borderRadius: 26, padding: '20px 30px', marginTop: 8, fontSize: 30, fontWeight: 900 }}>
        결국 아이디어부터 내고, 발표날에 듣습니다 — “그거, 운영할 사람이 없어서 멈췄었어요.”
      </div>
    </div>
    <p style={{ position: 'absolute', left: PAD_X, bottom: 100, margin: 0, fontSize: 22, color: '#868b94' }}>저희 팀과 이 자리 참가자들이 실제로 겪은 상황</p>
    <Footer onDark />
  </div>
);

/* 6. 왜 지금 방법으로는 안 될까 */
const alts = [
  { n: '검색 · ChatGPT', d: '기사로 남은 성공만 찾음', ok: false },
  { n: '사업 결과 보고서', d: '기관 안에 갇히고 제각각', ok: false },
  { n: '동네서랍 에이전트', d: '회의록 속 이유까지 찾아 정리', ok: true },
];
const Alternatives: Page = () => (
  <div style={fill}>
    <Title kicker="왜 지금 방법으론 안 될까">없는 기록은, AI도 찾을 수 없습니다</Title>
    <div style={{ position: 'absolute', left: PAD_X, right: PAD_X, top: 380, display: 'flex', gap: 32 }}>
      {alts.map((a) => (
        <div key={a.n} style={{ flex: 1, height: 460, borderRadius: 'var(--osd-radius)', background: a.ok ? tint : soft, border: a.ok ? '4px solid #ff6f0f' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: a.ok ? accentText : 'var(--osd-text)' }}>{a.n}</div>
          <div style={{ width: 150, height: 150, borderRadius: '50%', background: a.ok ? '#ff6f0f' : '#ffffff', color: a.ok ? '#ffffff' : '#b0b3ba', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 92, fontWeight: 900 }}>{a.ok ? '✓' : '✕'}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: muted }}>멈춘 이유</div>
          <div style={{ fontSize: 30, fontWeight: 750, color: sub }}>{a.d}</div>
        </div>
      ))}
    </div>
    <Footer />
  </div>
);

/* 7. 해결: 닫힌 고리 */
const ring = [
  { t: '수집', s: '공고·회의록·기사를 정기적으로', a: -90 },
  { t: '팀이 남김', s: '과제를 내면 결과와 멈춘 이유가', a: 30 },
  { t: '기관이 응답', s: '공감·지원·협력 의사를', a: 150 },
];
const RC = { x: 960, y: 640, r: 280 };
const Solution: Page = () => (
  <div style={fill}>
    <Title kicker="에이전트는 계속 똑똑해집니다">수집하고, 남기고, 응답할수록 에이전트가 자랍니다</Title>
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs><marker id="ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ff6f0f" /></marker></defs>
      {ring.map((n, i) => {
        const a1 = ((n.a + 26) * Math.PI) / 180;
        const a2 = ((ring[(i + 1) % 3].a - 26 + (i === 2 ? 360 : 0)) * Math.PI) / 180;
        const p = (a: number) => [RC.x + Math.cos(a) * RC.r, RC.y + Math.sin(a) * RC.r];
        const [x1, y1] = p(a1);
        const [x2, y2] = p(a2);
        return <path key={n.t} d={'M' + x1 + ' ' + y1 + ' A' + RC.r + ' ' + RC.r + ' 0 0 1 ' + x2 + ' ' + y2} fill="none" stroke="#ff6f0f" strokeWidth={7} markerEnd="url(#ar2)" />;
      })}
    </svg>
    <img src={mark} alt="" style={{ position: 'absolute', left: RC.x - 80, top: RC.y - 80, width: 160, height: 160 }} />
    {ring.map((n) => {
      const a = (n.a * Math.PI) / 180;
      const x = RC.x + Math.cos(a) * RC.r;
      const y = RC.y + Math.sin(a) * RC.r;
      return (
        <div key={n.t} style={{ position: 'absolute', left: x - 190, top: y - 62, width: 380, height: 124, borderRadius: 28, background: '#ffffff', boxShadow: '0 16px 40px rgba(20,20,22,0.10), 0 0 0 2px #ffd9bf', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: accentText }}>{n.t}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: sub, marginTop: 4 }}>{n.s}</div>
        </div>
      );
    })}
    <Footer />
  </div>
);

/* 8. 문제 하나에 네 층이 모인다 */
const layers = [
  { k: '정책', c: '#ff6f0f', x: 140, y: 300, items: ['월계1동 똑똑똑돌봄단 · 연계 882건', 'AI 자동전화 안부확인 · 스마트플러그'] },
  { k: '행정', c: '#e8650e', x: 1180, y: 300, items: ['든든한 동행 확대 보류', '예산 미확보 · 일부 동 신청자 적음 (구의회 2024)'] },
  { k: '시도', c: '#4cb3ff', x: 140, y: 690, items: ['2020 수업 과제 이팔청춘 · 결과 미확인', '2023 주민 제안 「든든한 동행 함께 걸음」 · 선정'] },
  { k: '다른 지역', c: '#1aa174', x: 1180, y: 690, items: ['대구 대학생 안부 확인표 · 시행', '전주 AI 안부전화 · 1년 시범 후 멈춤'] },
];
const Ontology: Page = () => (
  <div style={fill}>
    <Title kicker="예: 홀몸 어르신 안부">문제 하나에, 정책·행정·시도·선례가 모입니다</Title>
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {layers.map((l) => <line key={l.k} x1={960} y1={640} x2={l.x < 900 ? 740 : 1180} y2={l.y + 90} stroke={l.c} strokeWidth={5} strokeDasharray="10 8" />)}
    </svg>
    <div style={{ position: 'absolute', left: 960 - 150, top: 640 - 150, width: 300, height: 300, borderRadius: '50%', background: '#ff6f0f', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <span style={{ fontSize: 26, fontWeight: 800, opacity: 0.85 }}>문제</span>
      <span style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.2 }}>홀몸 어르신<br />안부·고립</span>
    </div>
    {layers.map((l) => (
      <div key={l.k} style={{ position: 'absolute', left: l.x, top: l.y, width: 600, borderRadius: 28, background: '#ffffff', boxShadow: '0 14px 40px rgba(20,20,22,0.09), 0 0 0 3px ' + l.c + '33', padding: '26px 32px', boxSizing: 'border-box' }}>
        <span style={{ display: 'inline-block', fontSize: 24, fontWeight: 900, color: '#ffffff', background: l.c, borderRadius: 999, padding: '4px 18px' }}>{l.k}</span>
        {l.items.map((t) => <div key={t} style={{ fontSize: 27, fontWeight: 750, marginTop: 12, lineHeight: 1.35 }}>{t}</div>)}
      </div>
    ))}
    <Footer />
  </div>
);

/* 9. 데모: 문제를 적는 순간 */
const DemoIntake: Page = () => (
  <div style={{ ...fill, background: soft }}>
    <Title kicker="데모 ① · 에이전트">문제 한 줄이면, 에이전트가 네 가지를 찾아옵니다</Title>
    <Browser src={deskIntakeNext} path="/new" width={1360} left={280} top={300} />
    <div style={{ position: 'absolute', left: 280 + 1360 * 0.588, top: 344 + 850 * 0.424, width: 1360 * 0.296, height: 248, border: '5px solid #ff6f0f', borderRadius: 18, boxShadow: '0 0 0 8px rgba(255,111,15,0.18)' }} />
    <Footer />
  </div>
);

/* 10. 데모: 문제 화면 */
const DemoLeave: Page = () => (
  <div style={{ ...fill, background: soft }}>
    <Title kicker="데모 ②">문제 화면에도, 확인거리와 물어볼 곳이 함께 있습니다</Title>
    <Browser src={deskProblemNext} path="/problems/ELDER.WIDE" width={1360} left={280} top={300} />
    <div style={{ position: 'absolute', left: 280 + 1360 * 0.068, top: 344 + 850 * 0.342, width: 1360 * 0.495, height: 268, border: '5px solid #ff6f0f', borderRadius: 18, boxShadow: '0 0 0 8px rgba(255,111,15,0.18)' }} />
    <Footer />
  </div>
);

/* 11. 데모: 지역 리포트 */
const DemoReport: Page = () => (
  <div style={{ ...fill, background: soft }}>
    <Title kicker="데모 ③ · 주민센터·구청">같은 에이전트가 지역 전체 리포트도 씁니다</Title>
    <Browser src={deskReport} path="/report" width={1360} left={280} top={300} />
    <Footer />
  </div>
);

/* 11. 기록이 쌓이고 AI에서 꺼내 쓴다 */
const srcPiles = [
  { k: '정책', n: 57, s: '구청 공지 · 사업 PDF' },
  { k: '행정', n: 25, s: '구의회 회의록' },
  { k: '시도', n: 78, s: '주민·대학·청년 프로젝트' },
  { k: '다른 지역', n: 20, s: '국내외 사례' },
];
const facets = ['니즈', '장소', '대상', '멈춘 이유'];
const aiLogos = [logoClaude, logoChatgpt, logoCursor, logoClaudeCode, logoCodex];
const mapNodes = [
  { x: 0, y: 0, r: 34, hot: true },
  { x: -96, y: -74, r: 20 }, { x: 94, y: -62, r: 20 }, { x: -104, y: 66, r: 20 }, { x: 86, y: 80, r: 20 },
  { x: -178, y: -8, r: 14 }, { x: 170, y: 10, r: 14 }, { x: -24, y: -140, r: 14 }, { x: 18, y: 142, r: 14 },
];
const Pipeline: Page = () => (
  <div style={fill}>
    <Title kicker="에이전트가 쓰는 재료">흩어진 기록을 속성으로 쪼개, 에이전트가 꺼내 씁니다</Title>
    <div style={{ position: 'absolute', left: PAD_X, top: 330, width: 430 }}>
      {srcPiles.map((p) => (
        <div key={p.k} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#ffffff', borderRadius: 20, padding: '16px 20px', boxShadow: '0 10px 26px rgba(20,20,22,0.09)', marginBottom: 14 }}>
          <span style={{ width: 54, height: 66, borderRadius: 8, background: tint, borderLeft: '6px solid #ff6f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: accentText }}>{p.n}</span>
          <span><span style={{ display: 'block', fontSize: 30, fontWeight: 900 }}>{p.k}</span><span style={{ display: 'block', fontSize: 20, fontWeight: 700, color: muted, marginTop: 2 }}>{p.s}</span></span>
        </div>
      ))}
    </div>
    <span style={{ position: 'absolute', left: 640, top: 530, fontSize: 56, fontWeight: 900, color: '#ffb37f' }}>›</span>
    <div style={{ position: 'absolute', left: 720, top: 360, width: 300 }}>
      <div style={{ fontSize: 28, fontWeight: 900 }}>속성으로 쪼갠다</div>
      <div style={{ marginTop: 16 }}>
        {facets.map((f) => <span key={f} style={{ display: 'inline-block', background: tint, color: accentText, borderRadius: 999, padding: '12px 22px', fontSize: 26, fontWeight: 850, marginRight: 10, marginBottom: 10 }}>{f}</span>)}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: muted, marginTop: 10, lineHeight: 1.4 }}>지역 이름이 아니라 속성이라,<br />다른 동네 기록과 바로 이어집니다</div>
    </div>
    <span style={{ position: 'absolute', left: 1040, top: 530, fontSize: 56, fontWeight: 900, color: '#ffb37f' }}>›</span>
    <svg width={400} height={360} style={{ position: 'absolute', left: 1120, top: 360 }}>
      {mapNodes.slice(1).map((n, i) => <line key={i} x1={200} y1={180} x2={200 + n.x} y2={180 + n.y} stroke="#ffb37f" strokeWidth={3} />)}
      {mapNodes.map((n, i) => <circle key={i} cx={200 + n.x} cy={180 + n.y} r={n.r} fill={n.hot ? '#ff6f0f' : '#ffd9bd'} />)}
    </svg>
    <div style={{ position: 'absolute', left: 1120, top: 720, width: 400, textAlign: 'center', fontSize: 28, fontWeight: 900 }}>문제 단위 지식 지도</div>
    <div style={{ position: 'absolute', left: 1540, top: 360, width: 300 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 12 }}>
        {aiLogos.map((l, i) => <span key={i} style={{ width: 72, height: 72, borderRadius: 18, background: '#ffffff', boxShadow: '0 6px 18px rgba(20,20,22,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={l} alt="" style={{ width: 40, height: 40 }} /></span>)}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 18 }}>쓰던 AI에서 바로</div>
      <div style={{ background: dark, color: '#ffffff', borderRadius: 20, padding: '16px 20px', fontSize: 22, fontWeight: 750, marginTop: 14, lineHeight: 1.4 }}>“다른 동네는 이 문제를 어떻게 풀었어?”</div>
      <div style={{ background: tint, color: 'var(--osd-text)', borderRadius: 20, padding: '16px 20px', fontSize: 22, fontWeight: 750, marginTop: 10, lineHeight: 1.4 }}>전주는 AI 안부전화를 1년 시범 뒤 중단, 광주 북구는 우유 배달로 전환</div>
    </div>
    <p style={{ position: 'absolute', left: PAD_X, bottom: 100, margin: 0, fontSize: 20, color: muted }}>지금: 월계1동·노원구 기록 160 · 출처 60 · 국내외 사례 20 · 니즈 20 · 장소 15 · 정기 자동 수집은 다음 단계</p>
    <Footer />
  </div>
);

/* 12. 실증: 37팀 */
const fan = [
  { i: 0, left: 60, top: 420, rot: -9, z: 1 },
  { i: 1, left: 210, top: 380, rot: -6, z: 2 },
  { i: 2, left: 360, top: 350, rot: -3, z: 3 },
  { i: 3, left: 510, top: 332, rot: -1, z: 4 },
  { i: 4, left: 1160, top: 332, rot: 1, z: 4 },
  { i: 5, left: 1310, top: 350, rot: 3, z: 3 },
  { i: 6, left: 1460, top: 380, rot: 6, z: 2 },
  { i: 7, left: 1610, top: 420, rot: 9, z: 1 },
];
const repImgs = [rep0, rep1, rep2, rep3, rep4, rep5, rep6, rep7, rep8];
const Reports: Page = () => (
  <div style={{ ...fill, background: soft }}>
    <Title kicker="직접 해보세요">지금 QR로, 우리 팀 기록을 열어보세요</Title>
    {fan.map((f) => (
      <div key={f.i} style={{ position: 'absolute', left: f.left, top: f.top, width: 300, height: 400, borderRadius: 22, overflow: 'hidden', background: '#ffffff', boxShadow: '0 18px 44px rgba(20,20,22,0.14)', transform: 'rotate(' + f.rot + 'deg)', zIndex: f.z }}>
        <img src={repImgs[f.i]} alt="" style={{ width: 300, height: 400, objectFit: 'cover', objectPosition: 'top' }} />
      </div>
    ))}
    <div style={{ position: 'absolute', left: 760, top: 330, width: 400, background: '#ffffff', borderRadius: 'var(--osd-radius)', padding: '34px 0 28px', boxShadow: '0 24px 60px rgba(20,20,22,0.18)', textAlign: 'center', zIndex: 10 }}>
      <img src={qrTeams} alt="" style={{ width: 300, height: 300 }} />
      <div style={{ fontSize: 26, fontWeight: 900, marginTop: 16 }}>dongne-seorap.vercel.app/teams</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accentText, marginTop: 10 }}>이 자리 모든 팀의 기록</div>
    </div>
    <p style={{ position: 'absolute', left: PAD_X, right: PAD_X, bottom: 105, margin: 0, textAlign: 'center', fontSize: 28, fontWeight: 800, color: sub }}>먼저 있던 시도 · 멈춘 이유 · 물어볼 곳 — 구청 공지와 구의회 회의록에서 그대로 꺼냈습니다</p>
    <Footer />
  </div>
);

/* 13. 사업 모델: 순환 */
const costRows = [
  { k: '리서치 업체', v: '200~400만원', s: '선행 사례·수요 조사 1건 · 3~6주' },
  { k: '프리랜서 데스크 리서치', v: '30만원 안팎', s: '자료 조사 대행 평균 · 며칠' },
  { k: '동네서랍', v: '1달러', s: '속성 조합 3개 조회 · 즉시', hot: true },
];
const market = [
  { k: 'TAM', t: '전국', v: '연 700만 달러', s: '대학 재학생 234만 명 · 지자체 243곳' },
  { k: 'SAM', t: '수도권', v: '연 180만 달러', s: '수도권 대학 재학생 60만 명 · 서울 25개 구' },
  { k: 'SOM', t: '1~3년차', v: '연 21만 달러', s: '노원구 + 서울 북부 대학 5곳 · 재학생 7만 명' },
];
const Business: Page = () => (
  <div style={fill}>
    <Title kicker="사업 모델">에이전트 리포트 한 건, 1달러</Title>
    <div style={{ position: 'absolute', left: PAD_X, top: 310, width: 880 }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: accentText, marginBottom: 14 }}>같은 조사를 하면 얼마가 드나</div>
      {costRows.map((r) => (
        <div key={r.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, background: r.hot ? dark : '#ffffff', color: r.hot ? '#ffffff' : 'var(--osd-text)', borderRadius: 'var(--osd-radius)', padding: '22px 28px', boxShadow: r.hot ? 'none' : '0 12px 30px rgba(20,20,22,0.08)', marginBottom: 14 }}>
          <span><span style={{ display: 'block', fontSize: 30, fontWeight: 900 }}>{r.k}</span><span style={{ display: 'block', fontSize: 22, fontWeight: 700, color: r.hot ? '#868b94' : muted, marginTop: 4 }}>{r.s}</span></span>
          <span style={{ fontSize: r.hot ? 52 : 38, fontWeight: 900, color: r.hot ? '#ff8a3d' : accentText, whiteSpace: 'nowrap' }}>{r.v}</span>
        </div>
      ))}
      <p style={{ margin: '16px 0 0', fontSize: 24, fontWeight: 750, color: sub }}>리포트 1건 = 문제 속성(니즈·장소·대상) 조합 3개 조회. 쌓인 기록을 다시 쓰기 때문에 한 건 더 내는 데 드는 돈이 거의 없습니다</p>
    </div>
    <div style={{ position: 'absolute', left: 1080, top: 310, width: 720 }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: accentText, marginBottom: 14 }}>시장 규모</div>
      {market.map((m, i) => (
        <div key={m.k} style={{ display: 'flex', alignItems: 'center', gap: 22, width: 720 - i * 90, marginLeft: i * 45, background: i === 2 ? dark : tint, color: i === 2 ? '#ffffff' : 'var(--osd-text)', borderRadius: 'var(--osd-radius)', padding: '22px 28px', marginBottom: 14 }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: i === 2 ? '#ff8a3d' : accentText, width: 92 }}>{m.k}</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: 22, fontWeight: 750, color: i === 2 ? '#868b94' : muted }}>{m.t} · {m.s}</span>
            <span style={{ display: 'block', fontSize: 40, fontWeight: 900, marginTop: 2 }}>{m.v}</span>
          </span>
        </div>
      ))}
      <p style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 750, color: sub }}>한 사람이 한 해 3건을 쓴다고 보고 계산했습니다</p>
    </div>
    <Footer />
  </div>
);

/* 14. 확장 */
const rings = [
  { r: 70, t: '월계1동', s: '첫 실증 · 기록 49' },
  { r: 170, t: '노원구', s: '지금 · 기록 111 더함' },
  { r: 290, t: '서울', s: '대학 35곳 · 25개 구' },
  { r: 420, t: '어디든', s: '같은 개념 사전' },
];
const Expand: Page = () => (
  <div style={{ ...fill, background: dark, color: '#ffffff' }}>
    <Title kicker="확장" onDark>월계에서 시작해, 어느 동네든</Title>
    {rings.slice().reverse().map((r, i) => (
      <div key={r.t} style={{ position: 'absolute', left: 1180 - r.r, top: 640 - r.r, width: r.r * 2, height: r.r * 2, borderRadius: '50%', background: i === 3 ? '#ff6f0f' : 'rgba(255,111,15,' + (0.08 + i * 0.07) + ')', border: '2px solid rgba(255,111,15,0.5)' }} />
    ))}
    {rings.map((r, i) => (
      <div key={r.t} style={{ position: 'absolute', left: PAD_X, top: 380 + i * 120 }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: i === 0 ? '#ff6f0f' : '#ffffff' }}>{r.t}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#868b94', marginTop: 2 }}>{r.s}</div>
      </div>
    ))}
    <Footer onDark />
  </div>
);

/* 15. 마무리 */
const Closing: Page = () => (
  <div style={{ ...fill, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <img src={mark} alt="" style={{ width: 150, height: 150 }} />
    <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 150, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1.05, margin: '34px 0 0' }}>동네서랍</h1>
    <p style={{ fontSize: 50, fontWeight: 850, color: accentText, margin: '22px 0 0' }}>아이디어 전에, 문제부터</p>
    <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 64, background: soft, borderRadius: 32, padding: '26px 44px' }}>
      <img src={qrTeams} alt="" style={{ width: 170, height: 170 }} />
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 40, fontWeight: 900 }}>우리 팀 아이디어, 누가 먼저 해봤을까</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: accentText, marginTop: 10 }}>dongne-seorap.vercel.app/teams</div>
      </div>
    </div>
  </div>
);

export const meta: SlideMeta = {
  title: '동네서랍 — 해커톤 5분 발표',
  createdAt: '2026-10-07T14:10:49.360Z',
};

export const notes: (string | undefined)[] = [
  `[0:00–0:10] 안녕하세요, 40조 월계획입니다. 동네서랍은 지역 문제의 정책과 예산, 이해관계인, 선례를 대신 찾아 주는 에이전트입니다.`,
  `[0:10–0:30] 저희가 지역사회 문제에 어떻게 접근했는지부터 말씀드리겠습니다. 문제를 고르고, 아이디어를 내고, 설문을 돌리고, 발표했습니다. 그 과정에서 정책도, 예산도, 이해관계인도, 선례도 한 번 확인하지 않았습니다. 그래서 몰랐습니다. 같은 플리마켓이 2019년, 2022년, 2024년에 이미 세 번 열렸다는 것을요.`,
  `[0:30–0:48] 지역사회 문제는 아이디어 이전에 네 가지가 얽혀 있습니다. 이미 무엇이 있는지인 정책, 돈이 어디서 나오는지인 예산, 누가 쥐고 있는지인 이해관계인, 다른 동네는 어떻게 했는지인 선례입니다. 이 네 가지가 서로 다른 곳에 흩어져 있어서, 한 번에 보는 방법이 없습니다.`,
  `[0:48–1:05] 저희가 월계1동과 노원구를 끝까지 파 봤습니다. 공개 기록 160건을 모았는데, 멈춘 이유가 남은 건 20건뿐이었습니다. 그마저 17건은 구의회 회의록 속 답변에 묻혀 있었습니다. 무엇을 했는지는 남아도, 왜 멈췄는지는 찾아 읽어야만 나옵니다.`,
  `[1:05–1:22] 그래서 저희가 정의한 사용자는 이렇습니다. 지역사회 문제를 직접 풀어보려는 청년입니다. 수업 과제일 수도, 공모전일 수도, 그냥 불편해서일 수도 있습니다. 이 사람은 세 가지를 모릅니다. 무엇이 이미 있는지, 왜 멈췄는지, 누구에게 물어볼지. 그래서 결국 아이디어부터 내고, 발표날에 듣습니다. 그거, 운영할 사람이 없어서 멈췄었어요.`,
  `[1:22–1:40] 검색이나 ChatGPT로 찾으면 되지 않을까요? 기사로 남는 건 잘된 행사뿐이고, 멈춘 이유는 애초에 기록이 없습니다. 사업 결과 보고서는 기관 안에 갇혀 있고 형식도 제각각입니다. 없는 기록은 AI도 찾을 수 없습니다.`,
  `[1:40–1:58] 그래서 고리를 닫습니다. 시도가 끝날 때 결과와 멈춘 이유를 남기고, 서랍에 개념으로 쌓습니다. 다음 팀은 남의 프로젝트를 이어받는 게 아니라, 자기 아이디어 그대로 앞 팀이 멈춘 지점부터 시작합니다. 운영할 사람이 없어서 멈췄다면, 이번엔 운영 주체부터 구하고 시작하는 겁니다.`,
  `[1:58–2:15] 쌓는 방식이 핵심입니다. 문제를 대상, 니즈, 장소, 멈춘 이유로 쪼개면, 홀몸 어르신 안부 문제가 월계, 대구, 전주, 도쿄의 시도와 이어집니다. 전주는 1년 시범 후 멈췄다는 것까지요. 지역 이름이 아니라 개념으로 쌓기 때문에 어느 동네에 붙여도 똑같이 작동합니다.`,
  `[2:15–2:35] 실제 화면입니다. 풀려는 문제를 한 줄 적으면, 에이전트가 같은 문제에 먼저 6번 시도됐다고 알려주고, 각 시도가 어떻게 끝났는지와 출처를 보여줍니다.`,
  `[2:35–2:55] 문제 화면도 같습니다. 같은 문제의 시도가 연도순으로 쌓이고, 그 아래에 기록이 남긴 확인거리와 물어볼 곳이 함께 나옵니다. 저희 의견이 아니라 지난 시도가 멈춘 이유에서 그대로 뽑은 것입니다.`,
  `[2:55–3:15] 쌓는 방식은 이렇습니다. 정책과 회의록, 주민·대학의 시도, 그리고 다른 지역 사례까지 모은 다음, 니즈·장소·대상·멈춘 이유라는 속성으로 쪼갭니다. 지역 이름이 아니라 속성으로 묶이니까 월계동 문제가 전주, 광주, 해외 사례와 바로 이어집니다. 그리고 커넥터 한 줄이면 쓰던 AI에서 바로 물어볼 수 있습니다. 다른 동네는 이 문제를 어떻게 풀었냐고 물으면, 전주는 AI 안부전화를 1년 시범 뒤 중단했고 광주 북구는 우유 배달로 바꿨다는 답이 나옵니다.`,
  `[3:15–3:35] 말로만 드리면 와닿지 않으니, 지금 직접 해보시면 좋겠습니다. 화면 가운데 QR을 찍고 우리 팀을 고르면 이런 기록이 열립니다. 같은 문제로 먼저 있었던 시도, 멈춘 이유, 물어볼 부서까지 한 장에 있습니다. 이 자리 모든 팀의 기록이 들어 있습니다.`,
  `[3:35–4:10] 값은 간단합니다. 에이전트 리포트 한 건에 1달러입니다. 같은 조사를 리서치 업체에 맡기면 선행 사례와 수요 조사 한 건에 200에서 400만원, 프리랜서에게 맡겨도 30만원 안팎이고 며칠이 걸립니다. 저희는 1달러에 즉시입니다. 리포트 한 건은 문제 속성, 그러니까 니즈와 장소와 대상 조합 세 개를 꺼내 보는 일이고, 기록은 이미 쌓여 있어서 한 건 더 내는 데 드는 돈이 거의 없습니다. 시장은 한 사람이 한 해 세 건을 쓴다고 보고 계산했습니다. 전국이 연 700만 달러, 수도권이 180만 달러, 저희가 1에서 3년차에 잡는 노원구와 서울 북부 대학 다섯 곳이 연 21만 달러입니다.`,
  `[4:10–4:35] 월계에서 시작합니다. 개념으로 쌓기 때문에 서울의 대학과 자치구, 전국, 해외 어느 동네에도 같은 방식으로 붙습니다.`,
  `[4:35–5:00] 동네서랍이었습니다. 아이디어 전에, 문제부터. 지역 문제의 정책과 예산, 이해관계인, 선례를 대신 찾아 주는 에이전트입니다. 돌아가시기 전에 QR 한 번만 찍어 주세요. 우리 팀 아이디어를 누가 먼저 해봤는지, 지금 바로 보실 수 있습니다. 감사합니다.`,
];

export default [Cover, Hook, Repeat, Zero, Persona, Alternatives, Solution, Ontology, DemoIntake, DemoLeave, Pipeline, Reports, Business, Expand, Closing] satisfies Page[];
