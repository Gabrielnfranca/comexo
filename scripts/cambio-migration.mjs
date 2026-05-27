import pg from "pg"
const { Client } = pg
const c = new Client({ connectionString: process.env.SUPABASE_DB_URL })
await c.connect()
await c.query(`
  ALTER TABLE processos
    ADD COLUMN IF NOT EXISTS taxa_cambio  numeric(12,6),
    ADD COLUMN IF NOT EXISTS valor_frete  numeric(14,2),
    ADD COLUMN IF NOT EXISTS valor_seguro numeric(14,2);
`)
console.log("OK: taxa_cambio, valor_frete, valor_seguro adicionados")
await c.end()
