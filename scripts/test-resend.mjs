/**
 * Teste direto de envio via Resend SDK
 * Uso: node scripts/test-resend.mjs seu@email.com
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Resend } from 'resend'

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
  console.error('❌  Informe o e-mail: node scripts/test-resend.mjs seu@email.com')
  process.exit(1)
}

const resend = new Resend(env.RESEND_API_KEY)

console.log('📤 Enviando e-mail de teste para:', email)

const { data, error } = await resend.emails.send({
  from: 'Comexo <onboarding@resend.dev>',
  to: email,
  subject: '✅ Teste de e-mail — Comexo',
  html: `<div style="font-family:sans-serif;padding:32px;background:#0A101D;color:#F1F5F9;border-radius:12px;">
    <h2 style="color:#F59E0B;margin:0 0 8px;">COMEXO</h2>
    <p style="color:#94A3B8;margin:0 0 16px;">Plataforma de Comércio Exterior</p>
    <p>🎉 <strong>E-mail funcionando!</strong> O envio via Resend está configurado corretamente.</p>
  </div>`,
})

if (error) {
  console.error('❌ Erro:', error)
} else {
  console.log('✅ E-mail enviado com sucesso! ID:', data?.id)
  console.log('📬 Verifique a caixa de entrada de:', email)
}
