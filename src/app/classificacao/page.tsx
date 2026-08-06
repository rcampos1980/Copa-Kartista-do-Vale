import { getClassificacao } from '@/lib/supabase/queries'
import { pluralizar } from '@/lib/format'
import { Medal } from 'lucide-react'

export default async function ClassificacaoPage() {
  const dados = await getClassificacao()

  if (!dados) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white/60">
        Nenhum campeonato encontrado.
      </main>
    )
  }

  const { campeonato, classificacao } = dados
  const podio = classificacao.slice(0, 3)
  const restante = classificacao.slice(3)

  const coresMedalha = ['text-gold', 'text-silver', 'text-bronze']
  const ordemPodio = [1, 0, 2] // 2º, 1º, 3º

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-white/50 font-display">
          Classificação · Temporada {campeonato.ano}
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Classificação Geral
        </h1>
      </header>

      {classificacao.length === 0 && (
        <p className="text-white/50">Nenhum resultado registrado ainda.</p>
      )}

      {/* Pódio */}
      {podio.length > 0 && (
        <section className="mb-10 grid grid-cols-3 gap-3 md:gap-4 items-end">
          {ordemPodio.map((idx) => {
            const piloto = podio[idx]
            if (!piloto) return <div key={idx} />
            const primeiro = idx === 0
            return (
              <div
                key={piloto.piloto_id}
                className={`bg-surface border rounded-2xl px-2 md:px-6 flex flex-col items-center justify-center text-center ${
                  primeiro
                    ? 'border-gold/40 py-6 min-h-[220px] md:min-h-0 md:py-6 md:pb-10'
                    : 'border-border py-4 min-h-[164px] md:min-h-0 md:py-6'
                }`}
              >
                <Medal className={coresMedalha[idx]} size={primeiro ? 40 : 30} />
                <p className="mt-2 font-display text-2xl md:text-3xl font-bold text-white">
                  {idx + 1}º
                </p>
                <p className="mt-0.5 font-display font-semibold text-white text-sm md:text-lg leading-tight">
                  {piloto.nome}
                </p>
                <p className="mt-2 text-accent font-display text-xl md:text-3xl font-bold leading-none">
                  {piloto.pontos_totais}
                </p>
                <p className="mt-1 text-white/40 text-[10px] md:text-xs uppercase tracking-wide">
                  pontos
                </p>
              </div>
            )
          })}
        </section>
      )}

      {/* Restante da tabela */}
      {restante.length > 0 && (
        <section className="bg-surface border border-border rounded-2xl overflow-hidden">
          {restante.map((piloto, i) => (
            <div
              key={piloto.piloto_id}
              className="flex items-center gap-4 px-4 md:px-6 py-3.5 border-b border-border last:border-b-0"
            >
              <span className="font-display font-bold text-white/40 text-lg w-8 shrink-0">
                {i + 4}º
              </span>
              <span className="flex-1 font-medium text-white">{piloto.nome}</span>
              <span className="text-white/50 text-sm hidden md:block">
                {pluralizar(piloto.vitorias, 'vitória', 'vitórias')} ·{' '}
                {pluralizar(piloto.podios, 'pódio', 'pódios')}
              </span>
              <span className="font-display font-bold text-accent text-lg w-16 text-right shrink-0">
                {piloto.pontos_totais}
              </span>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
