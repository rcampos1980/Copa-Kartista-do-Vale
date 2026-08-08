import { ImageResponse } from 'next/og'

export async function GET() {
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
          background: '#000000',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 190, fontWeight: 800, letterSpacing: -8, color: '#FF1E1E', lineHeight: 1 }}>
          CKV
        </div>
        <div style={{ display: 'flex', fontSize: 34, letterSpacing: 6, color: '#FFFFFF', marginTop: 18 }}>
          DO VALE
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
