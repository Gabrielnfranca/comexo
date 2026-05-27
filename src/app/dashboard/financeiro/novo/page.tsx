import { createClient } from '@/lib/supabase/server'
import NovoLancamentoForm from './NovoLancamentoForm'

export default async function NovoLancamentoPage() {
  const supabase = await createClient()

  const { data: processos } = await supabase
    .from('processos')
    .select('id, numero, cliente')
    .order('created_at', { ascending: false })
    .limit(100)

  return <NovoLancamentoForm processos={processos ?? []} />
}
