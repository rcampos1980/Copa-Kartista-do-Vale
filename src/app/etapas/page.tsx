import { getEtapas } from '@/lib/supabase/queries'
import { getAnoSelecionado } from '@/lib/temporada'
import { formatarData } from '@/lib/format'
import Link from 'next/link'
import { Flag, Calendar, ChevronRight } from 'lucide-react'

const statusLabel: Record<string, { texto: string; cor: string }> = {
  agendada: { texto: 'Agendada', cor: 'text-sky-400 bg-sky-500/15' },
  realizada: { texto: 'Realizada', cor: 'text-emerald-400 bg-emerald-500/15' },
  cancelada: { texto: 'Cancelada', cor: 'text-white/50 bg-white/10' },
}

export default async function EtapasPage() {
  const anoSelecionado = await getAnoSelecionado()
  const { campeonato, etapas } = await getEtapas(anoSelecionado ?? undefined)

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

      {etapas.length === 0 && (
        <p className="text-white/50">Nenhuma etapa cadastrada ainda.</p>
      )}

      <section className="flex flex-col gap-3">
        {etapas.map((etapa, i) => {
          const status = statusLabel[etapa.status] ?? statusLabel.agendada
          return (
            <Link
              key={etapa.id}
              href={`/etapas/${etapa.id}`}
              className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-accent/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-bg border border-border flex items-center justify-center shrink-0">
                <Flag className="text-accent" size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold text-white text-lg truncate">
                    {etapa.nome ?? `Etapa ${i + 1}`}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${status.cor}`}>
                    {status.texto}
                  </span>
                </div>
                <p className="text-white/50 text-sm truncate">{etapa.pista}</p>
                <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                  <Calendar size={12} /> {formatarData(etapa.data)}
                </p>
              </div>
              <ChevronRight className="text-white/30 shrink-0" size={20} />
            </Link>
          )
        })}
      </section>
    </main>
  )
}
