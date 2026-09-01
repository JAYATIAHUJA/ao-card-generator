import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const output = process.env.NEXT_OUTPUT === "export" ? "export" : "standalone";

const nextConfig: NextConfig = {
  output,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: output === "export",
};

export default nextConfig;
