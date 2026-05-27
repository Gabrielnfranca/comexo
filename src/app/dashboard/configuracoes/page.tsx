import { createClient } from '@/lib/supabase/server'
import ConfiguracoesForm from './ConfiguracoesForm'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('user_id', user!.id)
    .maybeSingle()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Dados da empresa e informações do perfil.</p>
      </div>

      <ConfiguracoesForm config={config} email={user!.email ?? ''} />
    </div>
  )
}
