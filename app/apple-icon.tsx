import { fullBleedIcon } from "@/lib/brand-icon";

// iOS가 모서리를 직접 둥글리므로 배경을 꽉 채운 버전을 쓴다.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return fullBleedIcon(size.width);
}
