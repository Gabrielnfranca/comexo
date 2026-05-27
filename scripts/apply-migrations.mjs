/**
 * COMEXO — Script de aplicação das migrations no Supabase
 * 
 * Como usar:
 *   node scripts/apply-migrations.mjs
 * 
 * Pré-requisito: SUPABASE_DB_URL no .env.local
 * (Supabase → Project Settings → Database → Connection String → URI)
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, '..', 'supabase', 'migrations')

// Carrega as variáveis do .env.local manualmente
function loadEnv() {
  try {
    const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim()
        }
      }
    })
  } catch {
    // .env.local pode não existir em CI
  }
}

async function applyMigrations() {
  loadEnv()

  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) {
    console.error('❌  SUPABASE_DB_URL não configurada no .env.local')
    console.error('   Vá em: Supabase → Project Settings → Database → Connection String → URI')
    process.exit(1)
  }

  // Importa pg dinamicamente
  let pg
  try {
    pg = await import('pg')
  } catch {
    console.error('❌  Pacote "pg" não instalado. Execute: npm install pg')
    process.exit(1)
  }

  const { default: { Client } } = pg
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })

  await client.connect()
  console.log('✅  Conectado ao banco de dados Supabase\n')

  // Cria tabela de controle de migrations (se não existir)
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id        SERIAL PRIMARY KEY,
      arquivo   TEXT UNIQUE NOT NULL,
      aplicado  TIMESTAMPTZ DEFAULT now()
    )
  `)

  // Lê os arquivos de migration em ordem
  const arquivos = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const arquivo of arquivos) {
    // Verifica se já foi aplicada
    const { rows } = await client.query(
      'SELECT 1 FROM _migrations WHERE arquivo = $1',
      [arquivo]
    )

    if (rows.length > 0) {
      console.log(`⏭️   ${arquivo} — já aplicada, pulando`)
      continue
    }

    const sql = readFileSync(join(migrationsDir, arquivo), 'utf-8')

    try {
      console.log(`🔄  Aplicando ${arquivo}...`)
      await client.query(sql)
      await client.query('INSERT INTO _migrations (arquivo) VALUES ($1)', [arquivo])
      console.log(`✅  ${arquivo} aplicada com sucesso`)
    } catch (err) {
      console.error(`❌  Erro ao aplicar ${arquivo}:`, err.message)
      await client.end()
      process.exit(1)
    }
  }

  await client.end()
  console.log('\n🎉  Todas as migrations foram aplicadas!')
}

applyMigrations().catch(err => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
