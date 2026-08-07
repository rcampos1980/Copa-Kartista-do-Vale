'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { registrarVisita } from '@/app/actions/visitas'

export function Rastreador() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return

    let sessao = ''
    try {
      sessao = localStorage.getItem('sessao_visita') ?? ''
      if (!sessao) {
        sessao = crypto.randomUUID()
        localStorage.setItem('sessao_visita', sessao)
      }
    } catch {
      sessao = 'anonimo'
    }

    const dispositivo = window.innerWidth < 768 ? 'celular' : 'computador'
    const referencia = document.referrer && !document.referrer.includes(window.location.host)
      ? document.referrer
      : null

    void registrarVisita(pathname, sessao, referencia, dispositivo)
  }, [pathname])

  return null
}
