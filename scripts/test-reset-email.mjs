/**
 * Diagnóstico: testa o envio de e-mail de reset pelo Supabase
 * Uso: node scripts/test-reset-email.mjs seu@email.com
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Lê .env.local
const envPath = join(__dirname, '..', '.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(p => p.trim()))
    .map(([k, ...v]) => [k, v.join('=')])
)

const email = process.argv[2]
if (!email) {
  console.error('❌ Informe o e-mail: node scripts/test-reset-email.mjs seu@email.com')
  process.exit(1)
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

console.log('🔍 Supabase URL:', env.NEXT_PUBLIC_SUPABASE_URL)
console.log('📧 Enviando reset para:', email)
console.log('🔗 redirectTo:', `${env.NEXT_PUBLIC_APP_URL}/redefinir-senha`)
console.log('')

const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${env.NEXT_PUBLIC_APP_URL}/redefinir-senha`,
})

if (error) {
  console.error('❌ ERRO retornado pelo Supabase:')
  console.error('   Código:', error.status)
  console.error('   Mensagem:', error.message)
  console.error('')
  console.error('📋 Causas comuns:')
  console.error('   1. Rate limit: Supabase free permite apenas 3 e-mails/hora.')
  console.error('   2. URL não está na whitelist: vá em Authentication > URL Configuration no dashboard.')
  console.error('   3. E-mail não cadastrado (mas Supabase pode não mostrar esse erro por segurança).')
} else {
  console.log('✅ Supabase aceitou o pedido (sem erros de API).')
  console.log('')
  console.log('Se o e-mail não chegou, verifique:')
  console.log('   1. Pasta SPAM / lixo eletrônico')
  console.log('   2. Rate limit: max 3 e-mails/hora no plano gratuito')
  console.log('   3. No Supabase dashboard: Authentication > Logs  (veja se o envio aparece)')
  console.log('   4. URL http://localhost:3000 precisa estar em: Authentication > URL Configuration > Redirect URLs')
}
