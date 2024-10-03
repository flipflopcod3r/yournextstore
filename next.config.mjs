// @ts-check

import createNextIntlPlugin from "next-intl/plugin";
import MDX from "@next/mdx";
import path from "path";
import { fileURLToPath } from 'url'; // Import required for file URL handling

const withNextIntl = createNextIntlPlugin();
const withMDX = MDX();

// Convert import.meta.url to a file path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: process.env.DOCKER ? "standalone" : undefined,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      { hostname: "files.stripe.com" },
      { hostname: "d1wqzb5bdbcre6.cloudfront.net" },
      { hostname: "*.blob.vercel-storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  transpilePackages: ["next-mdx-remote", "commerce-kit"],
  experimental: {
    esmExternals: true,
    mdxRs: true,
    scrollRestoration: true,
    ppr: true,
    after: true,
    reactCompiler: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  rewrites: async () => [
    {
      source: "/stats/:match*",
      destination: "https://eu.umami.is/:match*",
    },
  ],
  // Added MDX configuration
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
};

// Applying both withNextIntl and withMDX
export default withNextIntl(withMDX(nextConfig));
