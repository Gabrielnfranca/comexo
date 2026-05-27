import pg from "pg"
const { Client } = pg
const client = new Client({ connectionString: process.env.SUPABASE_DB_URL })
await client.connect()
const { rows } = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'processo_timeline' ORDER BY ordinal_position")
console.log("=== processo_timeline ===")
rows.forEach(r => console.log(" " + r.column_name + " (" + r.data_type + ")"))
const { rows: sample } = await client.query("SELECT * FROM processo_timeline LIMIT 3")
console.log("Sample:", JSON.stringify(sample))
await client.end()
