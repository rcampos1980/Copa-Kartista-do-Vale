import { createClient } from '@/lib/supabase/server'
import { PontuacaoEditor } from './PontuacaoEditor'
import { MenuAdmin } from '@/components/MenuAdmin'

export default async function PontuacaoPage() {
  const supabase = await createClient()

  const { data: campeonato } = await supabase
    .from('campeonatos')
    .select('id, nome, ano, bonus_melhor_volta')
    .order('ano', { ascending: false })
    .limit(1)
    .maybeSingle()

  let regras: { posicao: number; pontos: number }[] = []
  if (campeonato?.id) {
    const { data } = await supabase
      .from('regras_pontuacao')
      .select('posicao, pontos')
      .eq('campeonato_id', campeonato.id)
      .order('posicao', { ascending: true })
    regras = data ?? []
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-accent font-display">
          Administração
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Tabela de pontuação
        </h1>
        {campeonato && (
          <p className="text-white/50 text-sm mt-1">
            {campeonato.nome} {campeonato.ano}
          </p>
        )}
      </header>

      <MenuAdmin />

      <PontuacaoEditor
        campeonatoId={campeonato?.id ?? ''}
        bonusInicial={campeonato?.bonus_melhor_volta ?? 0}
        regrasIniciais={regras}
      />
    </main>
  )
}
