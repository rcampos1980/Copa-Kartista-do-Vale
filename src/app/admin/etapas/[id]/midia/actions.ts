'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adicionarVideo(formData: FormData) {
  const supabase = await createClient()

  const etapaId = formData.get('etapa_id') as string
  const url = ((formData.get('url') as string) ?? '').trim()
  const titulo = ((formData.get('titulo') as string) ?? '').trim() || null

  if (!etapaId || !url) return

  const { error } = await supabase.from('midia_etapa').insert({
    etapa_id: etapaId,
    tipo: 'video',
    url,
    titulo,
  })

  if (error) throw new Error(`Falha ao salvar video: ${error.message}`)

  revalidatePath('/', 'layout')
}

export async function enviarFotos(formData: FormData) {
  const supabase = await createClient()

  const etapaId = formData.get('etapa_id') as string
  const arquivos = formData.getAll('fotos') as File[]

  if (!etapaId) throw new Error('Etapa nao informada')
  if (arquivos.length === 0) throw new Error('Nenhum arquivo recebido')

  for (const arquivo of arquivos) {
    if (!arquivo || arquivo.size === 0) continue

    const extensao = arquivo.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const caminho = `${etapaId}/${crypto.randomUUID()}.${extensao}`

    const subida = await supabase.storage
      .from('fotos-etapas')
      .upload(caminho, arquivo, {
        contentType: arquivo.type || 'image/jpeg',
        upsert: false,
      })

    if (subida.error) {
      throw new Error(
        `Upload falhou (${arquivo.name}, ${Math.round(arquivo.size / 1024)} KB): ${subida.error.message}`
      )
    }

    const { data } = supabase.storage.from('fotos-etapas').getPublicUrl(caminho)

    const gravacao = await supabase.from('midia_etapa').insert({
      etapa_id: etapaId,
      tipo: 'foto',
      url: data.publicUrl,
      titulo: arquivo.name,
    })

    if (gravacao.error) {
      throw new Error(`Falha ao gravar no banco: ${gravacao.error.message}`)
    }
  }

  revalidatePath('/', 'layout')
}

export async function excluirMidia(id: string) {
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('midia_etapa')
    .select('url, tipo')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('midia_etapa').delete().eq('id', id)
  if (error) throw new Error(`Falha ao excluir: ${error.message}`)

  if (item?.tipo === 'foto' && item.url) {
    const marca = '/fotos-etapas/'
    const pos = item.url.indexOf(marca)
    if (pos !== -1) {
      const caminho = decodeURIComponent(item.url.slice(pos + marca.length).split('?')[0])
      await supabase.storage.from('fotos-etapas').remove([caminho])
    }
  }

  revalidatePath('/', 'layout')
}
