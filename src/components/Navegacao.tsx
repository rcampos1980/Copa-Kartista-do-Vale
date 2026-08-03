'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Trophy, Users, Flag, BarChart3 } from 'lucide-react'

const itens = [
  { href: '/', label: 'Início', icon: LayoutDashboard },
  { href: '/classificacao', label: 'Classificação', icon: Trophy },
  { href: '/pilotos', label: 'Pilotos', icon: Users },
  { href: '/etapas', label: 'Etapas', icon: Flag },
  { href: '/estatisticas', label: 'Stats', icon: BarChart3 },
]

export function Navegacao() {
  const pathname = usePathname()

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col border-r border-border bg-surface px-3 py-6">
        <div className="mb-8 px-3">
          <p className="font-display text-lg font-bold leading-tight text-white">
            Copa Kartista
          </p>
          <p className="font-display text-sm text-accent">do Vale</p>
        </div>
        <nav className="flex flex-col gap-1">
          {itens.map((item) => {
            const ativo = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  ativo
                    ? 'bg-accent/10 text-accent'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-surface">
        {itens.map((item) => {
          const ativo = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                ativo ? 'text-accent' : 'text-white/50'
              }`}
            >
              <Icon size={22} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
