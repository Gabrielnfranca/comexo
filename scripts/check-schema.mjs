import pg from "pg"
const { Client } = pg
const client = new Client({ connectionString: process.env.SUPABASE_DB_URL })
await client.connect()
const { rows: cols } = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'processos' ORDER BY ordinal_position")
console.log("=== processos ===")
cols.forEach(r => console.log(" " + r.column_name + " (" + r.data_type + ")"))
const { rows: tables } = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE '%historico%' OR table_name LIKE '%timeline%' OR table_name LIKE '%log%') ORDER BY table_name")
console.log("\n=== tabelas historico/log ===")
tables.forEach(r => console.log(" " + r.table_name))
await client.end()
