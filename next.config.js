/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  
  // Configurações de ambiente - automático local/produção
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    NEXT_PUBLIC_BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000'
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Experimental features para performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Headers para segurança e performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  // Redirects para página principal
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      }
    ];
  },
  
  // Proxy dinâmico para API - local: localhost:8000, produção: render.com
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      }
    ];
  },

  // Configuração de timeout para servidor (inclui proxy)
  serverRuntimeConfig: {
    // Timeout para requisições do servidor (inclui proxy) - 10 minutos para operações de IA
    timeout: 600000,
    // Timeout específico para proxy HTTP
    httpTimeout: 600000,
  },

  // Configurações adicionais para produção
  publicRuntimeConfig: {
    // Variáveis que ficam disponíveis no cliente
    backendUrl: process.env.BACKEND_URL || 'http://localhost:8000',
    isDevelopment: process.env.NODE_ENV === 'development',
  },
  
  // Bundle analyzer (opcional)
  webpack: (config, { isServer, dev }) => {
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
        })
      );
    }
    
    // Otimizações de bundle
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;