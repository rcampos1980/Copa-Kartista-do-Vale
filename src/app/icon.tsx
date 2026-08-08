import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icone() {
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
          borderRadius: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: -1,
            color: '#FF1E1E',
            fontFamily: 'sans-serif',
          }}
        >
          CKV
        </div>
      </div>
    ),
    { ...size }
  )
}
