// 카드 id마다 고정된 배경 그라데이션을 고른다. 동네 골목의 흙·살구·올리브 톤.
const SURFACES = [
  "linear-gradient(165deg,#f6b26b 0%,#d2592a 100%)",
  "linear-gradient(165deg,#f2c14e 0%,#c8642c 100%)",
  "linear-gradient(165deg,#a9bf8f 0%,#5e7d4f 100%)",
  "linear-gradient(165deg,#dba27c 0%,#8c4a2f 100%)",
  "linear-gradient(165deg,#f3ac8c 0%,#b9573f 100%)",
  "linear-gradient(165deg,#e9c58f 0%,#a8742f 100%)",
];

export function cardSurface(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SURFACES[h % SURFACES.length];
}
