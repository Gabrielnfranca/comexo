/**
 * Testa a rota API de reset de senha
 * Uso: node scripts/test-route-reset.mjs email@exemplo.com
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
)

const email = process.argv[2]
if (!email) {
  console.error('❌  Uso: node scripts/test-route-reset.mjs email@exemplo.com')
  process.exit(1)
}

console.log('📤 Chamando rota /api/auth/reset-password para:', email)

const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/auth/reset-password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
})

const body = await res.json()
console.log('Status HTTP:', res.status)
console.log('Resposta:', body)

if (res.ok) {
  console.log('✅ Rota respondeu com sucesso. Verifique a caixa de entrada.')
} else {
  console.error('❌ Erro na rota.')
}
