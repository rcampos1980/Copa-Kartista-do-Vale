import { getTemporadasTodas } from '@/lib/temporada'
import { getCampeonatoAdmin } from '@/lib/campeonato'
import { trocarTemporada } from '@/lib/temporadaActions'
import { CalendarRange } from 'lucide-react'

export async function BarraTemporadaAdmin() {
  const [temporadas, atual] = await Promise.all([getTemporadasTodas(), getCampeonatoAdmin()])

  if (!atual) return null

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3">
      <CalendarRange className="text-amber-400 shrink-0" size={16} />
      <span className="text-amber-200/80 text-sm">
        Operando na temporada <strong className="font-display font-bold text-amber-200">{atual.ano}</strong>
      </span>
      {temporadas.length > 1 && (
        <div className="flex flex-wrap gap-1.5 ml-auto">
          {temporadas.map((t) => (
            <form key={t.id} action={trocarTemporada.bind(null, t.ano)}>
              <button
                type="submit"
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  t.ano === atual.ano
                    ? 'bg-amber-500/25 text-amber-100'
                    : 'bg-bg border border-border text-white/50 hover:text-white'
                }`}
              >
                {t.ano}
                {t.visivel === false && <span className="ml-1 opacity-50">oculta</span>}
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  )
}
