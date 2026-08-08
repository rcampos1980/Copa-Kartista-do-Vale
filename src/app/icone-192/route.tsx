import { ImageResponse } from 'next/og'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 800, letterSpacing: -3, color: '#FF1E1E' }}>
          CKV
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
