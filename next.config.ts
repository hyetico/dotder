import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.219.104"],
  redirects() {
    return [
      // 메모 화면 옛 주소. 저장해 둔 링크가 깨지지 않게 남긴다.
      {
        source: "/backlog/:path*",
        destination: "/memos/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
