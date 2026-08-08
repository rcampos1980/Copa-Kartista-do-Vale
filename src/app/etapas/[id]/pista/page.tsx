import { getEtapaDetalhe } from '@/lib/supabase/queries'
import { formatarData } from '@/lib/format'
import { ListaPista } from './ListaPista'
import { ArrowLeft, Weight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ModoPistaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dados = await getEtapaDetalhe(id)
  if (!dados) notFound()

  const { etapa, lastro } = dados
  const itens = lastro.filter((l: { peso: number | null }) => l.peso != null)
  const pesoAlvo = lastro[0]?.peso_alvo ?? 90

  return (
    <main className="min-h-screen px-4 py-6 md:px-10 md:py-8">
      <Link
        href={`/etapas/${id}`}
        className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Voltar para a etapa
      </Link>

      <header className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Weight className="text-accent" size={16} />
          <p className="font-display uppercase text-[11px] tracking-[0.2em] text-accent">
            Modo pista · alvo {pesoAlvo} kg
          </p>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
          {etapa.pista}
        </h1>
        <p className="text-white/40 text-sm">
          {etapa.nome ? `${etapa.nome} · ` : ''}
          {formatarData(etapa.data)}
        </p>
      </header>

      {itens.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <Weight className="text-white/15 mx-auto mb-3" size={28} />
          <p className="text-white/60 text-sm font-medium">Nenhum piloto com peso cadastrado</p>
          <p className="text-white/35 text-xs mt-1">
            Associe os pilotos à etapa e confira os pesos na administração.
          </p>
        </div>
      ) : (
        <ListaPista etapaId={id} itens={itens} />
      )}
    </main>
  )
}

export const dynamic = 'force-dynamic'
