import { readFileSync } from 'fs'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const [key, ...rest] = line.trim().split('=')
  if (key && !key.startsWith('#') && rest.length) env[key] = rest.join('=')
}

const { default: pg } = await import('pg')
const { Client } = pg

const client = new Client({ connectionString: env.SUPABASE_DB_URL })

try {
  await client.connect()
  console.log('✅ Conectado ao banco')

  await client.query(`
    CREATE TABLE IF NOT EXISTS processos (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      numero VARCHAR(50) UNIQUE NOT NULL,
      tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('importacao', 'exportacao')),
      status VARCHAR(50) NOT NULL DEFAULT 'aberto',
      cliente VARCHAR(255) NOT NULL,
      mercadoria TEXT,
      pais_origem VARCHAR(100),
      pais_destino VARCHAR(100),
      porto_embarque VARCHAR(100),
      porto_destino VARCHAR(100),
      modal VARCHAR(20) CHECK (modal IN ('maritimo', 'aereo', 'rodoviario', 'ferroviario')),
      valor_fob DECIMAL(15,2),
      moeda VARCHAR(10) DEFAULT 'USD',
      data_abertura DATE DEFAULT CURRENT_DATE,
      previsao_chegada DATE,
      data_desembaraco DATE,
      responsavel_id UUID,
      observacoes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('✅ Tabela processos criada (ou já existia)')

  await client.query(`ALTER TABLE processos ENABLE ROW LEVEL SECURITY`)

  for (const p of ['select_auth', 'insert_auth', 'update_auth']) {
    await client.query(`DROP POLICY IF EXISTS "${p}" ON processos`).catch(() => {})
  }

  await client.query(`
    CREATE POLICY "select_auth" ON processos
      FOR SELECT TO authenticated USING (true)
  `)
  await client.query(`
    CREATE POLICY "insert_auth" ON processos
      FOR INSERT TO authenticated WITH CHECK (true)
  `)
  await client.query(`
    CREATE POLICY "update_auth" ON processos
      FOR UPDATE TO authenticated USING (true)
  `)

  console.log('✅ Políticas RLS configuradas')
  console.log('')
  console.log('🎉 Tabela pronta! Pode criar processos no sistema.')
} catch (err) {
  console.error('❌ Erro:', err.message)
} finally {
  await client.end()
}
