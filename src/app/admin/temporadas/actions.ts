'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type Resultado = { ok: boolean; mensagem: string }

export async function criarTemporada(formData: FormData): Promise<Resultado> {
  const supabase = await createClient()

  const ano = Number(formData.get('ano'))
  const nome = ((formData.get('nome') as string) ?? '').trim()

  if (!ano || ano < 2000 || ano > 2100) {
    return { ok: false, mensagem: 'Informe um ano válido.' }
  }
  if (!nome) {
    return { ok: false, mensagem: 'Informe o nome do campeonato.' }
  }

  const { data: existe } = await supabase
    .from('campeonatos')
    .select('id')
    .eq('ano', ano)
    .maybeSingle()

  if (existe) {
    return { ok: false, mensagem: `Já existe uma temporada para ${ano}.` }
  }

  const { error } = await supabase.from('campeonatos').insert({
    ano,
    nome,
    peso_alvo: Number(formData.get('peso_alvo')) || 90,
    bonus_melhor_volta: Number(formData.get('bonus_melhor_volta')) || 0,
    visivel: formData.get('visivel') === 'true',
  })

  if (error) return { ok: false, mensagem: `Não consegui criar: ${error.message}` }

  revalidatePath('/', 'layout')
  return { ok: true, mensagem: `Temporada ${ano} criada. Cadastre as etapas e a pontuação nas outras abas.` }
}

export async function salvarTemporada(formData: FormData): Promise<Resultado> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  if (!id) return { ok: false, mensagem: 'Temporada não identificada.' }

  const { error } = await supabase
    .from('campeonatos')
    .update({
      nome: ((formData.get('nome') as string) ?? '').trim(),
      peso_alvo: Number(formData.get('peso_alvo')) || 90,
      bonus_melhor_volta: Number(formData.get('bonus_melhor_volta')) || 0,
      regulamento: ((formData.get('regulamento') as string) ?? '').trim() || null,
      visivel: formData.get('visivel') === 'true',
    })
    .eq('id', id)

  if (error) return { ok: false, mensagem: `Não consegui salvar: ${error.message}` }

  revalidatePath('/', 'layout')
  return { ok: true, mensagem: 'Temporada salva.' }
}

export async function alternarVisibilidade(id: string, visivel: boolean): Promise<Resultado> {
  const supabase = await createClient()
  const { error } = await supabase.from('campeonatos').update({ visivel: !visivel }).eq('id', id)
  if (error) return { ok: false, mensagem: error.message }
  revalidatePath('/', 'layout')
  return { ok: true, mensagem: !visivel ? 'Temporada visível para os pilotos.' : 'Temporada ocultada.' }
}
