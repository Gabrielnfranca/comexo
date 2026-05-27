import nodemailer from 'nodemailer'
import { createRequire } from 'module'
import { readFileSync } from 'fs'

// Carrega .env.local manualmente
const envContent = readFileSync('.env.local', 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.trim().split('=')
  if (key && rest.length) env[key] = rest.join('=')
}

const RESEND_API_KEY = env.RESEND_API_KEY
const toEmail = process.argv[2] || 'gabrielnfranca@outlook.com'

console.log('🔑 API Key:', RESEND_API_KEY?.slice(0, 10) + '...')
console.log('📧 Enviando para:', toEmail)

const require = createRequire(import.meta.url)
const nodemailerCJS = require('nodemailer')

const transporter = nodemailerCJS.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: RESEND_API_KEY,
  },
})

try {
  const info = await transporter.sendMail({
    from: '"Comexo" <onboarding@resend.dev>',
    to: toEmail,
    subject: 'Teste - Comexo',
    html: '<p>Teste de envio</p>',
  })
  console.log('✅ E-mail enviado! MessageId:', info.messageId)
  console.log('Response:', info.response)
} catch (err) {
  console.error('❌ Erro ao enviar:', err.message)
  if (err.response) console.error('Resposta SMTP:', err.response)
  if (err.responseCode) console.error('Código:', err.responseCode)
}
