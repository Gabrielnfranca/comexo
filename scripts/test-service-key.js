const https = require('https');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveHdtcnp6b2NtbXRsZnRtb2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc5MTk0OSwiZXhwIjoyMDk1MzY3OTQ5fQ._AzBHsX7BXMgRMiZZ_3xQcbi8RDlCoWLUmBbjVPrFRg';

const opts = {
  hostname: 'joxwmrzzocmmtlftmodv.supabase.co',
  path: '/rest/v1/processos?select=id,numero,cliente,status',
  headers: {
    apikey: serviceKey,
    Authorization: 'Bearer ' + serviceKey,
    Accept: 'application/json'
  }
};

const req = https.request(opts, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const rows = JSON.parse(d);
    console.log('Processos via REST (service key):', rows.length, 'rows');
    rows.forEach(r => console.log(JSON.stringify(r)));
  });
});
req.on('error', e => console.error('Erro:', e.message));
req.end();
