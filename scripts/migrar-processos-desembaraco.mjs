import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
  .split('\n')
  .filter(l => l && !l.startsWith('#'))
  .reduce((acc, l) => {
    const [k, ...v] = l.split('=')
    if (k) acc[k.trim()] = v.join('=').trim()
    return acc
  }, {})

const client = new pg.Client({ connectionString: env.SUPABASE_DB_URL })
await client.connect()

const colunas = [
  `ALTER TABLE processos ADD COLUMN IF NOT EXISTS numero_di TEXT`,
  `ALTER TABLE processos ADD COLUMN IF NOT EXISTS canal_parametrizacao TEXT`,
  `ALTER TABLE processos ADD COLUMN IF NOT EXISTS data_registro_di DATE`,
]

for (const sql of colunas) {
  await client.query(sql)
  console.log(`✅ ${sql.split('IF NOT EXISTS ')[1].split(' ')[0]}`)
}

console.log('✅ Colunas de desembaraço adicionadas em processos!')
await client.end()
