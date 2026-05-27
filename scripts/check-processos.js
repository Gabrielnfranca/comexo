const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://postgres:mgFWwZcIwcmsmcQq@db.joxwmrzzocmmtlftmodv.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
c.connect()
  .then(() => c.query("SELECT proname, prosrc FROM pg_proc WHERE proname IN ('minha_empresa_id','meu_perfil')"))
  .then(r => {
    console.log('=== Functions ===');
    r.rows.forEach(p => console.log(JSON.stringify(p)));
    // Check columns of processos table
    return c.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name='processos' AND is_nullable='NO'");
  })
  .then(r => {
    console.log('=== NOT NULL columns ===');
    r.rows.forEach(p => console.log(JSON.stringify(p)));
    c.end();
  })
  .catch(e => { console.error(e.message); c.end(); process.exit(1); });
