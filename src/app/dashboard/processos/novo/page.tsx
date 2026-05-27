import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NovoProcessoForm from './NovoProcessoForm'
import type { ProcessoTipo, ProcessoModal } from '@/lib/types/processo'

export default async function NovoProcessoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; modal?: string }>
}) {
  const { tipo, modal } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [clientesRes, fornecedoresRes, armadoresRes, ncmsRes] = await Promise.all([
    supabase.from('clientes').select('id, razao_social').eq('user_id', user.id).eq('ativo', true).order('razao_social'),
    supabase.from('fornecedores').select('id, razao_social, pais').eq('user_id', user.id).eq('ativo', true).order('razao_social'),
    supabase.from('armadores').select('id, nome, modal').eq('user_id', user.id).eq('ativo', true).order('nome'),
    supabase.from('ncm_codigos').select('id, codigo, descricao').eq('user_id', user.id).order('codigo'),
  ])

  const tipoInicial = (tipo === 'importacao' || tipo === 'exportacao') ? tipo as ProcessoTipo : 'importacao'
  const modalInicial = (modal === 'maritimo' || modal === 'aereo' || modal === 'rodoviario') ? modal as ProcessoModal : 'maritimo'

  return (
    <NovoProcessoForm
      clientes={clientesRes.data ?? []}
      fornecedores={fornecedoresRes.data ?? []}
      armadores={armadoresRes.data ?? []}
      ncms={ncmsRes.data ?? []}
      tipoInicial={tipoInicial}
      modalInicial={modalInicial}
    />
  )
}

