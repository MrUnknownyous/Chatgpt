import path from "path";

const projectRoot = process.cwd();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": path.resolve(projectRoot),
      "@/": path.resolve(projectRoot),
    };

    return config;
  },
};

export default nextConfig;
