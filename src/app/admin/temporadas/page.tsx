import { getTemporadasTodas } from '@/lib/temporada'
import { MenuAdmin } from '@/components/MenuAdmin'
import { GestaoTemporadas } from './GestaoTemporadas'
import { criarTemporada, salvarTemporada, alternarVisibilidade } from './actions'

export default async function AdminTemporadasPage() {
  const temporadas = await getTemporadasTodas()

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-accent font-display">
          Administração
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Temporadas e regulamento
        </h1>
      </header>

      <MenuAdmin />

      <GestaoTemporadas
        temporadas={temporadas}
        criarTemporada={criarTemporada}
        salvarTemporada={salvarTemporada}
        alternarVisibilidade={alternarVisibilidade}
      />
    </main>
  )
}

export const dynamic = 'force-dynamic'
