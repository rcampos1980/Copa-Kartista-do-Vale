import { hojeEmSaoPaulo } from '@/lib/format'
import { getDadosLancamento } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { salvarResultados } from './actions'
import { FormResultado } from './FormResultado'
import { GestaoMidia } from './GestaoMidia'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function formatarData(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('T')[0].split('-').map(Number)
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR')
}

export default async function LancarResultadoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dados = await getDadosLancamento(id)

  if (!dados) notFound()

  const { etapa, listaPilotos, idsAssociados, resultados } = dados

  const temAssociados = idsAssociados.length > 0

  const hojeStr = hojeEmSaoPaulo()
  const etapaStr = String(etapa.data).split('T')[0]
  const dataLiberada = etapaStr <= hojeStr
  const podeLancar = temAssociados && dataLiberada

  const supabase = await createClient()
  const { data: midias } = await supabase
    .from('midia_etapa')
    .select('*')
    .eq('etapa_id', etapa.id)
    .order('created_at', { ascending: true })

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
          Lançar resultado
        </p>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          {etapa.nome ?? 'Etapa'} · {etapa.pista}
        </h1>
        <p className="text-white/50 text-sm mt-1">{formatarData(etapa.data)}</p>
      </header>

      {!temAssociados && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <p className="text-amber-300 text-sm">
            Nenhum piloto associado a esta etapa. Associe os pilotos antes de lançar o resultado.
          </p>
          <Link
            href={`/admin/etapas/${etapa.id}/pilotos`}
            className="flex items-center gap-1.5 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 text-xs rounded-lg px-3 py-2 transition-colors shrink-0"
          >
            <Users size={14} /> Associar pilotos
          </Link>
        </div>
      )}

      {temAssociados && !dataLiberada && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
          <p className="text-amber-300 text-sm">
            Esta etapa ainda não aconteceu ({formatarData(etapa.data)}). O resultado só pode ser
            lançado a partir da data da corrida.
          </p>
        </div>
      )}

      <FormResultado
        etapaId={etapa.id}
        campeonatoId={etapa.campeonato_id}
        pilotos={listaPilotos}
        resultadosSalvos={resultados}
        salvarResultados={salvarResultados}
        dataLiberada={podeLancar}
      />

      <GestaoMidia etapaId={etapa.id} midias={midias ?? []} />
    </main>
  )
}
