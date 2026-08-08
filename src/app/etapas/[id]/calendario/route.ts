import { createClient } from '@/lib/supabase/client'

function dobrar(n: number) {
  return String(n).padStart(2, '0')
}

function paraIcs(d: Date) {
  return (
    d.getUTCFullYear() +
    dobrar(d.getUTCMonth() + 1) +
    dobrar(d.getUTCDate()) +
    'T' +
    dobrar(d.getUTCHours()) +
    dobrar(d.getUTCMinutes()) +
    '00Z'
  )
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createClient()

  const { data: etapa } = await supabase
    .from('etapas')
    .select('nome, pista, data, observacoes')
    .eq('id', id)
    .maybeSingle()

  if (!etapa) {
    return new Response('Etapa não encontrada', { status: 404 })
  }

  const horario = /(\d{1,2})[:h](\d{2})/.exec(etapa.observacoes ?? '')
  const hora = horario ? Number(horario[1]) : 19
  const minuto = horario ? Number(horario[2]) : 0

  const [ano, mes, dia] = String(etapa.data).split('T')[0].split('-').map(Number)
  // horario local do Brasil (UTC-3) convertido para UTC
  const inicio = new Date(Date.UTC(ano, mes - 1, dia, hora + 3, minuto))
  const fim = new Date(inicio.getTime() + 2 * 60 * 60 * 1000)

  const titulo = `${etapa.nome ? etapa.nome + ' · ' : ''}${etapa.pista} — Copa Kartista do Vale`
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Copa Kartista do Vale//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:etapa-${id}@copakartistadovale`,
    `DTSTAMP:${paraIcs(new Date())}`,
    `DTSTART:${paraIcs(inicio)}`,
    `DTEND:${paraIcs(fim)}`,
    `SUMMARY:${titulo}`,
    `LOCATION:${etapa.pista}`,
    `DESCRIPTION:Detalhes e lastro em ${site}/etapas/${id}`,
    `URL:${site}/etapas/${id}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Corrida amanhã',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  const nomeArquivo = `${etapa.pista}`.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

  return new Response(linhas.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="etapa-${nomeArquivo}.ics"`,
    },
  })
}
