import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const COOKIE = 'temporada'

export type Temporada = { id: string; ano: number; nome: string | null }

export async function getTemporadas(): Promise<Temporada[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campeonatos')
    .select('id, ano, nome')
    .order('ano', { ascending: false })
  return data ?? []
}

// Ano selecionado pelo cookie; se ausente ou invalido, usa o mais recente (corrente)
export async function getAnoSelecionado(): Promise<number | null> {
  const temporadas = await getTemporadas()
  if (temporadas.length === 0) return null

  const anos = temporadas.map((t) => t.ano)
  const maisRecente = anos[0] // ja vem ordenado desc

  const cookieStore = await cookies()
  const bruto = cookieStore.get(COOKIE)?.value
  const escolhido = bruto ? Number(bruto) : NaN

  if (!Number.isNaN(escolhido) && anos.includes(escolhido)) {
    return escolhido
  }
  return maisRecente
}
