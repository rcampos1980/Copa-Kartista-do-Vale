'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ANO_ATUAL = 2026

export async function salvarPiloto(formData: FormData) {
  const supabase = await createClient()

  const id = (formData.get('id') as string | null) || null
  const ativo = formData.get('ativo') === 'true'
  const isAdmin = formData.get('is_admin') === 'true'
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase() || null

  const dados = {
    nome: formData.get('nome') as string,
    idade: formData.get('idade') ? Number(formData.get('idade')) : null,
    numero_kart: formData.get('numero_kart') ? Number(formData.get('numero_kart')) : null,
    cidade: (formData.get('cidade') as string) || null,
    telefone: (formData.get('telefone') as string) || null,
    categoria: (formData.get('categoria') as string) || null,
    estilo_pilotagem: (formData.get('estilo_pilotagem') as string) || null,
    caracteristicas: (formData.get('caracteristicas') as string) || null,
    email,
    is_admin: isAdmin,
    ativo,
  }

  const tipo = (formData.get('tipo') as string) || null
  const peso = formData.get('peso') ? Number(formData.get('peso')) : null

  if (!tipo || peso == null) return

  const foto = formData.get('foto') as File | null
  let fotoUrl: string | null = null
  if (foto && foto.size > 0) {
    const sufixo = Math.random().toString(36).slice(2, 8)
    const nomeLimpo = foto.name.replace(/[^a-zA-Z0-9.]/g, '_')
    const caminho = `${Date.now()}-${sufixo}-${nomeLimpo}`
    const { error: upErro } = await supabase.storage.from('fotos-pilotos').upload(caminho, foto)
    if (!upErro) {
      const { data: pub } = supabase.storage.from('fotos-pilotos').getPublicUrl(caminho)
      fotoUrl = pub.publicUrl
    }
  }

  const { data: campeonato } = await supabase
    .from('campeonatos')
    .select('id')
    .eq('ano', ANO_ATUAL)
    .maybeSingle()

  let pilotoId: string | null = id

  if (id) {
    const patch = fotoUrl ? { ...dados, foto_url: fotoUrl } : dados
    const { error } = await supabase.from('pilotos').update(patch).eq('id', id)
    if (error) throw new Error(`Falha ao salvar piloto: ${error.message}`)
  } else {
    const insert = fotoUrl ? { ...dados, foto_url: fotoUrl } : dados
    const { data: novo, error } = await supabase
      .from('pilotos')
      .insert(insert)
      .select('id')
      .maybeSingle()
    if (error) throw new Error(`Falha ao cadastrar piloto: ${error.message}`)
    pilotoId = novo?.id ?? null
  }

  if (pilotoId && campeonato?.id) {
    const { data: existente } = await supabase
      .from('participacoes')
      .select('id')
      .eq('piloto_id', pilotoId)
      .eq('campeonato_id', campeonato.id)
      .maybeSingle()

    if (existente) {
      const { error } = await supabase
        .from('participacoes')
        .update({ tipo, peso })
        .eq('id', existente.id)
      if (error) throw new Error(`Falha ao salvar peso e tipo: ${error.message}`)
    } else {
      const { error } = await supabase
        .from('participacoes')
        .insert({ piloto_id: pilotoId, campeonato_id: campeonato.id, tipo, peso })
      if (error) throw new Error(`Falha ao criar participacao: ${error.message}`)
    }
  }

  // Se a pessoa ja tem conta, sincroniza o papel dela com o marcador do cadastro
  if (email && pilotoId) {
    await supabase
      .from('usuarios')
      .update({ role: isAdmin ? 'admin' : 'piloto', piloto_id: pilotoId })
      .eq('email', email)
  }

  revalidatePath('/', 'layout')
}

export async function alternarAtivo(id: string, ativo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('pilotos').update({ ativo: !ativo }).eq('id', id)
  if (error) throw new Error(`Falha ao alterar status: ${error.message}`)
  revalidatePath('/', 'layout')
}
