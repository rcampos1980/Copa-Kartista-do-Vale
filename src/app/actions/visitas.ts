'use server'

import { createClient } from '@/lib/supabase/server'

export async function registrarVisita(
  caminho: string,
  sessao: string,
  referencia: string | null,
  dispositivo: string
) {
  try {
    const supabase = await createClient()
    await supabase.from('visitas').insert({
      caminho,
      sessao,
      referencia: referencia || null,
      dispositivo,
    })
  } catch {
    // registro de visita nunca deve quebrar a navegacao
  }
}
