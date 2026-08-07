'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Flag, Trophy, CalendarRange, LifeBuoy, BarChart3 } from 'lucide-react'

const itens = [
  { href: '/admin/pilotos', label: 'Pilotos', icon: Users },
  { href: '/admin/etapas', label: 'Etapas', icon: Flag },
  { href: '/admin/pontuacao', label: 'Pontuação', icon: Trophy },
  { href: '/admin/temporadas', label: 'Temporadas', icon: CalendarRange },
  { href: '/admin/visitas', label: 'Visitas', icon: BarChart3 },
  { href: '/admin/manual', label: 'Manual', icon: LifeBuoy },
]

export function MenuAdmin() {
  const pathname = usePathname()
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {itens.map((item) => {
        const ativo = pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              ativo
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-white/60 hover:text-white'
            }`}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
