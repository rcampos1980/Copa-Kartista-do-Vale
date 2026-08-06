'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { KeyRound, ArrowRight } from 'lucide-react'

export default function DefinirSenhaPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const [etapa, setEtapa] = useState<'codigo' | 'senha'>('codigo')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function conferirCodigo(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    const limpo = codigo.replace(/\D/g, '')
    if (limpo.length < 6) {
      setErro('Digite o código completo que veio no e-mail.')
      return
    }

    setCarregando(true)
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: limpo,
      type: 'recovery',
    })
    setCarregando(false)

    if (error) {
      setErro('Código inválido ou expirado. Peça um novo ao administrador.')
      return
    }

    setEtapa('senha')
  }

  async function salvarSenha(e: React.FormEvent) {
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

    setCarregando(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setCarregando(false)

    if (error) {
      setErro(error.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  const input = 'w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-accent transition-colors'
  const rotulo = 'text-white/60 text-xs block mb-1'
  const botao = 'mt-2 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 transition-colors'

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="text-accent" size={18} />
          <h1 className="font-display text-xl font-bold text-white">Definir senha</h1>
        </div>

        {etapa === 'codigo' && (
          <form onSubmit={conferirCodigo} className="flex flex-col gap-3">
            <p className="text-white/40 text-sm mb-3">Digite o e-mail cadastrado e o código que você recebeu.</p>

            <div>
              <label className={rotulo}>E-mail</label>
              <input type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} className={input} placeholder="voce@email.com" autoComplete="username" required />
            </div>

            <div>
              <label className={rotulo}>Código do e-mail</label>
              <input type="text" inputMode="numeric" value={codigo} onChange={(ev) => setCodigo(ev.target.value)} className={`${input} tracking-[0.25em] text-center text-lg`} placeholder="00000000" maxLength={12} required />
            </div>

            {erro && <p className="text-red-400 text-sm">{erro}</p>}

            <button type="submit" disabled={carregando} className={botao}>
              {carregando ? 'Conferindo...' : 'Continuar'}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {etapa === 'senha' && (
          <form onSubmit={salvarSenha} className="flex flex-col gap-3">
            <p className="text-white/40 text-sm mb-3">Código confirmado. Agora escolha a senha que você vai usar para entrar.</p>

            <div>
              <label className={rotulo}>Nova senha</label>
              <input type="password" value={senha} onChange={(ev) => setSenha(ev.target.value)} className={input} placeholder="mínimo 8 caracteres" autoComplete="new-password" required />
            </div>

            <div>
              <label className={rotulo}>Repita a senha</label>
              <input type="password" value={confirmacao} onChange={(ev) => setConfirmacao(ev.target.value)} className={input} autoComplete="new-password" required />
            </div>

            {erro && <p className="text-red-400 text-sm">{erro}</p>}

            <button type="submit" disabled={carregando} className={botao}>
              {carregando ? 'Salvando...' : 'Salvar e entrar'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
