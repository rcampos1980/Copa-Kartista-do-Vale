import { getEtapas } from '@/lib/supabase/queries'
import { getAnoSelecionado } from '@/lib/temporada'
import { formatarData } from '@/lib/format'
import Link from 'next/link'
import { Flag, ChevronRight, CalendarX } from 'lucide-react'

const statusLabel: Record<string, { texto: string; cor: string }> = {
  agendada: { texto: 'Agendada', cor: 'text-sky-400 bg-sky-500/15' },
  realizada: { texto: 'Realizada', cor: 'text-emerald-400 bg-emerald-500/15' },
  cancelada: { texto: 'Cancelada', cor: 'text-white/50 bg-white/10' },
}

export default async function EtapasPage() {
  const anoSelecionado = await getAnoSelecionado()
  const { campeonato, etapas } = await getEtapas(anoSelecionado ?? undefined)

  const hoje = new Date().toISOString().split('T')[0]
  const proxima = etapas.find(
    (e) => e.status === 'agendada' && String(e.data).split('T')[0] >= hoje
  )

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-white/50 font-display">
          Temporada {campeonato?.ano ?? ''}
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Etapas
        </h1>
      </header>

      {etapas.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center">
          <CalendarX className="text-white/15 mx-auto mb-3" size={32} />
          <p className="text-white/60 text-sm font-medium">Nenhuma etapa cadastrada</p>
          <p className="text-white/35 text-xs mt-1">
            O calendário desta temporada ainda não foi publicado.
          </p>
        </div>
      ) : (
        <section className="flex flex-col gap-2">
          {etapas.map((etapa, i) => {
            const status = statusLabel[etapa.status] ?? statusLabel.agendada
            const ehProxima = proxima?.id === etapa.id
            return (
              <Link
                key={etapa.id}
                href={`/etapas/${etapa.id}`}
                className={`bg-surface border rounded-xl p-3.5 flex items-center gap-3 transition-colors ${
                  ehProxima
                    ? 'border-accent/45 hover:border-accent'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                    ehProxima ? 'bg-accent/15 border-accent/30' : 'bg-bg border-border'
                  }`}
                >
                  <Flag className="text-accent" size={17} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="font-display font-semibold text-white text-base truncate">
                      {etapa.nome ?? `Etapa ${i + 1}`}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${status.cor}`}>
                      {status.texto}
                    </span>
                    {ehProxima && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent shrink-0 hidden sm:inline">
                        Próxima
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs truncate mt-0.5">
                    {etapa.pista} · {formatarData(etapa.data)}
                  </p>
                </div>

                <ChevronRight className="text-white/25 shrink-0" size={18} />
              </Link>
            )
          })}
        </section>
      )}
    </main>
  )
}
