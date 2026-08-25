import type { NextConfig } from 'next';

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://cdn.jsdelivr.net https://challenges.cloudflare.com https://apis.google.com https://www.googletagmanager.com https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com https://*.cardinalcommerce.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://dark-empire-lords-llc.github.io https://picsum.photos https://assets.coingecko.com https://raw.githubusercontent.com https://dexscreener.com https://cdn.jsdelivr.net https://darkempirelords.com https://www.paypal.com https://*.paypalobjects.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://api.mainnet-beta.solana.com https://solana-mainnet.g.alchemy.com https://mainnet.helius-rpc.com https://rpc.extrnode.com https://rpc.ankr.com https://api.dexscreener.com https://public-api.birdeye.so https://quote-api.jup.ag https://api.stripe.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://api.telegram.org https://discord.com https://generativelanguage.googleapis.com https://token-trace-lemon.vercel.app https://www.paypal.com https://*.paypal.com https://*.paypalobjects.com https://*.cardinalcommerce.com wss://api.mainnet-beta.solana.com wss://mainnet.helius-rpc.com wss://solana-mainnet.g.alchemy.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com https://challenges.cloudflare.com https://www.geckoterminal.com https://dexscreener.com https://token-trace-lemon.vercel.app https://www.paypal.com https://*.paypal.com https://*.cardinalcommerce.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: cspDirectives,
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dark-empire-lords-llc.github.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, { dev }) => {
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
