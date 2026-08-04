'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function trocarTemporada(ano: number) {
  const cookieStore = await cookies()
  cookieStore.set('temporada', String(ano), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 ano
  })
  revalidatePath('/', 'layout')
}
