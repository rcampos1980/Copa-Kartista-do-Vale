import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function IconeApple() {
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
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 82,
            fontWeight: 800,
            letterSpacing: -3,
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
