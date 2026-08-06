import { getPilotoPerfil } from '@/lib/supabase/queries'
import { formatarData, pluralizar } from '@/lib/format'
import { BadgeTipo } from '@/components/Badge'
import { User, Trophy, Medal, Flag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function PerfilPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dados = await getPilotoPerfil(id)

  if (!dados) notFound()

  const { piloto, stats, resultados } = dados

  const cards = [
    { label: 'Pontos', valor: stats.pontos_totais, icon: Trophy, cor: 'text-accent' },
    { label: 'Vitórias', valor: stats.vitorias, icon: Medal, cor: 'text-gold' },
    { label: 'Pódios', valor: stats.podios, icon: Medal, cor: 'text-silver' },
    { label: 'Corridas', valor: resultados.length, icon: Flag, cor: 'text-white/70' },
  ]

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <Link
        href="/pilotos"
        className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Voltar para pilotos
      </Link>

      {/* Cabeçalho */}
      <header className="flex items-center gap-5 mb-8">
        <div className="relative shrink-0">
          {piloto.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={piloto.foto_url}
              alt={piloto.nome}
              className="w-24 h-24 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-surface border border-border flex items-center justify-center">
              <User className="text-white/30" size={40} />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">
            {piloto.nome}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-white/50 text-sm">
            {piloto.cidade && <span>{piloto.cidade}</span>}
            {piloto.idade && <span>· {piloto.idade} anos</span>}
          </div>
          <div className="mt-2">
            <BadgeTipo tipo={piloto.tipo} />
          </div>
        </div>
      </header>

      {/* Cards de estatística */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-surface border border-border rounded-2xl p-4 md:p-5">
              <Icon className={c.cor} size={22} />
              <p className="mt-2 font-display text-2xl md:text-3xl font-bold text-white">
                {c.valor}
              </p>
              <p className="text-white/50 text-xs md:text-sm">{c.label}</p>
            </div>
          )
        })}
      </section>

      {/* Características */}
      {(piloto.estilo_pilotagem || piloto.caracteristicas) && (
        <section className="bg-surface border border-border rounded-2xl p-5 mb-8">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-2">
            Perfil do piloto
          </h2>
          {piloto.estilo_pilotagem && (
            <p className="text-white/80 text-sm">
              <span className="text-white/50">Estilo: </span>
              {piloto.estilo_pilotagem}
            </p>
          )}
          {piloto.caracteristicas && (
            <p className="text-white/80 text-sm mt-1">{piloto.caracteristicas}</p>
          )}
        </section>
      )}

      {/* Histórico de etapas */}
      <section>
        <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-3">
          Etapas disputadas
        </h2>
        {resultados.length === 0 ? (
          <p className="text-white/40 text-sm">Nenhuma corrida registrada ainda.</p>
        ) : (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {resultados.map((r, i) => {
              const etapa = Array.isArray(r.etapas) ? r.etapas[0] : r.etapas
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 px-4 md:px-6 py-3.5 border-b border-border last:border-b-0"
                >
                  <span className="font-display font-bold text-white/40 text-lg w-10 shrink-0">
                    {r.posicao_chegada}º
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {etapa?.pista ?? 'Etapa'}
                    </p>
                    <p className="text-white/40 text-xs">
                      {etapa?.data ? formatarData(etapa.data) : ''}
                      {r.is_convidado && ' · como convidado'}
                    </p>
                  </div>
                  <span className="font-display font-bold text-accent text-lg shrink-0">
                    {r.is_convidado ? '—' : pluralizar(r.pontos, 'pt', 'pts')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
