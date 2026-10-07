import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// 파비콘·홈 화면 아이콘은 public/brand의 SVG 원본에서 만든다.
const brandFile = (name: "mark.svg" | "glyph.svg") => readFile(join(process.cwd(), "public/brand", name), "base64").then(data => `data:image/svg+xml;base64,${data}`);

export async function markIcon(size: number) {
  const src = await brandFile("mark.svg");
  // eslint-disable-next-line @next/next/no-img-element -- ImageResponse는 next/image를 렌더링하지 않는다.
  return new ImageResponse(<img src={src} width={size} height={size} alt="" />, { width: size, height: size });
}

export async function fullBleedIcon(size: number) {
  const src = await brandFile("glyph.svg");
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", backgroundImage: "linear-gradient(135deg, #fd267a 0%, #ff6036 100%)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse는 next/image를 렌더링하지 않는다. */}
      <img src={src} width={size} height={size} alt="" />
    </div>,
    { width: size, height: size },
  );
}
