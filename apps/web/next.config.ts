import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    devIndicators: false,
    transpilePackages: [
        '@souschef/ui',
        '@souschef/db',
        '@souschef/trpc',
    ],
    output: 'standalone',
    outputFileTracingRoot: path.join(__dirname, '../../'),
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
};

export default nextConfig;
