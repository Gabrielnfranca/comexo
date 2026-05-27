/**
 * Testa a conexão SMTP do Resend diretamente
 * Uso: node scripts/test-smtp.mjs
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const nodemailer = require('nodemailer')

const envPath = join(__dirname, '..', '.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
)

const apiKey = env.RESEND_API_KEY

console.log('🔑 API Key encontrada:', apiKey ? `${apiKey.slice(0, 8)}...` : '❌ NÃO ENCONTRADA')
console.log('🔌 Testando conexão SMTP com smtp.resend.com:465 ...')
console.log('')

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: apiKey,
  },
})

try {
  await transporter.verify()
  console.log('✅ Conexão SMTP bem-sucedida! As credenciais estão corretas.')
  console.log('')
  console.log('⚠️  O problema está na configuração do Supabase dashboard.')
  console.log('   Verifique se salvou corretamente:')
  console.log('   - Username: resend')
  console.log('   - Password: ' + apiKey.slice(0, 8) + '...')
  console.log('   - Host: smtp.resend.com')
  console.log('   - Port: 465')
} catch (err) {
  console.error('❌ Falha na conexão SMTP:', err.message)
  if (err.message.includes('535') || err.message.includes('auth')) {
    console.error('   → Credenciais inválidas. Verifique a API Key do Resend.')
  } else if (err.message.includes('timeout') || err.message.includes('ECONNREFUSED')) {
    console.error('   → Não conseguiu conectar ao servidor SMTP. Verifique a porta/host.')
  }
}
