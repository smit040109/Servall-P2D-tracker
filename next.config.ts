import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
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
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/v1/create-qr-code/**',
      },
    ],
  },
  // In a future version of Next.js, you will need to explicitly configure
  // "allowedDevOrigins" to allow cross-origin requests in development.
  // For now, we can add it to silence the warning.
  devServer: {
    allowedDevOrigins: [
      "https://*.cluster-6dx7corvpngoivimwvvljgokdw.cloudworkstations.dev"
    ]
  }
};

export default nextConfig;
