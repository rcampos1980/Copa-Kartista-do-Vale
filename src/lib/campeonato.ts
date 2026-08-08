import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type CampeonatoAtivo = {
  id: string
  ano: number
  nome: string | null
  bonus_melhor_volta?: number | null
  peso_alvo?: number | null
}

/**
 * Temporada em que a administracao esta operando.
 * Segue o cookie escolhido no seletor e inclui temporadas ocultas,
 * ao contrario do getTemporadas publico.
 */
export async function getCampeonatoAdmin(): Promise<CampeonatoAtivo | null> {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const bruto = cookieStore.get('temporada')?.value
  const ano = bruto ? Number(bruto) : NaN

  const colunas = 'id, ano, nome, bonus_melhor_volta, peso_alvo'

  if (!Number.isNaN(ano)) {
    const { data } = await supabase
      .from('campeonatos')
      .select(colunas)
      .eq('ano', ano)
      .maybeSingle()
    if (data) return data
  }

  const { data } = await supabase
    .from('campeonatos')
    .select(colunas)
    .order('ano', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}
