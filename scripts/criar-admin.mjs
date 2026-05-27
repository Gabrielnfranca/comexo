/**
 * Cria o usuário administrador inicial no Supabase Auth
 * Uso: node scripts/criar-admin.mjs email@exemplo.com SenhaForte123
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

const [email, senha] = process.argv.slice(2)
if (!email || !senha) {
  console.error('❌  Uso: node scripts/criar-admin.mjs email@exemplo.com SenhaForte123')
  process.exit(1)
}

if (senha.length < 8) {
  console.error('❌  A senha deve ter no mínimo 8 caracteres.')
  process.exit(1)
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

console.log('👤 Criando usuário admin:', email)

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password: senha,
  email_confirm: true, // já confirma o e-mail automaticamente
  user_metadata: { perfil: 'admin' },
})

if (error) {
  console.error('❌ Erro:', error.message)
  process.exit(1)
}

console.log('✅ Usuário criado com sucesso!')
console.log('   ID:', data.user.id)
console.log('   E-mail:', data.user.email)
console.log('   Confirmado:', data.user.email_confirmed_at ? '✅ Sim' : '❌ Não')
console.log('')
console.log('🚀 Agora acesse http://localhost:3000/login e entre com essas credenciais.')
