import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Ping diario para o Supabase nao pausar o projeto.
// O plano gratuito desliga a maquina depois de 7 dias sem nenhuma atividade
// no banco, e o site inteiro fica sem dados ate alguem religar no painel.
// Esta rota so faz uma contagem, nao le nem escreve dado nenhum.
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Quando CRON_SECRET existe na Vercel, ela manda o cabecalho junto.
  // Sem a variavel a rota segue aberta, mas ela so devolve um numero.
  const segredo = process.env.CRON_SECRET
  if (segredo) {
    const cabecalho = request.headers.get('authorization')
    if (cabecalho !== `Bearer ${segredo}`) {
      return NextResponse.json({ ok: false, erro: 'nao autorizado' }, { status: 401 })
    }
  }

  const supabase = await createClient()
  const { count, error } = await supabase
    .from('campeonatos')
    .select('*', { count: 'exact', head: true })

  if (error) {
    return NextResponse.json(
      { ok: false, erro: error.message, em: new Date().toISOString() },
      { status: 503 }
    )
  }

  return NextResponse.json({ ok: true, campeonatos: count ?? 0, em: new Date().toISOString() })
}
