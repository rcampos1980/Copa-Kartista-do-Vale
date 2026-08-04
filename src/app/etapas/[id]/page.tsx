import { getEtapaDetalhe } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { formatarData } from '@/lib/format'
import { BotaoImprimir } from './BotaoImprimir'
import { ArrowLeft, Calendar, MapPin, Weight, Play, Camera } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Midia = {
  id: string
  tipo: string
  url: string
  titulo: string | null
}

function idYoutube(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  )
  return m ? m[1] : null
}

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
  const { data: midiaBruta } = await supabase
    .from('midia_etapa')
    .select('id, tipo, url, titulo')
    .eq('etapa_id', id)
    .order('created_at', { ascending: false })

  const midia: Midia[] = midiaBruta ?? []
  const videos = midia.filter((m) => m.tipo === 'video')
  const fotos = midia.filter((m) => m.tipo === 'foto')

  const corPosicao = (pos: number) => {
    if (pos === 1) return 'text-gold'
    if (pos === 2) return 'text-silver'
    if (pos === 3) return 'text-bronze'
    return 'text-white/40'
  }

  const lastroComPeso = lastro.filter((l: { peso: number | null }) => l.peso != null)
  const pesoAlvo = lastro[0]?.peso_alvo ?? 90

  const camp = Array.isArray(etapa.campeonatos) ? etapa.campeonatos[0] : etapa.campeonatos
  const nomeCampeonato = camp?.nome ?? "Copa Kartista do Vale"
  const dataArquivo = etapa.data.split("T")[0].split("-").reverse().join("-")
  const nomeArquivo = `${nomeCampeonato} - ${etapa.pista} - ${dataArquivo}`

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <Link
        href="/etapas"
        className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors print:hidden"
      >
        <ArrowLeft size={16} /> Voltar para etapas
      </Link>

      <header className="mb-8 print:hidden">
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

      <div className="print:hidden">
        <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-3">
          Resultado da corrida
        </h2>

        {resultados.length === 0 ? (
          <p className="text-white/40 text-sm mb-10">
            Resultado ainda não lançado para esta etapa.
          </p>
        ) : (
          <section className="bg-surface border border-border rounded-2xl overflow-hidden mb-10">
            {resultados.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-4 px-4 md:px-6 py-3.5 border-b border-border last:border-b-0"
              >
                <span
                  className={`font-display font-bold text-xl w-8 shrink-0 ${corPosicao(
                    r.posicao_chegada
                  )}`}
                >
                  {r.posicao_chegada}º
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">
                      {r.piloto_nome ?? 'Piloto'}
                    </span>
                    {r.is_convidado && (
                      <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-400 shrink-0">
                        Convidado
                      </span>
                    )}
                  </div>
                  {r.piloto_numero != null && (
                    <span className="text-white/40 text-xs">#{r.piloto_numero}</span>
                  )}
                </div>
                <span className="font-display font-bold text-accent text-lg shrink-0">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {videos.map((v) => {
              const yt = idYoutube(v.url)
              return (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent/50"
                >
                  <div className="relative aspect-video bg-bg">
                    {yt ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://img.youtube.com/vi/${yt}/hqdefault.jpg`}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-hover:bg-black/20">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                        <Play className="text-white ml-0.5" size={20} fill="currentColor" />
                      </span>
                    </span>
                  </div>
                  <p className="px-3 py-2.5 text-sm text-white truncate">
                    {v.titulo ?? 'Assistir vídeo'}
                  </p>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {fotos.length > 0 && (
        <div className="print:hidden mb-10">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-3 flex items-center gap-2">
            <Camera size={15} /> Fotos ({fotos.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {fotos.map((f) => (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface transition-transform hover:scale-[1.02]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="area-impressao">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Weight className="text-accent print:hidden" size={18} />
            <div>
              <h2 className="font-display uppercase text-sm tracking-wide text-white/50">
                Relatório de lastro · alvo {pesoAlvo} kg
              </h2>
              <p className="hidden print:block text-sm">
                {etapa.nome} · {etapa.pista} · {formatarData(etapa.data)}
              </p>
            </div>
          </div>
          <BotaoImprimir nomeArquivo={nomeArquivo} />
        </div>

        {lastroComPeso.length === 0 ? (
          <p className="text-white/40 text-sm">
            Nenhum peso cadastrado ainda. Cadastre o peso dos pilotos na área de administração.
          </p>
        ) : (
          <section className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-4 px-4 md:px-6 py-2.5 border-b border-border text-white/40 text-xs uppercase tracking-wide">
              <span className="flex-1">Piloto</span>
              <span className="w-20 text-right print:hidden">Peso</span>
              <span className="w-24 text-right">Lastro</span>
              <span className="w-20 text-right hidden md:inline print:hidden">Total</span>
            </div>
            {lastroComPeso.map(
              (l: {
                piloto_id: string
                piloto_nome: string
                piloto_numero: number | null
                tipo: string
                peso: number
                lastro: number
              }) => (
                <div
                  key={l.piloto_id}
                  className="flex items-center gap-4 px-4 md:px-6 py-3.5 border-b border-border last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">
                        {l.piloto_nome}
                      </span>
                      {l.tipo === 'convidado' && (
                        <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-400 shrink-0">
                          Convidado
                        </span>
                      )}
                    </div>
                    {l.piloto_numero != null && (
                      <span className="text-white/40 text-xs print:hidden">#{l.piloto_numero}</span>
                    )}
                  </div>
                  <span className="w-16 md:w-20 text-right text-white/70 text-sm print:hidden">
                    {Number(l.peso).toFixed(0)} kg
                  </span>
                  <span className="w-20 md:w-24 text-right font-display font-bold text-accent text-lg">
                    {l.lastro} kg
                  </span>
                  <span className="w-16 md:w-20 text-right text-white/50 text-sm hidden md:inline print:hidden">
                    {Number(l.peso) + Number(l.lastro)} kg
                  </span>
                </div>
              )
            )}
          </section>
        )}
      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'
