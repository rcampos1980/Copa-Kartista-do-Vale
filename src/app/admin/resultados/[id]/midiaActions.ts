'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adicionarLink(etapaId: string, tipo: 'video' | 'foto', url: string, titulo: string) {
  const supabase = await createClient()
  await supabase.from('midia_etapa').insert({
    etapa_id: etapaId,
    tipo,
    url,
    titulo: titulo || null,
  })
  revalidatePath('/', 'layout')
}

export async function uploadFoto(etapaId: string, formData: FormData) {
  const supabase = await createClient()
  const arquivos = formData.getAll('foto') as File[]
  if (!arquivos || arquivos.length === 0) return

  for (const arquivo of arquivos) {
    if (!arquivo || arquivo.size === 0) continue

    const sufixo = Math.random().toString(36).slice(2, 8)
    const nomeLimpo = arquivo.name.replace(/[^a-zA-Z0-9.]/g, '_')
    const nomeArquivo = `${etapaId}/${Date.now()}-${sufixo}-${nomeLimpo}`

    const { error: upErro } = await supabase.storage.from('fotos-etapas').upload(nomeArquivo, arquivo)
    if (upErro) continue

    const { data: pub } = supabase.storage.from('fotos-etapas').getPublicUrl(nomeArquivo)

    await supabase.from('midia_etapa').insert({
      etapa_id: etapaId,
      tipo: 'foto',
      url: pub.publicUrl,
    })
  }

  revalidatePath('/', 'layout')
}

export async function removerMidia(id: string, etapaId: string) {
  const supabase = await createClient()
  await supabase.from('midia_etapa').delete().eq('id', id)
  revalidatePath('/', 'layout')
}
