import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const TABELAS = [
  'campeonatos',
  'pilotos',
  'participacoes',
  'historico_peso',
  'etapas',
  'etapa_pilotos',
  'regras_pontuacao',
  'resultados',
  'midia_etapa',
  'usuarios',
  'visitas',
]

function lerEnv() {
  const bruto = readFileSync('.env.local', 'utf8')
  const env = {}
  for (const linha of bruto.split('\n')) {
    const corte = linha.indexOf('=')
    if (corte === -1 || linha.trim().startsWith('#')) continue
    env[linha.slice(0, corte).trim()] = linha.slice(corte + 1).trim()
  }
  return env
}

const env = lerEnv()
const url = env.NEXT_PUBLIC_SUPABASE_URL
const chave = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !chave) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(url, chave, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const carimbo = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', 'h')
const pasta = join('backups', carimbo)
mkdirSync(pasta, { recursive: true })

let totalGeral = 0
const resumo = []

for (const tabela of TABELAS) {
  const { data, error } = await supabase.from(tabela).select('*')
  if (error) {
    console.log(`  ${tabela.padEnd(20)} ERRO: ${error.message}`)
    resumo.push({ tabela, linhas: null, erro: error.message })
    continue
  }
  writeFileSync(join(pasta, `${tabela}.json`), JSON.stringify(data, null, 2))
  totalGeral += data.length
  resumo.push({ tabela, linhas: data.length })
  console.log(`  ${tabela.padEnd(20)} ${String(data.length).padStart(5)} linhas`)
}

writeFileSync(
  join(pasta, '_resumo.json'),
  JSON.stringify({ gerado_em: new Date().toISOString(), total: totalGeral, tabelas: resumo }, null, 2)
)

console.log(`\nBackup salvo em ${pasta} — ${totalGeral} linhas no total.`)
