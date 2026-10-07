// 카드 id마다 고정된 배경을 고른다. 당근 SEED의 오렌지와 회색 계열.
const SURFACES = [
  "linear-gradient(165deg,#ff8a3d 0%,#ff6f0f 100%)",
  "linear-gradient(165deg,#4d5159 0%,#212124 100%)",
  "linear-gradient(165deg,#ff6f0f 0%,#e14d00 100%)",
  "linear-gradient(165deg,#868b94 0%,#4d5159 100%)",
  "linear-gradient(165deg,#ffa36b 0%,#ff6f0f 100%)",
  "linear-gradient(165deg,#5b5f68 0%,#2a2c31 100%)",
];

export function cardSurface(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SURFACES[h % SURFACES.length];
}
