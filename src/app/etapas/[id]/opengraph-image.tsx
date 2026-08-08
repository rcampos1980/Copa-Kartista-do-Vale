import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/client'

export const alt = 'Resultado da etapa'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const CORES = ['#E8C25A', '#B9C2CC', '#C98A4B']

export default async function ImagemEtapa({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: etapa } = await supabase
    .from('etapas')
    .select('nome, pista, data')
    .eq('id', params.id)
    .maybeSingle()

  const { data: resultados } = await supabase
    .from('vw_resultados_publico')
    .select('piloto_nome, posicao_chegada, pontos, is_convidado')
    .eq('etapa_id', params.id)
    .order('posicao_chegada', { ascending: true })
    .limit(3)

  const podio = resultados ?? []
  const dataBr = etapa?.data
    ? String(etapa.data).split('T')[0].split('-').reverse().join('/')
    : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#08090C',
          backgroundImage: 'radial-gradient(circle at 85% 8%, rgba(255,30,30,0.25), transparent 55%)',
          fontFamily: 'sans-serif',
          padding: 64,
        }}
      >
        <div style={{ display: 'flex', fontSize: 20, letterSpacing: 8, color: '#FF1E1E', fontWeight: 700 }}>
          COPA KARTISTA DO VALE
        </div>

        <div style={{ display: 'flex', fontSize: 62, fontWeight: 800, color: '#FFFFFF', marginTop: 10, letterSpacing: -1 }}>
          {etapa?.pista ?? 'Etapa'}
        </div>

        <div style={{ display: 'flex', fontSize: 26, color: '#9BA3AF', marginTop: 4 }}>
          {etapa?.nome ? `${etapa.nome} · ${dataBr}` : dataBr}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 44 }}>
          {podio.map((r, i) => (
            <div
              key={r.piloto_nome}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${CORES[i]}55`,
                borderRadius: 16,
                padding: '18px 24px',
              }}
            >
              <div style={{ display: 'flex', fontSize: 40, fontWeight: 800, color: CORES[i], width: 78 }}>
                {r.posicao_chegada}º
              </div>
              <div style={{ display: 'flex', flex: 1, fontSize: 38, fontWeight: 600, color: '#FFFFFF' }}>
                {r.piloto_nome}
              </div>
              <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: '#9BA3AF' }}>
                {r.is_convidado ? 'convidado' : `${r.pontos} pts`}
              </div>
            </div>
          ))}
          {podio.length === 0 && (
            <div style={{ display: 'flex', fontSize: 30, color: '#646C79' }}>
              Resultado ainda não lançado
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
