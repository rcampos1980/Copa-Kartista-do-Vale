'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarParticipantes(etapaId: string, pilotoIds: string[]) {
  const supabase = await createClient()

  await supabase.from('etapa_pilotos').delete().eq('etapa_id', etapaId)

  if (pilotoIds.length > 0) {
    const linhas = pilotoIds.map((piloto_id) => ({ etapa_id: etapaId, piloto_id }))
    await supabase.from('etapa_pilotos').insert(linhas)
  }

  revalidatePath('/', 'layout')
}
