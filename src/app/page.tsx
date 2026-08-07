import { getDashboardData } from '@/lib/supabase/queries'
import { getTemporadas, getAnoSelecionado } from '@/lib/temporada'
import { createClient } from '@/lib/supabase/server'
import { SeletorTemporada } from '@/components/SeletorTemporada'
import { formatarData, pluralizar } from '@/lib/format'
import Link from 'next/link'
import { Trophy, Flag, Calendar, Users, Zap, ChevronRight, MapPin } from 'lucide-react'

export default async function Home() {
  const temporadas = await getTemporadas()
  const anoSelecionado = await getAnoSelecionado()
  const dashboard = await getDashboardData(anoSelecionado ?? undefined)

  if (!dashboard) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg text-white">
        <p>Nenhum campeonato ativo encontrado para o ano atual.</p>
      </main>
    )
  }

  const { campeonato, classificacao, proximaEtapa, ultimaCorrida, totalPilotos } = dashboard

  const supabase = await createClient()

  const { data: etapasTodas } = await supabase
    .from('etapas')
    .select('id, status')
    .eq('campeonato_id', campeonato.id)

  const realizadas = (etapasTodas ?? []).filter((e) => e.status === 'realizada').length
  const totalEtapas = (etapasTodas ?? []).length

  const { data: resUltima } = ultimaCorrida
    ? await supabase
        .from('vw_resultados_publico')
        .select('*')
        .eq('etapa_id', ultimaCorrida.id)
        .order('posicao_chegada', { ascending: true })
    : { data: [] }

  const vencedor = (resUltima ?? []).find((r) => r.posicao_chegada === 1)
  const voltaRapida = (resUltima ?? []).find((r) => r.melhor_volta_flag)

  const top3 = classificacao.slice(0, 3)
  const vencedores = new Set(
    (classificacao ?? []).filter((c) => c.vitorias > 0).map((c) => c.piloto_id)
  ).size

  let diasParaProxima: number | null = null
  if (proximaEtapa) {
    const [ano, mes, dia] = proximaEtapa.data.split('T')[0].split('-').map(Number)
    const alvo = new Date(ano, mes - 1, dia)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    diasParaProxima = Math.round((alvo.getTime() - hoje.getTime()) / 86400000)
  }

  const estiloPodio = [
    { borda: 'border-gold/45', texto: 'text-gold', fundo: 'from-gold/[0.08]' },
    { borda: 'border-silver/35', texto: 'text-silver', fundo: 'from-silver/[0.06]' },
    { borda: 'border-bronze/35', texto: 'text-bronze', fundo: 'from-bronze/[0.07]' },
  ]

  return (
    <main className="min-h-screen bg-bg text-white px-4 py-8 md:px-10 md:py-12">
      <header className="mb-6">
        <SeletorTemporada temporadas={temporadas} anoAtual={campeonato.ano} />
        <h1 className="text-3xl md:text-5xl font-display font-bold mt-1 tracking-tight">
          {campeonato.nome}
        </h1>
        <div className="mt-4 h-px w-full bg-gradient-to-r from-accent/60 via-border to-transparent" />
      </header>

      {proximaEtapa && (
        <section className="mb-6 rounded-2xl border border-accent/35 bg-surface overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 md:p-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 border border-accent/30 shrink-0">
                <Calendar className="text-accent" size={22} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-accent">Próxima etapa</p>
                <p className="font-display font-bold text-2xl md:text-3xl leading-tight truncate">
                  {proximaEtapa.pista}
                </p>
                <p className="text-white/50 text-sm">
                  {proximaEtapa.nome ? `${proximaEtapa.nome} · ` : ''}
                  {formatarData(proximaEtapa.data)}
                </p>
              </div>
            </div>
            {diasParaProxima != null && diasParaProxima >= 0 && (
              <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0 shrink-0">
                <span className="font-display font-bold text-accent text-4xl md:text-5xl leading-none num-tab">
                  {diasParaProxima}
                </span>
                <span className="text-white/40 text-xs uppercase tracking-widest">
                  {diasParaProxima === 1 ? 'dia' : 'dias'}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50">
            Pódio da temporada
          </h2>
          <Link
            href="/classificacao"
            className="flex items-center gap-1 text-white/40 hover:text-accent text-xs transition-colors"
          >
            Classificação completa <ChevronRight size={14} />
          </Link>
        </div>

        {top3.length === 0 ? (
          <p className="text-white/40 text-sm">Sem resultados registrados ainda.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 md:gap-4 items-end">
            {[1, 0, 2].map((idx) => {
              const p = top3[idx]
              if (!p) return <div key={idx} />
              const e = estiloPodio[idx]
              const primeiro = idx === 0
              return (
                <div
                  key={p.piloto_id}
                  className={`rounded-2xl border ${e.borda} bg-gradient-to-b ${e.fundo} to-transparent bg-surface px-2 md:px-5 flex flex-col items-center justify-center text-center ${
                    primeiro
                      ? 'py-6 min-h-[190px] md:min-h-0 md:py-7'
                      : 'py-4 min-h-[150px] md:min-h-0 md:py-5'
                  }`}
                >
                  <Trophy className={e.texto} size={primeiro ? 26 : 20} strokeWidth={1.6} />
                  <p className={`mt-2 font-display font-bold leading-none num-tab ${e.texto} ${primeiro ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}>
                    {idx + 1}º
                  </p>
                  <p className="mt-2 font-display font-semibold leading-tight text-sm md:text-lg">
                    {p.nome}
                  </p>
                  <p className="mt-2 font-display font-bold text-white leading-none num-tab text-xl md:text-2xl">
                    {p.pontos_totais}
                  </p>
                  <p className="mt-1 text-white/35 text-[9px] uppercase tracking-widest">pontos</p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {ultimaCorrida && (
        <section className="mb-6">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-3">
            Última corrida
          </h2>
          <Link
            href={`/etapas/${ultimaCorrida.id}`}
            className="block rounded-2xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display font-bold text-xl leading-tight truncate">
                  {ultimaCorrida.pista}
                </p>
                <p className="text-white/40 text-sm flex items-center gap-1.5 mt-0.5">
                  <MapPin size={13} /> {formatarData(ultimaCorrida.data)}
                </p>
              </div>
              <ChevronRight className="text-white/30 shrink-0 mt-1" size={18} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {vencedor && (
                <span className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2">
                  <Trophy className="text-gold" size={14} />
                  <span className="text-white/50 text-[11px] uppercase tracking-wide">Vencedor</span>
                  <span className="text-white text-sm font-medium">{vencedor.piloto_nome}</span>
                </span>
              )}
              {voltaRapida && (
                <span className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2">
                  <Zap className="text-accent" size={14} />
                  <span className="text-white/50 text-[11px] uppercase tracking-wide">Volta rápida</span>
                  <span className="text-white text-sm font-medium">{voltaRapida.piloto_nome}</span>
                </span>
              )}
            </div>
          </Link>
        </section>
      )}

      <section className="grid grid-cols-3 gap-2.5 md:gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4 md:p-5">
          <Users className="text-white/40 mb-2" size={18} />
          <p className="text-2xl md:text-3xl font-display font-bold num-tab">{totalPilotos}</p>
          <p className="text-white/40 text-xs mt-0.5">
            {pluralizar(totalPilotos, 'piloto', 'pilotos')}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 md:p-5">
          <Flag className="text-white/40 mb-2" size={18} />
          <p className="text-2xl md:text-3xl font-display font-bold num-tab">{realizadas}</p>
          <p className="text-white/40 text-xs mt-0.5">de {totalEtapas} etapas</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 md:p-5">
          <Trophy className="text-white/40 mb-2" size={18} />
          <p className="text-2xl md:text-3xl font-display font-bold num-tab">{vencedores}</p>
          <p className="text-white/40 text-xs mt-0.5">
            {pluralizar(vencedores, 'vencedor', 'vencedores')}
          </p>
        </div>
      </section>
    </main>
  )
}

export const dynamic = 'force-dynamic'
