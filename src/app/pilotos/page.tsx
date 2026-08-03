import { getPilotos } from '@/lib/supabase/queries'
import { BadgeTipo } from '@/components/Badge'
import Link from 'next/link'
import { User } from 'lucide-react'

export default async function PilotosPage() {
  const pilotos = await getPilotos()

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-white/50 font-display">
          Temporada 2026
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Pilotos
        </h1>
      </header>

      {pilotos.length === 0 && (
        <p className="text-white/50">Nenhum piloto cadastrado ainda.</p>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pilotos.map((piloto) => (
          <Link
            key={piloto.id}
            href={`/pilotos/${piloto.id}`}
            className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-accent/50 transition-colors"
          >
            <div className="relative shrink-0">
              {piloto.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={piloto.foto_url}
                  alt={piloto.nome}
                  className="w-16 h-16 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-bg border border-border flex items-center justify-center">
                  <User className="text-white/30" size={28} />
                </div>
              )}
              {piloto.numero_kart != null && (
                <span className="absolute -bottom-1 -right-1 bg-accent text-white text-xs font-display font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-surface">
                  {piloto.numero_kart}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-display font-semibold text-white text-lg leading-tight truncate">
                {piloto.nome}
              </p>
              <p className="text-white/50 text-sm truncate">
                {piloto.cidade ?? 'Cidade não informada'}
              </p>
              <div className="mt-1.5">
                <BadgeTipo tipo={piloto.tipo} />
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
