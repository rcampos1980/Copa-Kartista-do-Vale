import { createClient } from '@/lib/supabase/server'
import { salvarEtapa } from './actions'
import { GestaoEtapas } from './GestaoEtapas'
import { MenuAdmin } from '@/components/MenuAdmin'

const ANO_ATUAL = 2026

export default async function AdminEtapasPage() {
  const supabase = await createClient()

  const { data: campeonato } = await supabase
    .from('campeonatos')
    .select('id')
    .eq('ano', ANO_ATUAL)
    .maybeSingle()

  const { data: etapas } = await supabase
    .from('etapas')
    .select('*')
    .eq('campeonato_id', campeonato?.id ?? '')
    .order('data', { ascending: true })

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-accent font-display">
          Administração
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Gestão de Etapas
        </h1>
      </header>

      <MenuAdmin />

      <GestaoEtapas etapas={etapas ?? []} salvarEtapa={salvarEtapa} />
    </main>
  )
}
