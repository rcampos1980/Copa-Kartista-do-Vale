import { getDashboardData } from '@/lib/supabase/queries'
import { formatarData, pluralizar } from '@/lib/format'
import { Trophy, Flag, Calendar, Users, Medal } from 'lucide-react'

export default async function Home() {
  const dashboard = await getDashboardData()

  if (!dashboard) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg text-white">
        <p>Nenhum campeonato ativo encontrado para o ano atual.</p>
      </main>
    )
  }

  const {
    campeonato,
    classificacao,
    proximaEtapa,
    ultimaCorrida,
    totalPilotos,
    totalEtapas,
  } = dashboard

  const lider = classificacao[0]
  const top3 = classificacao.slice(0, 3)

  return (
    <main className="min-h-screen bg-bg text-white px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-white/50 font-display">
          Temporada {campeonato.ano}
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          {campeonato.nome}
        </h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
          <Trophy className="text-gold shrink-0" size={32} />
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">Líder do campeonato</p>
            <p className="text-xl font-display font-semibold">{lider ? lider.nome : '—'}</p>
            <p className="text-white/60 text-sm">
              {lider ? pluralizar(lider.pontos_totais, 'ponto', 'pontos') : 'Sem corridas ainda'}
            </p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
          <Calendar className="text-accent shrink-0" size={32} />
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">Próxima etapa</p>
            <p className="text-xl font-display font-semibold">
              {proximaEtapa ? proximaEtapa.pista : 'A definir'}
            </p>
            <p className="text-white/60 text-sm">
              {proximaEtapa ? formatarData(proximaEtapa.data) : '—'}
            </p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
          <Flag className="text-white/80 shrink-0" size={32} />
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">Última corrida</p>
            <p className="text-xl font-display font-semibold">
              {ultimaCorrida ? ultimaCorrida.pista : 'Nenhuma ainda'}
            </p>
            <p className="text-white/60 text-sm">
              {ultimaCorrida ? formatarData(ultimaCorrida.data) : '—'}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-lg uppercase tracking-wide text-white/70 mb-3">
          Top 3 da temporada
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((piloto, i) => {
            const medalColor =
              i === 0 ? 'text-gold' : i === 1 ? 'text-silver' : 'text-bronze'
            return (
              <div
                key={piloto.piloto_id}
                className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4"
              >
                <Medal className={medalColor} size={28} />
                <div>
                  <p className="font-display font-semibold text-lg">
                    {i + 1}º {piloto.nome}
                  </p>
                  <p className="text-white/60 text-sm">
                    {pluralizar(piloto.pontos_totais, 'ponto', 'pontos')} ·{' '}
                    {pluralizar(piloto.vitorias, 'vitória', 'vitórias')}
                  </p>
                </div>
              </div>
            )
          })}
          {top3.length === 0 && (
            <p className="text-white/50 col-span-3">Sem resultados registrados ainda.</p>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
          <Users className="text-accent" size={28} />
          <div>
            <p className="text-2xl font-display font-bold">{totalPilotos}</p>
            <p className="text-white/50 text-sm">Pilotos fixos</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
          <Flag className="text-accent" size={28} />
          <div>
            <p className="text-2xl font-display font-bold">{totalEtapas}</p>
            <p className="text-white/50 text-sm">
              {pluralizar(totalEtapas, 'Etapa no ano', 'Etapas no ano')}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
