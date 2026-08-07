import { getAnoSelecionado, getRegulamento } from '@/lib/temporada'
import { BookOpen } from 'lucide-react'

export default async function RegulamentoPage() {
  const ano = await getAnoSelecionado()
  const campeonato = await getRegulamento(ano)

  const texto = campeonato?.regulamento?.trim()

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="font-display text-xs uppercase tracking-[0.28em] text-accent">
          Temporada {campeonato?.ano ?? '—'}
        </p>
        <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
          Regulamento
        </h1>
        <div className="mt-4 h-px w-full bg-gradient-to-r from-accent/60 via-border to-transparent" />
      </header>

      {!texto ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <BookOpen className="text-white/20 mx-auto mb-3" size={32} />
          <p className="text-white/50 text-sm">
            O regulamento desta temporada ainda não foi publicado.
          </p>
        </div>
      ) : (
        <article className="rounded-2xl border border-border bg-surface p-5 md:p-8">
          <div className="whitespace-pre-wrap text-white/80 text-[15px] leading-relaxed">
            {texto}
          </div>
        </article>
      )}
    </main>
  )
}

export const dynamic = 'force-dynamic'
