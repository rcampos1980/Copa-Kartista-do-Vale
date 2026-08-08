import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Copa Kartista do Vale',
    short_name: 'Copa Kartista',
    description: 'Classificação, etapas, pilotos e estatísticas do campeonato.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#08090C',
    theme_color: '#08090C',
    lang: 'pt-BR',
    categories: ['sports'],
    icons: [
      { src: '/icone-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Classificação', url: '/classificacao' },
      { name: 'Etapas', url: '/etapas' },
      { name: 'Pilotos', url: '/pilotos' },
    ],
  }
}
