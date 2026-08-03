'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trophy, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    setCarregando(false)

    if (error) {
      setErro('Email ou senha incorretos.')
      return
    }

    router.push('/admin/pilotos')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Trophy className="text-gold" size={40} />
          <h1 className="mt-3 font-display text-2xl font-bold text-white">
            Copa Kartista do Vale
          </h1>
          <p className="text-white/50 text-sm">Acesso administrativo</p>
        </div>

        <form
          onSubmit={entrar}
          className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4"
        >
          <div>
            <label className="text-white/60 text-sm block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white outline-none focus:border-accent transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm block mb-1.5">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
            />
          </div>

          {erro && <p className="text-accent text-sm">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="mt-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn size={18} />
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
