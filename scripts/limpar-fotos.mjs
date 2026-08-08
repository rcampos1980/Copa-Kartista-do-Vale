import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const BUCKET = 'fotos-etapas'
const APAGAR = process.argv.includes('--apagar')

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
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: registros, error: erroBanco } = await supabase
  .from('midia_etapa')
  .select('url')
  .eq('tipo', 'foto')

if (erroBanco) {
  console.error('Erro ao ler o banco:', erroBanco.message)
  process.exit(1)
}

const emUso = new Set(
  (registros ?? [])
    .map((r) => {
      const marca = `/${BUCKET}/`
      const pos = r.url.indexOf(marca)
      return pos === -1 ? null : decodeURIComponent(r.url.slice(pos + marca.length).split('?')[0])
    })
    .filter(Boolean)
)

const { data: pastas, error: erroLista } = await supabase.storage.from(BUCKET).list('', { limit: 1000 })
if (erroLista) {
  console.error('Erro ao listar o armazenamento:', erroLista.message)
  process.exit(1)
}

const todos = []
for (const pasta of pastas ?? []) {
  if (pasta.id) {
    todos.push(pasta.name)
    continue
  }
  const { data: dentro } = await supabase.storage.from(BUCKET).list(pasta.name, { limit: 1000 })
  for (const arquivo of dentro ?? []) {
    todos.push(`${pasta.name}/${arquivo.name}`)
  }
}

const orfaos = todos.filter((caminho) => !emUso.has(caminho))

console.log(`No armazenamento: ${todos.length}`)
console.log(`Em uso no banco:  ${emUso.size}`)
console.log(`Orfaos:           ${orfaos.length}`)

if (orfaos.length === 0) {
  console.log('\nNada a limpar.')
  process.exit(0)
}

orfaos.slice(0, 20).forEach((o) => console.log('  -', o))
if (orfaos.length > 20) console.log(`  ... e mais ${orfaos.length - 20}`)

if (!APAGAR) {
  console.log('\nNada foi apagado. Para remover de verdade, rode:')
  console.log('  node scripts/limpar-fotos.mjs --apagar')
  process.exit(0)
}

const { error: erroRemover } = await supabase.storage.from(BUCKET).remove(orfaos)
if (erroRemover) {
  console.error('Erro ao remover:', erroRemover.message)
  process.exit(1)
}
console.log(`\n${orfaos.length} arquivo(s) removido(s).`)
