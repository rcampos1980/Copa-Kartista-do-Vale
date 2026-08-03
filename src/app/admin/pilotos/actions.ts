'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarPiloto(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string | null
  const dados = {
    nome: formData.get('nome') as string,
    idade: formData.get('idade') ? Number(formData.get('idade')) : null,
    numero_kart: formData.get('numero_kart') ? Number(formData.get('numero_kart')) : null,
    cidade: (formData.get('cidade') as string) || null,
    telefone: (formData.get('telefone') as string) || null,
    categoria: (formData.get('categoria') as string) || null,
    estilo_pilotagem: (formData.get('estilo_pilotagem') as string) || null,
    caracteristicas: (formData.get('caracteristicas') as string) || null,
  }

  if (id) {
    await supabase.from('pilotos').update(dados).eq('id', id)
  } else {
    await supabase.from('pilotos').insert(dados)
  }

  revalidatePath('/admin/pilotos')
  revalidatePath('/pilotos')
}

export async function alternarAtivo(id: string, ativo: boolean) {
  const supabase = await createClient()
  await supabase.from('pilotos').update({ ativo: !ativo }).eq('id', id)
  revalidatePath('/admin/pilotos')
  revalidatePath('/pilotos')
}
