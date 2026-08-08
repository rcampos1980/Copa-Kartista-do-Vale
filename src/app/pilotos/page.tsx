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

      <section className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2.5">
        {pilotos.map((piloto) => (
          <Link
            key={piloto.id}
            href={`/pilotos/${piloto.id}`}
            className="bg-surface border border-border rounded-xl p-3.5 flex items-center gap-3 hover:border-accent/50 transition-colors"
          >
            <div className="relative shrink-0">
              {piloto.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={piloto.foto_url}
                  alt={piloto.nome}
                  className="w-12 h-12 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-bg border border-border flex items-center justify-center">
                  <User className="text-white/30" size={22} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-display font-semibold text-white text-base leading-tight truncate">
                {piloto.nome}
              </p>
              <div className="mt-1 flex items-center gap-2 min-w-0">
                <BadgeTipo tipo={piloto.tipo} />
                {piloto.numero_kart != null && (
                  <span className="text-white/40 text-xs truncate num-tab">
                    Kart {piloto.numero_kart}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
