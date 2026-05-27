// scripts/processos-modal-v1.mjs
// Adiciona colunas específicas de modal marítimo/aéreo e exportação nos processos

import { readFileSync } from 'fs'
import pg from 'pg'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim()))
)

const client = new pg.Client({ connectionString: env.SUPABASE_DB_URL })
await client.connect()

const sql = `
-- Colunas para exportação
ALTER TABLE processos
  ADD COLUMN IF NOT EXISTS numero_due          varchar(30),
  ADD COLUMN IF NOT EXISTS numero_re           varchar(30);

-- Colunas para transporte marítimo
ALTER TABLE processos
  ADD COLUMN IF NOT EXISTS container_tipo      varchar(10),  -- fcl | lcl
  ADD COLUMN IF NOT EXISTS container_numero    varchar(20),
  ADD COLUMN IF NOT EXISTS companhia_aerea     varchar(100);

-- Colunas de carga
ALTER TABLE processos
  ADD COLUMN IF NOT EXISTS peso_bruto          numeric(12,3);

-- Novos status válidos (não precisam de coluna — são valores do campo status existente)
-- Os status adicionados ao tipo TS:
--   no_aeroporto, registro_due, aguardando_embarque, embarcado, averbado

-- Comentários de documentação
COMMENT ON COLUMN processos.numero_due IS 'Número da DU-E (Declaração Única de Exportação)';
COMMENT ON COLUMN processos.numero_re IS 'Número do RE (Registro de Exportação)';
COMMENT ON COLUMN processos.container_tipo IS 'FCL (Container cheio) ou LCL (Carga fracionada)';
COMMENT ON COLUMN processos.container_numero IS 'Número do container (ex: MSCU1234567)';
COMMENT ON COLUMN processos.companhia_aerea IS 'Companhia aérea / IATA carrier code';
COMMENT ON COLUMN processos.peso_bruto IS 'Peso bruto em kg';
`

console.log('Executando migração processos-modal-v1...')
await client.query(sql)
console.log('✅ Colunas adicionadas com sucesso:')
console.log('   - numero_due, numero_re (exportação)')
console.log('   - container_tipo, container_numero (marítimo)')
console.log('   - companhia_aerea (aéreo)')
console.log('   - peso_bruto (geral)')

await client.end()
