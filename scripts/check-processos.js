const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://postgres:mgFWwZcIwcmsmcQq@db.joxwmrzzocmmtlftmodv.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
c.connect()
  .then(() => c.query("SELECT id, numero, cliente, status, responsavel_id, empresa_id FROM processos"))
  .then(r => {
    console.log('=== Processos no DB ===');
    r.rows.forEach(p => console.log(JSON.stringify(p)));
    console.log('Total:', r.rows.length);
    c.end();
  })
  .catch(e => { console.error(e.message); c.end(); process.exit(1); });
