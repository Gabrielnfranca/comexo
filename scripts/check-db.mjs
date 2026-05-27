import pg from 'pg'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
envFile.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...val] = trimmed.split('=')
    if (key) process.env[key.trim()] = val.join('=').trim()
  }
})

const { Client } = pg

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
})

await client.connect()

const { rows: tabelas } = await client.query(`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ORDER BY table_name
`)

const { rows: policies } = await client.query(`
  SELECT COUNT(*) as total FROM pg_policies WHERE schemaname = 'public'
`)

const { rows: indexes } = await client.query(`
  SELECT COUNT(*) as total FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
`)

const { rows: triggers } = await client.query(`
  SELECT COUNT(*) as total FROM information_schema.triggers WHERE trigger_schema = 'public'
`)

console.log('\n📊  RELATÓRIO DO BANCO COMEXO\n')
console.log('Tabelas criadas (' + tabelas.length + '):')
tabelas.forEach(r => console.log('  ✅  ' + r.table_name))
console.log('\n🔒  RLS Policies:  ' + policies[0].total)
console.log('⚡  Indexes:       ' + indexes[0].total)
console.log('🔁  Triggers:      ' + triggers[0].total)
console.log('\n🎉  Banco pronto!\n')

await client.end()
