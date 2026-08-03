import { createClient } from '@/lib/supabase/server'
import { salvarPiloto, alternarAtivo } from './actions'
import { FormPiloto } from './FormPiloto'
import { LinhaPiloto } from './LinhaPiloto'

export default async function AdminPilotosPage() {
  const supabase = await createClient()
  const { data: pilotos } = await supabase
    .from('pilotos')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-accent font-display">
          Administração
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Gestão de Pilotos
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de novo piloto */}
        <section className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-4">
            Novo piloto
          </h2>
          <FormPiloto salvarPiloto={salvarPiloto} />
        </section>

        {/* Lista de pilotos existentes */}
        <section className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-4">
            Pilotos cadastrados ({pilotos?.length ?? 0})
          </h2>
          <div className="flex flex-col gap-2">
            {(pilotos ?? []).map((p) => (
              <LinhaPiloto key={p.id} piloto={p} alternarAtivo={alternarAtivo} />
            ))}
            {(!pilotos || pilotos.length === 0) && (
              <p className="text-white/40 text-sm">Nenhum piloto ainda.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
