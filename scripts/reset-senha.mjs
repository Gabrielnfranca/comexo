import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const [key, ...rest] = line.trim().split('=')
  if (key && !key.startsWith('#') && rest.length) env[key] = rest.join('=')
}

const email = process.argv[2]
const novaSenha = process.argv[3]

if (!email || !novaSenha) {
  console.error('Uso: node scripts/reset-senha.mjs <email> <nova-senha>')
  process.exit(1)
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
if (listError) { console.error('Erro:', listError.message); process.exit(1) }

const user = users.find(u => u.email === email)
if (!user) { console.error('Usuário não encontrado:', email); process.exit(1) }

const { error } = await supabase.auth.admin.updateUserById(user.id, { password: novaSenha })
if (error) { console.error('Erro ao redefinir:', error.message); process.exit(1) }

console.log('✅ Senha redefinida com sucesso para:', email)
