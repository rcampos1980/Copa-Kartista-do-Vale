'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type LinhaResultado = {
  piloto_id: string
  posicao_chegada: number
  is_convidado: boolean
  peso_convidado: number | null
  melhor_volta_flag: boolean
}

export async function salvarResultados(
  etapaId: string,
  campeonatoId: string,
  linhas: LinhaResultado[]
) {
  const supabase = await createClient()

  const { data: regras } = await supabase
    .from('regras_pontuacao')
    .select('posicao, pontos')
    .eq('campeonato_id', campeonatoId)

  const pontosPorPosicao = new Map((regras ?? []).map((r) => [r.posicao, r.pontos]))

  await supabase.from('resultados').delete().eq('etapa_id', etapaId)

  const registros = linhas
    .filter((l) => l.piloto_id && l.posicao_chegada)
    .map((l) => ({
      etapa_id: etapaId,
      piloto_id: l.piloto_id,
      posicao_chegada: l.posicao_chegada,
      pontos: l.is_convidado ? 0 : pontosPorPosicao.get(l.posicao_chegada) ?? 0,
      is_convidado: l.is_convidado,
      peso_convidado: l.is_convidado ? l.peso_convidado : null,
      melhor_volta_flag: l.melhor_volta_flag,
    }))

  if (registros.length > 0) {
    await supabase.from('resultados').insert(registros)
  }

  revalidatePath('/', 'layout')
}
