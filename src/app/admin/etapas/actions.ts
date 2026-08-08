'use server'

import { createClient } from '@/lib/supabase/server'
import { getCampeonatoAdmin } from '@/lib/campeonato'
import { revalidatePath } from 'next/cache'


export async function salvarEtapa(formData: FormData) {
  const supabase = await createClient()

  const campeonato = await getCampeonatoAdmin()

  if (!campeonato) return

  const id = formData.get('id') as string | null
  const dados = {
    campeonato_id: campeonato.id,
    nome: (formData.get('nome') as string) || null,
    pista: formData.get('pista') as string,
    data: formData.get('data') as string,
    horario: (formData.get('horario') as string) || null,
    status: (formData.get('status') as string) || 'agendada',
    observacoes: (formData.get('observacoes') as string) || null,
  }

  if (id) {
    await supabase.from('etapas').update(dados).eq('id', id)
  } else {
    await supabase.from('etapas').insert(dados)
  }

  revalidatePath('/', 'layout')
}

export async function excluirEtapa(id: string) {
  const supabase = await createClient()
  await supabase.from('etapas').delete().eq('id', id)
  revalidatePath('/', 'layout')
}
