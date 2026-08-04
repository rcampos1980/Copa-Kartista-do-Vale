import { createClient } from '@/lib/supabase/server'
import { salvarPiloto, alternarAtivo } from './actions'
import { GestaoPilotos } from './GestaoPilotos'
import { MenuAdmin } from '@/components/MenuAdmin'

const ANO_ATUAL = 2026

export default async function AdminPilotosPage() {
  const supabase = await createClient()

  const { data: campeonato } = await supabase
    .from('campeonatos')
    .select('id')
    .eq('ano', ANO_ATUAL)
    .maybeSingle()

  const { data: pilotos } = await supabase
    .from('pilotos')
    .select('*')
    .order('nome', { ascending: true })

  const { data: participacoes } = await supabase
    .from('participacoes')
    .select('piloto_id, peso, tipo')
    .eq('campeonato_id', campeonato?.id ?? '')

  const partPorPiloto = new Map(
    (participacoes ?? []).map((p) => [p.piloto_id, { peso: p.peso, tipo: p.tipo }])
  )

  const pilotosCompletos = (pilotos ?? [])
    .map((p) => ({
      ...p,
      peso: partPorPiloto.get(p.id)?.peso ?? null,
      tipo: partPorPiloto.get(p.id)?.tipo ?? null,
    }))
    // Ativos primeiro, depois inativos; cada grupo em ordem alfabetica
    .sort((a, b) => {
      if (a.ativo !== b.ativo) return a.ativo ? -1 : 1
      return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
    })

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

      <MenuAdmin />

      <GestaoPilotos
        pilotos={pilotosCompletos}
        salvarPiloto={salvarPiloto}
        alternarAtivo={alternarAtivo}
      />
    </main>
  )
}
