import type { NextConfig } from "next";

const spring = process.env.SPRING_API_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  // Vercel 함수는 요청·응답 본문이 4.5MB로 제한된다. 업로드와 사진·영상은 CDN이 Spring으로 바로 전달한다.
  async rewrites() {
    if (!process.env.VERCEL || !spring) return [];
    return {
      beforeFiles: [
        { source: "/api/media", destination: `${spring}/api/media` },
        { source: "/media/:id", destination: `${spring}/api/media/:id` },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
