/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de imagens existentes
  images: {
    domains: ['localhost', 'source.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true
  },
  
  // Tratamento de rotas e redirecionamentos
  async rewrites() {
    return [
      {
        source: '/login',
        destination: '/',
      },
      // Redireciona qualquer rota desconhecida para a página inicial
      {
        source: '/:path*',
        destination: '/',
        has: [
          {
            type: 'header',
            key: 'x-redirected',
            value: '(?!true)',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig;
