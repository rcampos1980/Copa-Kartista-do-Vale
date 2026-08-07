'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type Resultado = { ok: boolean; mensagem: string }

export async function recalcularLastro(etapaId: string): Promise<Resultado> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('congelar_lastro_etapa', {
    etapa_uuid: etapaId,
  })
  if (error) return { ok: false, mensagem: `Não consegui recalcular: ${error.message}` }
  revalidatePath('/', 'layout')
  return { ok: true, mensagem: `Lastro atualizado para ${data ?? 0} pilotos.` }
}

export async function ajustarLastro(
  etapaId: string,
  pilotoId: string,
  valor: number
): Promise<Resultado> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('ajustar_lastro_piloto', {
    etapa_uuid: etapaId,
    piloto_uuid: pilotoId,
    novo_lastro: Math.max(0, Math.round(valor)),
  })
  if (error) return { ok: false, mensagem: `Não consegui ajustar: ${error.message}` }
  revalidatePath('/', 'layout')
  return { ok: true, mensagem: 'Lastro ajustado.' }
}
