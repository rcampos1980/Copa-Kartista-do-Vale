'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarPontuacao(
  campeonatoId: string,
  bonusMelhorVolta: number,
  regras: { posicao: number; pontos: number }[]
) {
  const supabase = await createClient()

  await supabase
    .from('campeonatos')
    .update({ bonus_melhor_volta: bonusMelhorVolta })
    .eq('id', campeonatoId)

  await supabase.from('regras_pontuacao').delete().eq('campeonato_id', campeonatoId)

  const linhas = regras.map((r) => ({
    campeonato_id: campeonatoId,
    posicao: r.posicao,
    pontos: r.pontos,
  }))
  await supabase.from('regras_pontuacao').insert(linhas)

  revalidatePath('/', 'layout')
}
