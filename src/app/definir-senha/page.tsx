'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { KeyRound } from 'lucide-react'

export default function DefinirSenhaPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const [pronto, setPronto] = useState(false)
  const [temSessao, setTemSessao] = useState(false)
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    let vivo = true

    supabase.auth.getSession().then(({ data }) => {
      if (!vivo) return
      setTemSessao(Boolean(data.session))
      setPronto(true)
    })

    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      if (!vivo) return
      setTemSessao(Boolean(sessao))
      setPronto(true)
    })

    return () => {
      vivo = false
      assinatura.subscription.unsubscribe()
    }
  }, [supabase])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (senha.length < 8) {
      setErro('A senha precisa ter pelo menos 8 caracteres.')
      return
    }
    if (senha !== confirmacao) {
      setErro('As duas senhas não são iguais.')
      return
    }

    setSalvando(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setSalvando(false)

    if (error) {
      setErro(error.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  const input = 'w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-accent transition-colors'

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="text-accent" size={18} />
          <h1 className="font-display text-xl font-bold text-white">Definir senha</h1>
        </div>
        <p className="text-white/40 text-sm mb-6">Escolha a senha que você vai usar para entrar no site.</p>

        {!pronto && <p className="text-white/50 text-sm">Verificando o convite...</p>}

        {pronto && !temSessao && (
          <div className="text-sm text-white/60 flex flex-col gap-3">
            <p>Este link não é válido ou já expirou.</p>
            <p className="text-white/40">Peça ao administrador para reenviar o convite, ou use a opção de recuperar senha na tela de login.</p>
            <a href="/login" className="text-accent hover:underline">Ir para o login</a>
          </div>
        )}

        {pronto && temSessao && (
          <form onSubmit={enviar} className="flex flex-col gap-3">
            <div>
              <label className="text-white/60 text-xs block mb-1">Nova senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className={input} placeholder="mínimo 8 caracteres" autoComplete="new-password" />
            </div>
            <div>
              <label className="text-white/60 text-xs block mb-1">Repita a senha</label>
              <input type="password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} className={input} autoComplete="new-password" />
            </div>

            {erro && <p className="text-red-400 text-sm">{erro}</p>}

            <button type="submit" disabled={salvando} className="mt-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 transition-colors">
              {salvando ? 'Salvando...' : 'Salvar e entrar'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
