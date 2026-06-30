import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGithubPages
    ? {
        output: "export",
        basePath: "/SMART-ConsultingNavigator",
        assetPrefix: "/SMART-ConsultingNavigator/",
        images: {
          unoptimized: true,
        },
      }
    : {}),
};

export default nextConfig;
