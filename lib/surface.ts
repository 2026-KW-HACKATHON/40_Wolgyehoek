// 카드 id마다 고정된 배경 그라데이션을 고른다. 감·노을·홍시·꿀·단풍 같은 선명한 동네 저녁 색.
const SURFACES = [
  "linear-gradient(165deg,#ffb04a 0%,#ef5a1c 100%)",
  "linear-gradient(165deg,#ffc94d 0%,#f2721f 100%)",
  "linear-gradient(165deg,#ff9a6b 0%,#e2452e 100%)",
  "linear-gradient(165deg,#ff8f4f 0%,#c4421a 100%)",
  "linear-gradient(165deg,#ffd166 0%,#e8890f 100%)",
  "linear-gradient(165deg,#ff7a4d 0%,#c9321f 100%)",
];

export function cardSurface(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SURFACES[h % SURFACES.length];
}
