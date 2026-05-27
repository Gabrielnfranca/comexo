import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RelatorioClient from './RelatorioClient'
import type { Processo } from '@/lib/types/processo'

export type ProcessoRelatorio = Processo & {
  total_receitas: number
  total_despesas: number
  total_tributos: number
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{
    data_ini?: string
    data_fim?: string
    tipo?: string
    status?: string
    modal?: string
    cliente?: string
  }>
}) {
  const filtros = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca processos com filtros
  let query = supabase
    .from('processos')
    .select('*')
    .eq('responsavel_id', user.id)
    .order('data_abertura', { ascending: false })

  if (filtros.data_ini) query = query.gte('data_abertura', filtros.data_ini)
  if (filtros.data_fim) query = query.lte('data_abertura', filtros.data_fim)
  if (filtros.tipo) query = query.eq('tipo', filtros.tipo)
  if (filtros.status) query = query.eq('status', filtros.status)
  if (filtros.modal) query = query.eq('modal', filtros.modal)
  if (filtros.cliente) query = query.ilike('cliente', `%${filtros.cliente}%`)

  const { data: processos } = await query
  const lista = (processos ?? []) as Processo[]
  const ids = lista.map((p) => p.id)

  // Financeiros e tributos em paralelo (só se há processos)
  const [lancamentosRes, tributosRes] = ids.length > 0
    ? await Promise.all([
        supabase
          .from('lancamentos_financeiros')
          .select('processo_id, tipo, valor')
          .in('processo_id', ids),
        supabase
          .from('tributos_di')
          .select('processo_id, valor_calculado')
          .in('processo_id', ids),
      ])
    : [{ data: [] }, { data: [] }]

  // Agrupa financeiros por processo
  const financeiroPorProcesso: Record<string, { receitas: number; despesas: number }> = {}
  for (const l of lancamentosRes.data ?? []) {
    if (!financeiroPorProcesso[l.processo_id]) {
      financeiroPorProcesso[l.processo_id] = { receitas: 0, despesas: 0 }
    }
    if (l.tipo === 'receita') financeiroPorProcesso[l.processo_id].receitas += Number(l.valor)
    else financeiroPorProcesso[l.processo_id].despesas += Number(l.valor)
  }

  // Agrupa tributos por processo
  const tributosPorProcesso: Record<string, number> = {}
  for (const t of tributosRes.data ?? []) {
    tributosPorProcesso[t.processo_id] = (tributosPorProcesso[t.processo_id] ?? 0) + Number(t.valor_calculado ?? 0)
  }

  // Enriquece lista
  const processosRelatorio: ProcessoRelatorio[] = lista.map((p) => ({
    ...p,
    total_receitas: financeiroPorProcesso[p.id]?.receitas ?? 0,
    total_despesas: financeiroPorProcesso[p.id]?.despesas ?? 0,
    total_tributos: tributosPorProcesso[p.id] ?? 0,
  }))

  return (
    <RelatorioClient
      processos={processosRelatorio}
      filtrosIniciais={filtros}
    />
  )
}
