import "./src/env.mjs";

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  optimizePackageImports: ["@tremor/react"],
  transpilePackages: ["@scorebrawl/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uploadthing.com",
        port: "",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/f/**",
      },
    ],
  },
};

export default nextConfig;
