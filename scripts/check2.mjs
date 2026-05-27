import pg from "pg"
const { Client } = pg
const c = new Client({ connectionString: process.env.SUPABASE_DB_URL })
await c.connect()
// Check if taxa_cambio exists
const { rows } = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='processos' AND column_name IN ('taxa_cambio','valor_fob','moeda')")
console.log("cols:", rows.map(r=>r.column_name))
// Check tributos_di schema
const { rows: t } = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='tributos_di' ORDER BY ordinal_position")
console.log("tributos_di:", t.map(r=>r.column_name+"("+r.data_type+")"))
await c.end()
