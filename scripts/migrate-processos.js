const { Client } = require('pg')

const client = new Client({
  connectionString: 'postgresql://postgres:mgFWwZcIwcmsmcQq@db.joxwmrzzocmmtlftmodv.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

const sql = `
  ALTER TABLE processos
    ADD COLUMN IF NOT EXISTS numero TEXT,
    ADD COLUMN IF NOT EXISTS cliente TEXT,
    ADD COLUMN IF NOT EXISTS mercadoria TEXT,
    ADD COLUMN IF NOT EXISTS pais_origem TEXT,
    ADD COLUMN IF NOT EXISTS pais_destino TEXT,
    ADD COLUMN IF NOT EXISTS porto_embarque TEXT,
    ADD COLUMN IF NOT EXISTS porto_destino TEXT,
    ADD COLUMN IF NOT EXISTS previsao_chegada DATE,
    ADD COLUMN IF NOT EXISTS valor_fob NUMERIC(15,2)
`

client.connect()
  .then(() => client.query(sql))
  .then(r => { console.log('Migração OK - colunas adicionadas com sucesso'); client.end() })
  .catch(e => { console.error('Erro na migração:', e.message); client.end(); process.exit(1) })
