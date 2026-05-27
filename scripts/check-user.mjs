/**
 * Verifica se um e-mail está cadastrado no Supabase Auth
 * Uso: node scripts/check-user.mjs email@exemplo.com
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

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
  console.error('❌  Informe o e-mail: node scripts/check-user.mjs email@exemplo.com')
  process.exit(1)
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const { data, error } = await supabase.auth.admin.listUsers()

if (error) {
  console.error('❌ Erro ao buscar usuários:', error.message)
  process.exit(1)
}

const usuario = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

if (usuario) {
  console.log('✅ Usuário ENCONTRADO no Supabase Auth:')
  console.log('   ID:', usuario.id)
  console.log('   E-mail:', usuario.email)
  console.log('   Confirmado:', usuario.email_confirmed_at ? '✅ Sim' : '❌ Não confirmado')
  console.log('   Criado em:', new Date(usuario.created_at).toLocaleString('pt-BR'))
} else {
  console.log('❌ E-mail NÃO cadastrado no sistema.')
  console.log('')
  console.log('   O Supabase só envia reset para e-mails já registrados.')
  console.log('   Total de usuários cadastrados:', data.users.length)
  if (data.users.length > 0) {
    console.log('   Usuários existentes:')
    data.users.forEach(u => console.log('   -', u.email))
  }
}
