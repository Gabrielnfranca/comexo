import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
  .split('\n').filter(l => l && !l.startsWith('#'))
  .reduce((acc, l) => { const [k, ...v] = l.split('='); if (k) acc[k.trim()] = v.join('=').trim(); return acc }, {})

// ─── Bucket de Storage ────────────────────────────────────────────────────────
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const { error: bucketError } = await supabase.storage.createBucket('documentos', {
  public: false,
  fileSizeLimit: 10 * 1024 * 1024, // 10 MB
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
})

if (bucketError && !bucketError.message.includes('already exists')) {
  console.error('Erro ao criar bucket:', bucketError.message)
  process.exit(1)
} else {
  console.log('✓ Bucket "documentos" pronto.')
}

// ─── Tabela documentos ────────────────────────────────────────────────────────
const client = new pg.Client({ connectionString: env.SUPABASE_DB_URL })
await client.connect()

await client.query(`
  CREATE TABLE IF NOT EXISTS documentos (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    processo_id    UUID REFERENCES processos(id) ON DELETE CASCADE NOT NULL,
    tipo_documento TEXT NOT NULL DEFAULT 'outros',
    nome_original  TEXT NOT NULL,
    storage_path   TEXT NOT NULL,
    tamanho        INTEGER,
    mimetype       TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW()
  )
`)
console.log('✓ Tabela "documentos" criada.')

await client.query(`ALTER TABLE documentos ENABLE ROW LEVEL SECURITY`)
await client.query(`DROP POLICY IF EXISTS "documentos_own" ON documentos`)
await client.query(`
  CREATE POLICY "documentos_own"
    ON documentos FOR ALL
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)
`)
console.log('✓ RLS configurado.')

await client.end()
console.log('\n✅ Módulo de Documentos configurado com sucesso!')
