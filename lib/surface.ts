// 카드 id마다 고정된 배경 그라데이션을 고른다.
const SURFACES = [
  "linear-gradient(165deg,#ff8a5c 0%,#fd267a 100%)",
  "linear-gradient(165deg,#8b6cff 0%,#ff4f9a 100%)",
  "linear-gradient(165deg,#13c2b3 0%,#2f6bff 100%)",
  "linear-gradient(165deg,#ffbe3d 0%,#ff4458 100%)",
  "linear-gradient(165deg,#4b4f6b 0%,#8a4fff 100%)",
  "linear-gradient(165deg,#22c98e 0%,#118ad1 100%)",
];

export function cardSurface(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SURFACES[h % SURFACES.length];
}
