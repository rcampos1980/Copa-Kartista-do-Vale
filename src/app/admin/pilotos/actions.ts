'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ANO_ATUAL = 2026

export async function salvarPiloto(formData: FormData) {
  const supabase = await createClient()

  const id = (formData.get('id') as string | null) || null
  const ativo = formData.get('ativo') === 'true'

  const dados = {
    nome: formData.get('nome') as string,
    idade: formData.get('idade') ? Number(formData.get('idade')) : null,
    numero_kart: formData.get('numero_kart') ? Number(formData.get('numero_kart')) : null,
    cidade: (formData.get('cidade') as string) || null,
    telefone: (formData.get('telefone') as string) || null,
    categoria: (formData.get('categoria') as string) || null,
    estilo_pilotagem: (formData.get('estilo_pilotagem') as string) || null,
    caracteristicas: (formData.get('caracteristicas') as string) || null,
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
    await supabase.from('pilotos').update(patch).eq('id', id)
  } else {
    const insert = fotoUrl ? { ...dados, foto_url: fotoUrl } : dados
    const { data: novo } = await supabase
      .from('pilotos')
      .insert(insert)
      .select('id')
      .maybeSingle()
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
      await supabase.from('participacoes').update({ tipo, peso }).eq('id', existente.id)
    } else {
      await supabase
        .from('participacoes')
        .insert({ piloto_id: pilotoId, campeonato_id: campeonato.id, tipo, peso })
    }
  }

  revalidatePath('/', 'layout')
}

export async function alternarAtivo(id: string, ativo: boolean) {
  const supabase = await createClient()
  await supabase.from('pilotos').update({ ativo: !ativo }).eq('id', id)
  revalidatePath('/', 'layout')
}
