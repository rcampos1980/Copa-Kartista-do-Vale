import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

const COOKIE = 'temporada'

export type Temporada = {
  id: string
  ano: number
  nome: string | null
  visivel?: boolean
  regulamento?: string | null
  peso_alvo?: number | null
  bonus_melhor_volta?: number | null
}

export async function getTemporadas(): Promise<Temporada[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campeonatos')
    .select('id, ano, nome, visivel')
    .eq('visivel', true)
    .order('ano', { ascending: false })
  return data ?? []
}

export async function getTemporadasTodas(): Promise<Temporada[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('campeonatos')
    .select('id, ano, nome, visivel, regulamento, peso_alvo, bonus_melhor_volta')
    .order('ano', { ascending: false })
  return data ?? []
}

export async function getAnoSelecionado(): Promise<number | null> {
  const temporadas = await getTemporadas()
  if (temporadas.length === 0) return null

  const anos = temporadas.map((t) => t.ano)
  const maisRecente = anos[0]

  const cookieStore = await cookies()
  const bruto = cookieStore.get(COOKIE)?.value
  const escolhido = bruto ? Number(bruto) : NaN

  if (!Number.isNaN(escolhido) && anos.includes(escolhido)) {
    return escolhido
  }
  return maisRecente
}

export async function getRegulamento(ano: number | null) {
  const supabase = await createClient()
  const consulta = supabase
    .from('campeonatos')
    .select('id, ano, nome, regulamento')
    .eq('visivel', true)

  const { data } =
    ano != null
      ? await consulta.eq('ano', ano).maybeSingle()
      : await consulta.order('ano', { ascending: false }).limit(1).maybeSingle()

  return data
}
