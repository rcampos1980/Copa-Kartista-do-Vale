import { getDashboardData } from '@/lib/supabase/queries'
import { getTemporadas, getAnoSelecionado } from '@/lib/temporada'
import { createClient } from '@/lib/supabase/server'
import { SeletorTemporada } from '@/components/SeletorTemporada'
import { formatarData, pluralizar } from '@/lib/format'
import Link from 'next/link'
import { Trophy, Flag, Calendar, Users, Zap, ChevronRight, Clock, Navigation, BookOpen, BarChart3, ArrowUpRight } from 'lucide-react'

type EtapaLista = {
  id: string
  nome: string | null
  pista: string
  data: string
  horario: string | null
  status: string
  link_mapa: string | null
}

const DIA_MS = 86400000

function diasAte(dataIso: string): number {
  const [ano, mes, dia] = dataIso.split('T')[0].split('-').map(Number)
  const alvo = new Date(ano, mes - 1, dia)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.round((alvo.getTime() - hoje.getTime()) / DIA_MS)
}

function diaDaSemana(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('T')[0].split('-').map(Number)
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', { weekday: 'long' })
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

export default async function Home() {
  const [temporadas, anoSelecionado] = await Promise.all([getTemporadas(), getAnoSelecionado()])
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

  const [{ data: etapasTodas }, { data: resUltima }, { data: pilotosPub }] = await Promise.all([
    supabase
      .from('etapas')
      .select('id, nome, pista, data, horario, status, link_mapa')
      .eq('campeonato_id', campeonato.id)
      .order('data', { ascending: true }),
    ultimaCorrida
      ? supabase
          .from('vw_resultados_publico')
          .select('*')
          .eq('etapa_id', ultimaCorrida.id)
          .order('posicao_chegada', { ascending: true })
      : Promise.resolve({
          data: [] as {
            piloto_id: string
            piloto_nome: string
            posicao_chegada: number
            melhor_volta_flag: boolean
          }[],
        }),
    supabase.from('vw_pilotos_publico').select('id, foto_url, numero_kart'),
  ])

  const etapas = (etapasTodas ?? []) as EtapaLista[]
  const realizadas = etapas.filter((e) => e.status === 'realizada').length
  const totalEtapas = etapas.length

  // Capa: a foto mais recente da mesma pista serve de capa para a etapa futura.
  const mesmaPistaRecentesPrimeiro = proximaEtapa
    ? etapas
        .filter((e) => e.status === 'realizada' && e.pista === proximaEtapa.pista)
        .map((e) => e.id)
        .reverse()
    : []

  const idsCapa = Array.from(
    new Set([...mesmaPistaRecentesPrimeiro, ...(ultimaCorrida ? [ultimaCorrida.id] : [])])
  )

  const { data: midias } = idsCapa.length
    ? await supabase
        .from('midia_etapa')
        .select('etapa_id, url, ordem')
        .eq('tipo', 'foto')
        .in('etapa_id', idsCapa)
        .order('ordem', { ascending: true })
    : { data: [] as { etapa_id: string; url: string; ordem: number | null }[] }

  const capaPorEtapa = new Map<string, string>()
  for (const m of midias ?? []) {
    if (!capaPorEtapa.has(m.etapa_id)) capaPorEtapa.set(m.etapa_id, m.url)
  }

  const capaProxima =
    mesmaPistaRecentesPrimeiro.map((id) => capaPorEtapa.get(id)).find(Boolean) ?? null
  const capaUltima = ultimaCorrida ? capaPorEtapa.get(ultimaCorrida.id) ?? null : null

  const fotoPorPiloto = new Map<string, string | null>(
    (pilotosPub ?? []).map((p: { id: string; foto_url: string | null }) => [p.id, p.foto_url])
  )

  const resultadosUltima = resUltima ?? []
  const vencedor = resultadosUltima.find((r) => r.posicao_chegada === 1)
  const voltaRapida = resultadosUltima.find((r) => r.melhor_volta_flag)

  const top3 = classificacao.slice(0, 3)
  const lider = top3[0] ?? null

  const dias = proximaEtapa ? diasAte(proximaEtapa.data) : null
  const perto = dias != null && dias >= 0 && dias <= 15
  const hoje = dias === 0

  const proximaCompleta = proximaEtapa
    ? etapas.find((e) => e.id === proximaEtapa.id) ?? null
    : null

  const proximas = etapas
    .filter((e) => e.status === 'agendada' && diasAte(e.data) >= 0)
    .filter((e) => !proximaEtapa || e.id !== proximaEtapa.id)
    .slice(0, 4)

  const estiloPodio = [
    {
      borda: 'border-gold/60',
      texto: 'text-gold',
      anel: 'ring-gold/60',
      selo: 'border-gold/50 text-gold bg-gold/10',
      brilho: 'shadow-[0_0_45px_-12px_rgba(255,184,0,0.55)]',
    },
    {
      borda: 'border-silver/30',
      texto: 'text-silver',
      anel: 'ring-silver/40',
      selo: 'border-silver/40 text-silver bg-silver/10',
      brilho: '',
    },
    {
      borda: 'border-bronze/30',
      texto: 'text-bronze',
      anel: 'ring-bronze/40',
      selo: 'border-bronze/40 text-bronze bg-bronze/10',
      brilho: '',
    },
  ]

  const tituloSecao = 'font-display uppercase text-sm tracking-wide text-white/50'
  const linkSecao =
    'flex items-center gap-1 text-accent hover:text-accent/80 text-[11px] font-medium uppercase tracking-wide transition-colors'

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
        <section className="mb-6 rounded-2xl border border-accent/30 bg-surface overflow-hidden">
          {capaProxima && (
            <div className="relative h-32 md:h-44 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capaProxima} alt={proximaEtapa.pista} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
            </div>
          )}

          <div className={`flex flex-col gap-4 p-5 md:p-6 ${capaProxima ? '-mt-10 relative' : ''}`}>
            <div className="flex items-center gap-2">
              <Calendar className="text-accent" size={14} />
              <span className="text-[10px] uppercase tracking-widest text-accent">Próxima etapa</span>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display font-bold text-2xl md:text-4xl leading-tight">
                  {proximaEtapa.pista}
                </p>
                <p className="text-white/50 text-sm mt-1">
                  {proximaEtapa.nome ? `${proximaEtapa.nome} · ` : ''}
                  {formatarData(proximaEtapa.data)}
                  {proximaEtapa.horario ? ` · ${String(proximaEtapa.horario).slice(0, 5)}` : ''}
                </p>
                {perto && !hoje && (
                  <p className="text-white/35 text-xs mt-0.5 capitalize">
                    {diaDaSemana(proximaEtapa.data)}
                  </p>
                )}
              </div>

              {dias != null && dias >= 0 && (
                <div className="shrink-0 text-right">
                  {hoje ? (
                    <span className="font-display font-bold text-accent text-4xl md:text-6xl leading-none">
                      HOJE
                    </span>
                  ) : (
                    <>
                      <span
                        className={`block font-display font-bold text-accent leading-none num-tab ${
                          perto ? 'text-6xl md:text-8xl' : 'text-4xl md:text-5xl'
                        }`}
                      >
                        {dias}
                      </span>
                      <span className="text-white/40 text-[10px] uppercase tracking-widest">
                        {dias === 1 ? 'dia para a corrida' : 'dias para a corrida'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {proximaCompleta?.link_mapa && (
              <a href={proximaCompleta.link_mapa} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2 text-sm text-white/70 hover:border-accent/50 hover:text-white transition-colors">
                <Navigation size={15} /> Como chegar
              </a>
            )}
          </div>
        </section>
      )}

      <section className="mb-7 grid grid-cols-3 gap-2.5 md:gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 flex flex-col items-center text-center">
          <Flag className="text-accent mb-2" size={20} />
          <p className="text-2xl md:text-3xl font-display font-bold num-tab leading-none">
            {realizadas}
          </p>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1.5 leading-tight">
            Etapas
            <br />
            realizadas
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 flex flex-col items-center text-center">
          <Users className="text-accent mb-2" size={20} />
          <p className="text-2xl md:text-3xl font-display font-bold num-tab leading-none">
            {totalPilotos}
          </p>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1.5 leading-tight">
            Pilotos
            <br />
            inscritos
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 flex flex-col items-center text-center">
          <Trophy className="text-gold mb-2" size={20} />
          <p className="font-display font-bold text-base md:text-xl leading-tight">
            {lider ? lider.nome : '—'}
          </p>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1.5 leading-tight">
            Líder do
            <br />
            campeonato
          </p>
        </div>
      </section>

      <section className="mb-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className={tituloSecao}>Pódio da temporada</h2>
          <Link href="/classificacao" className={linkSecao}>
            Ver classificação completa <ChevronRight size={13} />
          </Link>
        </div>

        {top3.length === 0 ? (
          <p className="text-white/40 text-sm">Sem resultados registrados ainda.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 md:gap-4 items-end">
            {[1, 0, 2].map((idx) => {
              const p = top3[idx]
              if (!p) return <div key={idx} />
              const e = estiloPodio[idx]
              const primeiro = idx === 0
              const foto = fotoPorPiloto.get(p.piloto_id) ?? null
              const tamanhoFoto = primeiro
                ? 'h-20 w-20 md:h-28 md:w-28'
                : 'h-14 w-14 md:h-20 md:w-20'
              return (
                <div key={p.piloto_id} className={primeiro ? 'relative z-10' : ''}>
                  <Link
                    href={`/pilotos/${p.piloto_id}`}
                    className={`relative block rounded-2xl border ${e.borda} ${e.brilho} bg-surface px-2 md:px-4 text-center transition-colors hover:border-accent/50 ${
                      primeiro ? 'py-6 md:py-8' : 'py-5 md:py-6'
                    }`}
                  >
                    <span
                      className={`absolute top-2 right-2 flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full border text-[10px] md:text-xs font-display font-bold ${e.selo}`}
                    >
                      {idx + 1}º
                    </span>

                    <span
                      className={`mx-auto flex ${tamanhoFoto} items-center justify-center overflow-hidden rounded-full ring-2 ${e.anel} bg-bg`}
                    >
                      {foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={foto} alt={p.nome} className="h-full w-full object-cover" />
                      ) : (
                        <span
                          className={`font-display font-bold ${e.texto} ${primeiro ? 'text-2xl' : 'text-lg'}`}
                        >
                          {iniciais(p.nome)}
                        </span>
                      )}
                    </span>

                    <span className="mt-3 block font-display font-semibold leading-tight text-sm md:text-lg">
                      {p.nome}
                    </span>

                    <span
                      className={`mt-2 block font-display font-bold leading-none num-tab ${
                        primeiro ? `${e.texto} text-3xl md:text-5xl` : 'text-white text-2xl md:text-4xl'
                      }`}
                    >
                      {p.pontos_totais}
                    </span>
                    <span className="mt-1 block text-white/35 text-[9px] uppercase tracking-widest">
                      pontos
                    </span>
                  </Link>

                  {primeiro && (
                    <div className="mx-auto h-4 w-3/4 rounded-b-2xl border-x border-b border-border bg-surface/70" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {ultimaCorrida && (
        <section className="mb-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className={tituloSecao}>Última corrida</h2>
            <Link href="/etapas" className={linkSecao}>
              Ver histórico <ChevronRight size={13} />
            </Link>
          </div>

          <Link href={`/etapas/${ultimaCorrida.id}`} className="block rounded-2xl border border-border bg-surface p-4 hover:border-accent/50 transition-colors">
            <div className="flex items-center gap-4">
              <span className="h-16 w-24 md:h-20 md:w-32 shrink-0 overflow-hidden rounded-xl border border-border bg-bg flex items-center justify-center">
                {capaUltima ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={capaUltima} alt={ultimaCorrida.pista} className="h-full w-full object-cover" />
                ) : (
                  <Flag className="text-white/20" size={22} />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-display font-bold text-xl md:text-2xl leading-tight truncate">
                  {ultimaCorrida.pista}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-white/40 text-sm">
                  <Calendar size={13} /> {formatarData(ultimaCorrida.data)}
                </span>
              </span>

              <ChevronRight className="text-white/25 shrink-0" size={18} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
              <span className="block">
                <span className="flex items-center justify-center gap-1.5 text-white/35 text-[9px] uppercase tracking-widest">
                  <Trophy className="text-gold" size={12} /> Vencedor
                </span>
                <span className="mt-1.5 flex items-center justify-center gap-1.5">
                  {vencedor && fotoPorPiloto.get(vencedor.piloto_id) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fotoPorPiloto.get(vencedor.piloto_id) as string} alt="" className="h-6 w-6 rounded-full object-cover" />
                  )}
                  <span className="text-sm font-medium truncate">
                    {vencedor?.piloto_nome ?? '—'}
                  </span>
                </span>
              </span>

              <span className="block">
                <span className="flex items-center justify-center gap-1.5 text-white/35 text-[9px] uppercase tracking-widest">
                  <Zap className="text-white/60" size={12} /> Volta rápida
                </span>
                <span className="mt-1.5 block text-sm font-medium truncate">
                  {voltaRapida?.piloto_nome ?? '—'}
                </span>
              </span>

              <span className="block">
                <span className="flex items-center justify-center gap-1.5 text-white/35 text-[9px] uppercase tracking-widest">
                  <Users className="text-white/60" size={12} /> Participantes
                </span>
                <span className="mt-1.5 block text-sm font-medium num-tab">
                  {pluralizar(resultadosUltima.length, 'piloto', 'pilotos')}
                </span>
              </span>
            </div>
          </Link>
        </section>
      )}

      {proximas.length > 0 && (
        <section className="mb-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className={tituloSecao}>Próximas etapas</h2>
            <Link href="/etapas" className={linkSecao}>
              Ver calendário completo <ChevronRight size={13} />
            </Link>
          </div>

          <ul className="flex flex-col gap-2">
            {proximas.map((e) => (
              <li key={e.id}>
                <Link href={`/etapas/${e.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3 hover:border-accent/50 transition-colors">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent font-display font-bold text-white text-sm num-tab">
                    {e.nome?.match(/\d+/)?.[0] ?? '—'}
                  </span>

                  <span className="min-w-0 flex-1 font-display font-semibold leading-tight truncate">
                    {e.pista}
                  </span>

                  <span className="shrink-0 flex items-center gap-1.5 text-white/40 text-xs num-tab">
                    <Clock size={11} />
                    {formatarData(e.data)}
                    {e.horario ? ` · ${String(e.horario).slice(0, 5)}` : ''}
                  </span>

                  <ChevronRight className="text-white/25 shrink-0" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4">
        <Link href="/regulamento" className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/50">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl transition-opacity opacity-60 group-hover:opacity-100" />
          <div className="relative flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
              <BookOpen className="text-accent" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-lg leading-tight">Regulamento</p>
              <p className="text-white/40 text-sm mt-0.5 leading-snug">
                Pontuação, lastro e regras da temporada
              </p>
            </div>
            <ArrowUpRight className="text-white/25 shrink-0 transition-colors group-hover:text-accent" size={18} />
          </div>
        </Link>

        <Link href="/estatisticas" className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-gold/50">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl transition-opacity opacity-60 group-hover:opacity-100" />
          <div className="relative flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10">
              <BarChart3 className="text-gold" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-lg leading-tight">Estatísticas</p>
              <p className="text-white/40 text-sm mt-0.5 leading-snug">
                Destaques, médias e desempenho por piloto
              </p>
            </div>
            <ArrowUpRight className="text-white/25 shrink-0 transition-colors group-hover:text-gold" size={18} />
          </div>
        </Link>
      </section>
    </main>
  )
}

export const dynamic = 'force-dynamic'
