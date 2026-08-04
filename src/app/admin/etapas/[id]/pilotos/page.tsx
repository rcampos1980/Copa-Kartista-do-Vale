import { createClient } from '@/lib/supabase/server'
import { SeletorPilotos } from './SeletorPilotos'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ParticipantesEtapaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: etapa } = await supabase
    .from('etapas')
    .select('id, nome, pista')
    .eq('id', id)
    .maybeSingle()

  if (!etapa) notFound()

  const { data: pilotos } = await supabase
    .from('pilotos')
    .select('id, nome, numero_kart, foto_url')
    .eq('ativo', true)
    .order('nome', { ascending: true })

  const { data: jaSelecionados } = await supabase
    .from('etapa_pilotos')
    .select('piloto_id')
    .eq('etapa_id', id)

  const selecionadosIniciais = (jaSelecionados ?? []).map((r) => r.piloto_id)

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <Link
        href="/admin/etapas"
        className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Voltar para etapas
      </Link>

      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-accent font-display">
          Participantes da etapa
        </p>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          {etapa.nome ?? 'Etapa'} · {etapa.pista}
        </h1>
      </header>

      <SeletorPilotos
        etapaId={etapa.id}
        pilotos={pilotos ?? []}
        selecionadosIniciais={selecionadosIniciais}
      />
    </main>
  )
}
