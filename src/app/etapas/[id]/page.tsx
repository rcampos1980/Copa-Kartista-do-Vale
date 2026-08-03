import { getEtapaDetalhe } from '@/lib/supabase/queries'
import { formatarData } from '@/lib/format'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EtapaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dados = await getEtapaDetalhe(id)

  if (!dados) notFound()

  const { etapa, resultados } = dados

  const corPosicao = (pos: number) => {
    if (pos === 1) return 'text-gold'
    if (pos === 2) return 'text-silver'
    if (pos === 3) return 'text-bronze'
    return 'text-white/40'
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <Link
        href="/etapas"
        className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Voltar para etapas
      </Link>

      <header className="mb-8">
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

      <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-3">
        Resultado da corrida
      </h2>

      {resultados.length === 0 ? (
        <p className="text-white/40 text-sm">
          Resultado ainda não lançado para esta etapa.
        </p>
      ) : (
        <section className="bg-surface border border-border rounded-2xl overflow-hidden">
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
    </main>
  )
}
