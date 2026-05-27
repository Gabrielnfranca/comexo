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

// Adiciona colunas que ainda não existem na tabela processos
const colunas = [
  `ALTER TABLE processos ADD COLUMN IF NOT EXISTS fornecedor TEXT`,
  `ALTER TABLE processos ADD COLUMN IF NOT EXISTS armador TEXT`,
  `ALTER TABLE processos ADD COLUMN IF NOT EXISTS ncm TEXT`,
  `ALTER TABLE processos ADD COLUMN IF NOT EXISTS numero_invoice TEXT`,
  `ALTER TABLE processos ADD COLUMN IF NOT EXISTS numero_bl_awb TEXT`,
]

for (const sql of colunas) {
  await client.query(sql)
  console.log(`✅ ${sql.replace('ALTER TABLE processos ADD COLUMN IF NOT EXISTS ', '').split(' ')[0]}`)
}

console.log('✅ Colunas adicionadas à tabela processos!')
await client.end()
