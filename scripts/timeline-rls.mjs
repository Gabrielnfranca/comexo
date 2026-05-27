import pg from "pg"
const { Client } = pg
const client = new Client({ connectionString: process.env.SUPABASE_DB_URL })
await client.connect()

await client.query(`
  ALTER TABLE processo_timeline ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "timeline_select" ON processo_timeline;
  DROP POLICY IF EXISTS "timeline_insert" ON processo_timeline;
  CREATE POLICY "timeline_select" ON processo_timeline FOR SELECT USING (auth.uid() IS NOT NULL);
  CREATE POLICY "timeline_insert" ON processo_timeline FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
`)
console.log("RLS aplicado em processo_timeline")
await client.end()
