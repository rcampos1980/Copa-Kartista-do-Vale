import { ImageResponse } from 'next/og'

export const alt = 'Copa Kartista do Vale'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function ImagemCompartilhamento() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#08090C',
          backgroundImage:
            'radial-gradient(circle at 78% 12%, rgba(255,30,30,0.28), transparent 55%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 10, color: '#FF1E1E', fontWeight: 700, marginBottom: 24 }}>
          CAMPEONATO DE KART
        </div>
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 800, color: '#FFFFFF', letterSpacing: -2, lineHeight: 1 }}>
          COPA KARTISTA
        </div>
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 800, color: '#FF1E1E', letterSpacing: -2, lineHeight: 1, marginTop: 6 }}>
          DO VALE
        </div>
        <div style={{ display: 'flex', marginTop: 40, width: 460, height: 3, background: 'linear-gradient(90deg, #FF1E1E, rgba(255,30,30,0))' }} />
        <div style={{ display: 'flex', marginTop: 28, fontSize: 24, color: '#9BA3AF' }}>
          Classificação · Etapas · Pilotos · Estatísticas
        </div>
      </div>
    ),
    { ...size }
  )
}
