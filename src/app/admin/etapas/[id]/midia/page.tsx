import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GestaoMidia } from './GestaoMidia'
import { adicionarVideo, enviarFotos, excluirMidia } from './actions'

export default async function AdminMidiaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: etapa } = await supabase
    .from('etapas')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!etapa) notFound()

  const { data: midia } = await supabase
    .from('midia_etapa')
    .select('*')
    .eq('etapa_id', id)
    .order('created_at', { ascending: false })

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
          Fotos e vídeos
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          {etapa.nome ?? 'Etapa'}
        </h1>
        <p className="mt-1 text-white/40 text-sm">{etapa.pista}</p>
      </header>

      <GestaoMidia
        etapaId={id}
        midia={midia ?? []}
        adicionarVideo={adicionarVideo}
        enviarFotos={enviarFotos}
        excluirMidia={excluirMidia}
      />
    </main>
  )
}

export const dynamic = 'force-dynamic'
