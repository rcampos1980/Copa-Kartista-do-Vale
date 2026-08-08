'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { sair } from '@/app/auth/actions'
import {
  LayoutDashboard,
  Trophy,
  Users,
  Flag,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  LogIn,
  MoreHorizontal,
  X,
} from 'lucide-react'

// Barra inferior: só as quatro telas do dia a dia. O resto vive em "Mais".
const principais = [
  { href: '/', label: 'Início', icon: LayoutDashboard },
  { href: '/classificacao', label: 'Classificação', icon: Trophy },
  { href: '/etapas', label: 'Etapas', icon: Flag },
  { href: '/pilotos', label: 'Pilotos', icon: Users },
]

const secundarias = [
  { href: '/regulamento', label: 'Regulamento', icon: BookOpen },
  { href: '/estatisticas', label: 'Estatísticas', icon: BarChart3 },
]

const itensDesktop = [
  { href: '/', label: 'Início', icon: LayoutDashboard },
  { href: '/classificacao', label: 'Classificação', icon: Trophy },
  { href: '/pilotos', label: 'Pilotos', icon: Users },
  { href: '/etapas', label: 'Etapas', icon: Flag },
  { href: '/regulamento', label: 'Regulamento', icon: BookOpen },
  { href: '/estatisticas', label: 'Estatísticas', icon: BarChart3 },
]

export function Navegacao({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const [maisAberto, setMaisAberto] = useState(false)

  const ehAtivo = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  // Fecha a folha ao trocar de página.
  useEffect(() => {
    setMaisAberto(false)
  }, [pathname])

  const emSecundaria =
    secundarias.some((i) => ehAtivo(i.href)) || pathname.startsWith('/admin')

  return (
    <>
      {/* Barra lateral — computador */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col border-r border-border bg-surface px-3 py-6 print:hidden">
        <Link href="/" className="mb-8 block rounded-xl bg-black p-2">
          <Image
            src="/logo.png"
            alt="Copa Kartista do Vale"
            width={2180}
            height={1226}
            priority
            className="h-auto w-full"
          />
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {itensDesktop.map((item) => {
            const ativo = ehAtivo(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  ativo
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            )
          })}

          {isAdmin && (
            <Link
              href="/admin/pilotos"
              className={`mt-1 flex items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname.startsWith('/admin')
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings size={19} />
              Administração
            </Link>
          )}
        </nav>

        <div className="border-t border-border pt-3">
          {isAdmin ? (
            <form action={sair}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors"
              >
                <LogOut size={19} />
                Sair
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/35 hover:bg-white/5 hover:text-white/70 transition-colors"
            >
              <LogIn size={19} />
              Entrar
            </Link>
          )}
        </div>
      </aside>

      {/* Folha "Mais" — celular */}
      {maisAberto && (
        <div className="md:hidden fixed inset-0 z-50 print:hidden">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setMaisAberto(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-border bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display uppercase text-xs tracking-widest text-white/40">
                Mais
              </span>
              <button
                type="button"
                onClick={() => setMaisAberto(false)}
                className="text-white/40 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {secundarias.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      ehAtivo(item.href)
                        ? 'bg-accent/10 text-accent'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={19} />
                    {item.label}
                  </Link>
                )
              })}

              {isAdmin && (
                <Link
                  href="/admin/pilotos"
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    pathname.startsWith('/admin')
                      ? 'bg-accent/10 text-accent'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <Settings size={19} />
                  Administração
                </Link>
              )}

              <div className="mt-1 border-t border-border pt-1">
                {isAdmin ? (
                  <form action={sair}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/50 hover:bg-white/5 transition-colors"
                    >
                      <LogOut size={19} />
                      Sair
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/40 hover:bg-white/5 transition-colors"
                  >
                    <LogIn size={19} />
                    Entrar
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra inferior — celular */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur-xl print:hidden pb-[env(safe-area-inset-bottom)]">
        {principais.map((item) => {
          const ativo = ehAtivo(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                ativo ? 'text-accent' : 'text-white/50'
              }`}
            >
              <Icon size={21} />
              {item.label}
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => setMaisAberto(true)}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
            maisAberto || emSecundaria ? 'text-accent' : 'text-white/50'
          }`}
        >
          <MoreHorizontal size={21} />
          Mais
        </button>
      </nav>
    </>
  )
}
