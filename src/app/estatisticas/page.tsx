import { BarChart3 } from 'lucide-react'

export default function EstatisticasPage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-white/50 font-display">
          Temporada 2026
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Estatísticas
        </h1>
      </header>

      <div className="bg-surface border border-border rounded-2xl p-10 flex flex-col items-center text-center">
        <BarChart3 className="text-white/20" size={48} />
        <p className="mt-4 font-display text-lg text-white/70">Em breve</p>
        <p className="mt-1 text-white/40 text-sm max-w-md">
          Rankings de vitórias, pódios, melhor média de pontos, maior evolução e
          comparativos entre pilotos. Esta seção será construída em breve.
        </p>
      </div>
    </main>
  )
}
