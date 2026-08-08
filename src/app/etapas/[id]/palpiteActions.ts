'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type Resultado = { ok: boolean; mensagem: string }

export async function salvarPalpite(formData: FormData): Promise<Resultado> {
  const supabase = await createClient()

  const { data: dadosUser } = await supabase.auth.getUser()
  if (!dadosUser?.user) {
    return { ok: false, mensagem: 'Você precisa estar logado para palpitar.' }
  }

  const etapaId = formData.get('etapa_id') as string
  const primeiro = formData.get('primeiro') as string
  const segundo = formData.get('segundo') as string
  const terceiro = formData.get('terceiro') as string

  if (!etapaId || !primeiro || !segundo || !terceiro) {
    return { ok: false, mensagem: 'Escolha os três pilotos do pódio.' }
  }

  if (new Set([primeiro, segundo, terceiro]).size !== 3) {
    return { ok: false, mensagem: 'Os três pilotos precisam ser diferentes.' }
  }

  const { error } = await supabase.from('palpites').upsert(
    {
      etapa_id: etapaId,
      usuario_id: dadosUser.user.id,
      primeiro,
      segundo,
      terceiro,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: 'etapa_id,usuario_id' }
  )

  if (error) {
    const fechado = /row-level security|violates/i.test(error.message)
    return {
      ok: false,
      mensagem: fechado
        ? 'Os palpites desta etapa já foram encerrados.'
        : `Não consegui salvar: ${error.message}`,
    }
  }

  revalidatePath('/', 'layout')
  return { ok: true, mensagem: 'Palpite registrado. Boa sorte.' }
}
