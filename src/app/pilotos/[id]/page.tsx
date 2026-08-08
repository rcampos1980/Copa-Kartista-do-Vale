import { getPilotoPerfil } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'
import { formatarData } from '@/lib/format'
import { BadgeTipo } from '@/components/Badge'
import { User, Trophy, Medal, Flag, ArrowLeft, Zap, Target, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Resultado = {
  posicao_chegada: number
  pontos: number
  is_convidado: boolean
  melhor_volta_flag?: boolean
  etapas: { pista: string; data: string } | { pista: string; data: string }[]
}

function normalizar(resultados: Resultado[]) {
  return resultados
    .map((r) => {
      const e = Array.isArray(r.etapas) ? r.etapas[0] : r.etapas
      return {
        pista: e?.pista ?? 'Etapa',
        data: e?.data ?? '',
        posicao: r.posicao_chegada,
        pontos: r.pontos ?? 0,
        convidado: r.is_convidado,
        voltaRapida: Boolean(r.melhor_volta_flag),
      }
    })
    .sort((a, b) => a.data.localeCompare(b.data))
}

function resumir(lista: ReturnType<typeof normalizar>) {
  const oficiais = lista.filter((r) => !r.convidado)
  const posicoes = lista.map((r) => r.posicao)
  return {
    corridas: lista.length,
    pontos: oficiais.reduce((s, r) => s + r.pontos, 0),
    vitorias: lista.filter((r) => r.posicao === 1).length,
    podios: lista.filter((r) => r.posicao <= 3).length,
    voltas: lista.filter((r) => r.voltaRapida).length,
    melhor: posicoes.length ? Math.min(...posicoes) : null,
    pior: posicoes.length ? Math.max(...posicoes) : null,
    media: posicoes.length ? posicoes.reduce((s, p) => s + p, 0) / posicoes.length : null,
  }
}

function corPosicao(p: number) {
  if (p === 1) return 'text-gold'
  if (p === 2) return 'text-silver'
  if (p === 3) return 'text-bronze'
  return 'text-white/50'
}

export default async function PerfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ comparar?: string }>
}) {
  const { id } = await params
  const { comparar } = await searchParams

  const dados = await getPilotoPerfil(id)
  if (!dados) notFound()

  const { piloto, resultados } = dados
  const historico = normalizar(resultados as Resultado[])
  const r = resumir(historico)

  const supabase = createClient()
  const { data: listaPilotos } = await supabase
    .from('vw_pilotos_publico')
    .select('id, nome')
    .neq('id', id)
    .order('nome', { ascending: true })

  const rival = comparar && comparar !== id ? await getPilotoPerfil(comparar) : null
  const histRival = rival ? normalizar(rival.resultados as Resultado[]) : []
  const rr = rival ? resumir(histRival) : null

  const chaves = Array.from(new Set([...historico, ...histRival].map((h) => h.data))).sort()

  const rotuloDe = (data: string) =>
    (historico.find((h) => h.data === data) ?? histRival.find((h) => h.data === data))?.pista ?? ''

  const posicaoEm = (lista: typeof historico, data: string) =>
    lista.find((h) => h.data === data)?.posicao ?? null

  const maxPos = Math.max(6, ...historico.map((h) => h.posicao), ...histRival.map((h) => h.posicao))

  const eixoX = (i: number) => (chaves.length > 1 ? (i / (chaves.length - 1)) * 100 : 50)
  const eixoY = (pos: number) => ((pos - 1) / (maxPos - 1)) * 100

  const marcadores = (lista: typeof historico) =>
    chaves
      .map((d, i) => ({ i, pos: posicaoEm(lista, d) }))
      .filter((m): m is { i: number; pos: number } => m.pos !== null)

  const linha = (lista: typeof historico) =>
    marcadores(lista).map((m) => `${eixoX(m.i)},${eixoY(m.pos)}`).join(' ')

  const cards = [
    { rotulo: 'Pontos', valor: r.pontos, icone: Trophy, cor: 'text-accent' },
    { rotulo: 'Vitórias', valor: r.vitorias, icone: Medal, cor: 'text-gold' },
    { rotulo: 'Pódios', valor: r.podios, icone: Medal, cor: 'text-silver' },
    { rotulo: 'Corridas', valor: r.corridas, icone: Flag, cor: 'text-white/60' },
    { rotulo: 'Voltas rápidas', valor: r.voltas, icone: Zap, cor: 'text-accent' },
    { rotulo: 'Melhor', valor: r.melhor ? `${r.melhor}º` : '—', icone: Target, cor: 'text-gold' },
    { rotulo: 'Pior', valor: r.pior ? `${r.pior}º` : '—', icone: Target, cor: 'text-white/40' },
    { rotulo: 'Média', valor: r.media ? r.media.toFixed(1) : '—', icone: TrendingUp, cor: 'text-white/60' },
  ]

  const duelos = rival ? historico.filter((h) => histRival.some((o) => o.data === h.data)) : []
  const vitoriasDiretas = duelos.filter(
    (h) => h.posicao < (histRival.find((o) => o.data === h.data)?.posicao ?? 99)
  ).length

  const comparativos = rr
    ? [
        { rotulo: 'Pontos', a: r.pontos, b: rr.pontos, maior: true },
        { rotulo: 'Vitórias', a: r.vitorias, b: rr.vitorias, maior: true },
        { rotulo: 'Pódios', a: r.podios, b: rr.podios, maior: true },
        { rotulo: 'Corridas', a: r.corridas, b: rr.corridas, maior: true },
        { rotulo: 'Melhor chegada', a: r.melhor ?? 99, b: rr.melhor ?? 99, maior: false },
        { rotulo: 'Posição média', a: Number((r.media ?? 99).toFixed(1)), b: Number((rr.media ?? 99).toFixed(1)), maior: false },
      ]
    : []

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <Link href="/pilotos" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Voltar para pilotos
      </Link>

      <header className="flex items-center gap-5 mb-8">
        <div className="shrink-0">
          {piloto.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={piloto.foto_url} alt={piloto.nome} className="w-24 h-24 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-surface border border-border flex items-center justify-center">
              <User className="text-white/30" size={40} />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">{piloto.nome}</h1>
          <div className="mt-1 flex items-center gap-2 text-white/50 text-sm">
            {piloto.cidade && <span>{piloto.cidade}</span>}
            {piloto.idade && <span>· {piloto.idade} anos</span>}
          </div>
          <div className="mt-2">
            <BadgeTipo tipo={piloto.tipo} />
          </div>
        </div>
      </header>

      <section className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3 mb-8">
        {cards.map((c) => {
          const Icone = c.icone
          return (
            <div key={c.rotulo} className="bg-surface border border-border rounded-xl p-3">
              <Icone className={c.cor} size={15} />
              <p className="mt-1.5 font-display text-xl md:text-2xl font-bold text-white leading-none num-tab">{c.valor}</p>
              <p className="text-white/35 text-[10px] mt-1 leading-tight">{c.rotulo}</p>
            </div>
          )
        })}
      </section>

      {chaves.length > 1 && (
        <section className="bg-surface border border-border rounded-2xl p-5 mb-8">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-1">Posição por etapa</h2>
          <p className="text-white/30 text-xs mb-6">
            Quanto mais alto, melhor a chegada.
            {rival && <span className="text-accent"> Vermelho: {piloto.nome}.</span>}
            {rival && <span className="text-sky-400"> Azul: {rival.piloto.nome}.</span>}
          </p>

          <div className="relative h-48">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.09)" strokeWidth="0.3" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
              <line x1="0" y1="100" x2="100" y2="100" stroke="rgba(255,255,255,0.09)" strokeWidth="0.3" />
              {rival && marcadores(histRival).length > 1 && (
                <polyline points={linha(histRival)} fill="none" stroke="#3B9EFF" strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              )}
              {marcadores(historico).length > 1 && (
                <polyline points={linha(historico)} fill="none" stroke="#FF1E1E" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              )}
            </svg>

            {rival && marcadores(histRival).map((m) => (
              <span
                key={`r-${m.i}`}
                className="absolute flex h-4 min-w-4 items-center justify-center rounded-full border border-sky-400 bg-bg px-1 text-[9px] font-display font-bold text-sky-400"
                style={{ left: `${eixoX(m.i)}%`, top: `${eixoY(m.pos)}%`, transform: 'translate(-50%, -50%)' }}
              >
                {m.pos}
              </span>
            ))}

            {marcadores(historico).map((m) => (
              <span
                key={`p-${m.i}`}
                className={`absolute flex h-5 min-w-5 items-center justify-center rounded-full border border-accent bg-bg px-1 text-[10px] font-display font-bold ${corPosicao(m.pos)}`}
                style={{ left: `${eixoX(m.i)}%`, top: `${eixoY(m.pos)}%`, transform: 'translate(-50%, -50%)' }}
              >
                {m.pos}
              </span>
            ))}
          </div>

          <div className="relative h-5 mt-2">
            {chaves.map((d, i) => (
              <span key={d} className="absolute text-white/25 text-[10px] whitespace-nowrap" style={{ left: `${eixoX(i)}%`, transform: 'translateX(-50%)' }}>
                {rotuloDe(d)}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="bg-surface border border-border rounded-2xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-accent" size={16} />
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50">Comparar com outro piloto</h2>
        </div>

        <form method="get" className="flex flex-wrap gap-2 items-center">
          <select name="comparar" defaultValue={comparar ?? ''} className="bg-bg border border-border rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-accent">
            <option value="">Escolha um piloto...</option>
            {(listaPilotos ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          <button type="submit" className="rounded-xl bg-accent hover:bg-accent/90 px-4 py-2 text-sm font-medium text-white transition-colors">
            Comparar
          </button>
          {rival && (
            <Link href={`/pilotos/${id}`} className="text-white/40 hover:text-white text-xs ml-1">limpar</Link>
          )}
        </form>

        {rival && rr && (
          <div className="mt-5">
            <div className="grid grid-cols-3 gap-2 items-center mb-4 pb-4 border-b border-border">
              <p className="font-display font-bold text-white text-sm md:text-base truncate">{piloto.nome}</p>
              <p className="text-white/25 text-[10px] uppercase tracking-widest text-center">contra</p>
              <p className="font-display font-bold text-sky-400 text-sm md:text-base truncate text-right">{rival.piloto.nome}</p>
            </div>

            {comparativos.map((m) => {
              const ganhaA = m.maior ? m.a > m.b : m.a < m.b
              const ganhaB = m.maior ? m.b > m.a : m.b < m.a
              return (
                <div key={m.rotulo} className="grid grid-cols-3 gap-2 items-center py-2">
                  <p className={`font-display font-bold text-lg num-tab ${ganhaA ? 'text-accent' : 'text-white/40'}`}>
                    {m.a === 99 ? '—' : m.a}
                  </p>
                  <p className="text-white/40 text-xs text-center">{m.rotulo}</p>
                  <p className={`font-display font-bold text-lg num-tab text-right ${ganhaB ? 'text-sky-400' : 'text-white/40'}`}>
                    {m.b === 99 ? '—' : m.b}
                  </p>
                </div>
              )
            })}

            {duelos.length > 0 && (
              <div className="mt-4 rounded-xl border border-border bg-bg px-4 py-3 text-center">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Confronto direto</p>
                <p className="text-white text-sm">
                  Em {duelos.length} {duelos.length === 1 ? 'etapa disputada' : 'etapas disputadas'} juntos, {piloto.nome} chegou à frente <strong className="font-display text-accent">{vitoriasDiretas}</strong> {vitoriasDiretas === 1 ? 'vez' : 'vezes'}.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {(piloto.estilo_pilotagem || piloto.caracteristicas) && (
        <section className="bg-surface border border-border rounded-2xl p-5 mb-8">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-2">Perfil do piloto</h2>
          {piloto.estilo_pilotagem && (
            <p className="text-white/80 text-sm">
              <span className="text-white/50">Estilo: </span>
              {piloto.estilo_pilotagem}
            </p>
          )}
          {piloto.caracteristicas && <p className="text-white/80 text-sm mt-1">{piloto.caracteristicas}</p>}
        </section>
      )}

      <section>
        <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-3">Etapas disputadas</h2>
        {historico.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center">
            <Flag className="text-white/15 mx-auto mb-3" size={28} />
            <p className="text-white/50 text-sm">Nenhuma corrida registrada ainda.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {[...historico].reverse().map((h, i) => (
              <div key={i} className="flex items-center gap-4 px-4 md:px-6 py-3.5 border-b border-border last:border-b-0">
                <span className={`font-display font-bold text-xl w-10 shrink-0 num-tab ${corPosicao(h.posicao)}`}>
                  {h.posicao}º
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate">{h.pista}</p>
                    {h.voltaRapida && <Zap className="text-accent shrink-0" size={13} />}
                  </div>
                  <p className="text-white/40 text-xs">
                    {h.data ? formatarData(h.data) : ''}
                    {h.convidado && ' · como convidado'}
                  </p>
                </div>
                <span className="font-display font-bold text-white text-lg shrink-0 num-tab">
                  {h.convidado ? '—' : `${h.pontos} pts`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export const dynamic = 'force-dynamic'
