import { getEtapaDetalhe } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { formatarData } from '@/lib/format'
import { PainelLastro } from './PainelLastro'
import { Galeria } from './Galeria'
import { AcoesEtapa } from './AcoesEtapa'
import { recalcularLastro, ajustarLastro } from './actions'
import { ArrowLeft, Calendar, MapPin, Play, Trophy, Zap, Users, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Midia = { id: string; tipo: string; url: string; titulo: string | null }

function idYoutube(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/)
  return m ? m[1] : null
}

const ESTILO_PODIO = [
  { borda: 'border-gold/45', texto: 'text-gold', fundo: 'from-gold/[0.09]' },
  { borda: 'border-silver/35', texto: 'text-silver', fundo: 'from-silver/[0.06]' },
  { borda: 'border-bronze/35', texto: 'text-bronze', fundo: 'from-bronze/[0.07]' },
]

export default async function EtapaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dados = await getEtapaDetalhe(id)
  if (!dados) notFound()

  const { etapa, resultados, lastro } = dados
  const supabase = await createClient()

  const { data: dadosUser } = await supabase.auth.getUser()
  let isAdmin = false
  if (dadosUser?.user) {
    const { data: perfil } = await supabase
      .from('usuarios')
      .select('role')
      .eq('id', dadosUser.user.id)
      .maybeSingle()
    isAdmin = perfil?.role === 'admin'
  }

  const { data: midiaBruta } = await supabase
    .from('midia_etapa')
    .select('id, tipo, url, titulo')
    .eq('etapa_id', id)
    .order('created_at', { ascending: false })

  const midia: Midia[] = midiaBruta ?? []
  const videos = midia.filter((m) => m.tipo === 'video')
  const fotos = midia.filter((m) => m.tipo === 'foto')

  const { data: anterior } = await supabase
    .from('etapas')
    .select('id, pista')
    .eq('campeonato_id', etapa.campeonato_id)
    .eq('status', 'realizada')
    .lt('data', etapa.data)
    .order('data', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: resAnterior } = anterior
    ? await supabase
        .from('vw_resultados_publico')
        .select('piloto_id, posicao_chegada')
        .eq('etapa_id', anterior.id)
    : { data: [] }

  const posAnterior = new Map((resAnterior ?? []).map((r) => [r.piloto_id, r.posicao_chegada]))

  const variacoes = resultados
    .filter((r) => posAnterior.has(r.piloto_id))
    .map((r) => ({
      nome: r.piloto_nome ?? 'Piloto',
      delta: (posAnterior.get(r.piloto_id) ?? 0) - r.posicao_chegada,
    }))
    .sort((a, b) => b.delta - a.delta)

  const maiorAvanco = variacoes[0]
  const maiorQueda = variacoes[variacoes.length - 1]

  const podio = resultados.filter((r) => r.posicao_chegada <= 3).slice(0, 3)
  const ordemPodio = [1, 0, 2]
  const voltaRapida = resultados.find((r) => r.melhor_volta_flag)
  const convidados = resultados.filter((r) => r.is_convidado).length
  const pontosDistribuidos = resultados
    .filter((r) => !r.is_convidado)
    .reduce((s, r) => s + (r.pontos ?? 0), 0)

  const corPosicao = (pos: number) => {
    if (pos === 1) return 'text-gold'
    if (pos === 2) return 'text-silver'
    if (pos === 3) return 'text-bronze'
    return 'text-white/40'
  }

  const lastroComPeso = lastro.filter((l: { peso: number | null }) => l.peso != null)
  const pesoAlvo = lastro[0]?.peso_alvo ?? 90

  const camp = Array.isArray(etapa.campeonatos) ? etapa.campeonatos[0] : etapa.campeonatos
  const nomeCampeonato = camp?.nome ?? 'Copa Kartista do Vale'
  const dataArquivo = etapa.data.split('T')[0].split('-').reverse().join('-')
  const nomeArquivo = `${nomeCampeonato} - ${etapa.pista} - ${dataArquivo}`

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <Link
        href="/etapas"
        className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors print:hidden"
      >
        <ArrowLeft size={16} /> Voltar para etapas
      </Link>

      <header className="mb-5 print:hidden">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          {etapa.nome ?? 'Etapa'}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-white/50 text-sm">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} /> {etapa.pista}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} /> {formatarData(etapa.data)}
          </span>
        </div>
      </header>

      <AcoesEtapa etapaId={id} titulo={`${etapa.pista}`} jaAconteceu={resultados.length > 0} />

      {podio.length > 0 && (
        <section className="mb-6 print:hidden">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-3">
            Pódio da corrida
          </h2>
          <div className="grid grid-cols-3 gap-2.5 md:gap-4 items-end">
            {ordemPodio.map((idx) => {
              const p = podio[idx]
              if (!p) return <div key={idx} />
              const e = ESTILO_PODIO[idx]
              const primeiro = idx === 0
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border ${e.borda} bg-gradient-to-b ${e.fundo} to-transparent bg-surface px-2 md:px-5 flex flex-col items-center justify-center text-center ${
                    primeiro ? 'py-5 min-h-[170px] md:min-h-0 md:py-6' : 'py-4 min-h-[140px] md:min-h-0 md:py-4'
                  }`}
                >
                  <Trophy className={e.texto} size={primeiro ? 26 : 20} strokeWidth={1.6} />
                  <p className={`mt-2 font-display font-bold leading-none num-tab ${e.texto} ${primeiro ? 'text-3xl' : 'text-2xl'}`}>
                    {p.posicao_chegada}º
                  </p>
                  <p className="mt-2 font-display font-semibold leading-tight text-sm md:text-base">
                    {p.piloto_nome}
                  </p>
                  <p className="mt-1.5 font-display font-bold text-white leading-none num-tab text-lg md:text-xl">
                    {p.is_convidado ? '—' : p.pontos}
                  </p>
                  <p className="mt-0.5 text-white/30 text-[9px] uppercase tracking-widest">
                    {p.is_convidado ? 'convidado' : 'pontos'}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {resultados.length > 0 && (
        <section className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-2.5 print:hidden">
          <div className="bg-surface border border-border rounded-xl p-4">
            <Users className="text-white/40 mb-2" size={16} />
            <p className="font-display font-bold text-white text-2xl leading-none num-tab">
              {resultados.length}
            </p>
            <p className="text-white/35 text-xs mt-1">
              na pista{convidados > 0 ? ` · ${convidados} convidado${convidados > 1 ? 's' : ''}` : ''}
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <Zap className="text-accent mb-2" size={16} />
            <p className="font-display font-bold text-white text-base leading-tight truncate">
              {voltaRapida?.piloto_nome ?? '—'}
            </p>
            <p className="text-white/35 text-xs mt-1">volta mais rápida</p>
          </div>

          {maiorAvanco && maiorAvanco.delta > 0 ? (
            <div className="bg-surface border border-border rounded-xl p-4">
              <TrendingUp className="text-emerald-400 mb-2" size={16} />
              <p className="font-display font-bold text-white text-base leading-tight truncate">
                {maiorAvanco.nome}
              </p>
              <p className="text-white/35 text-xs mt-1">
                subiu {maiorAvanco.delta} {maiorAvanco.delta === 1 ? 'posição' : 'posições'} desde {anterior?.pista}
              </p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-4">
              <Trophy className="text-gold mb-2" size={16} />
              <p className="font-display font-bold text-white text-base leading-tight truncate">
                {podio[0]?.piloto_nome ?? '—'}
              </p>
              <p className="text-white/35 text-xs mt-1">vencedor da etapa</p>
            </div>
          )}

          {maiorQueda && maiorQueda.delta < 0 ? (
            <div className="bg-surface border border-border rounded-xl p-4">
              <TrendingDown className="text-red-400 mb-2" size={16} />
              <p className="font-display font-bold text-white text-base leading-tight truncate">
                {maiorQueda.nome}
              </p>
              <p className="text-white/35 text-xs mt-1">
                caiu {Math.abs(maiorQueda.delta)} {Math.abs(maiorQueda.delta) === 1 ? 'posição' : 'posições'}
              </p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-4">
              <Trophy className="text-white/40 mb-2" size={16} />
              <p className="font-display font-bold text-white text-2xl leading-none num-tab">
                {pontosDistribuidos}
              </p>
              <p className="text-white/35 text-xs mt-1">pontos distribuídos</p>
            </div>
          )}
        </section>
      )}

      <div className="print:hidden">
        <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-3">
          Resultado completo
        </h2>

        {resultados.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center mb-10">
            <Trophy className="text-white/15 mx-auto mb-3" size={28} />
            <p className="text-white/60 text-sm font-medium">Resultado ainda não lançado</p>
            <p className="text-white/35 text-xs mt-1">
              Assim que a corrida acontecer, a classificação aparece aqui.
            </p>
          </div>
        ) : (
          <section className="bg-surface border border-border rounded-2xl overflow-hidden mb-10">
            {resultados.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-4 px-4 md:px-6 py-3 border-b border-border last:border-b-0"
              >
                <span className={`font-display font-bold text-lg w-8 shrink-0 num-tab ${corPosicao(r.posicao_chegada)}`}>
                  {r.posicao_chegada}º
                </span>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="font-medium text-white truncate">
                    {r.piloto_nome ?? 'Piloto'}
                  </span>
                  {r.melhor_volta_flag && <Zap className="text-accent shrink-0" size={13} />}
                  {r.is_convidado && (
                    <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-400 shrink-0">
                      Convidado
                    </span>
                  )}
                </div>
                <span className="font-display font-bold text-white text-base shrink-0 num-tab">
                  {r.is_convidado ? '—' : `${r.pontos} pts`}
                </span>
              </div>
            ))}
          </section>
        )}
      </div>

      {videos.length > 0 && (
        <div className="print:hidden mb-10">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-3">
            Vídeos
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
            {videos.map((v) => {
              const yt = idYoutube(v.url)
              return (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/60"
                >
                  <div className="relative aspect-video bg-bg">
                    {yt ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`https://img.youtube.com/vi/${yt}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" />
                    ) : null}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-hover:bg-black/20">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/90">
                        <Play className="text-white ml-0.5" size={15} fill="currentColor" />
                      </span>
                    </span>
                  </div>
                  <p className="px-2.5 py-2 text-xs text-white/80 truncate">
                    {v.titulo ?? 'Assistir vídeo'}
                  </p>
                </a>
              )
            })}
          </div>
        </div>
      )}

      <Galeria fotos={fotos} />

      <PainelLastro
        etapaId={id}
        isAdmin={isAdmin}
        recalcularLastro={recalcularLastro}
        ajustarLastro={ajustarLastro}
        itens={lastroComPeso}
        pesoAlvo={pesoAlvo}
        linhaImpressao={`${etapa.nome} · ${etapa.pista} · ${formatarData(etapa.data)}`}
        nomeArquivo={nomeArquivo}
      />
    </main>
  )
}

export const dynamic = 'force-dynamic'
