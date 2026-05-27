import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Ship, ArrowRight } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS, TIPO_LABELS, TIPO_COLORS } from '@/lib/types/processo'
import type { Processo } from '@/lib/types/processo'

export default async function PortalProcessosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const service = createServiceClient()

  // Busca o acesso do portal pelo e-mail do usuário
  const { data: acesso } = await service
    .from('portal_acessos')
    .select('despachante_id, cliente_id, clientes(razao_social), configuracoes:despachante_id(nome_empresa)')
    .eq('email', user.email!)
    .eq('ativo', true)
    .maybeSingle()

  if (!acesso) {
    return (
      <div className="text-center py-20">
        <Ship className="w-12 h-12 text-slate-700 mx-auto mb-4" />
        <p className="text-white font-semibold mb-2">Acesso não configurado</p>
        <p className="text-slate-500 text-sm">
          Entre em contato com seu despachante para ativar o acesso ao portal.
        </p>
      </div>
    )
  }

  const razaoSocial = (acesso as any).clientes?.razao_social ?? ''
  const nomeEmpresa = (acesso as any).configuracoes?.nome_empresa ?? 'Despachante'

  // Busca processos do cliente via service role
  const { data: processos } = await service
    .from('processos')
    .select('id, numero, tipo, status, mercadoria, modal, data_abertura, previsao_chegada')
    .eq('user_id', acesso.despachante_id)
    .eq('cliente', razaoSocial)
    .order('created_at', { ascending: false })

  const lista = (processos ?? []) as Partial<Processo>[]
  const ativos = lista.filter(p => !['entregue', 'cancelado'].includes(p.status ?? ''))
  const concluidos = lista.filter(p => ['entregue', 'cancelado'].includes(p.status ?? ''))

  function formatDate(d?: string | null) {
    if (!d) return null
    return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-slate-500 text-sm">{nomeEmpresa}</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">{razaoSocial}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {lista.length === 0
            ? 'Nenhum processo registrado ainda.'
            : `${ativos.length} processo${ativos.length !== 1 ? 's' : ''} em andamento · ${concluidos.length} concluído${concluidos.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Estado vazio */}
      {lista.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <Ship className="w-12 h-12 text-slate-700 mb-4" />
          <p className="text-slate-400">Nenhum processo encontrado</p>
        </div>
      )}

      {/* Processos ativos */}
      {ativos.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Em Andamento</p>
          {ativos.map((p) => (
            <Link
              key={p.id}
              href={`/portal/processos/${p.id}`}
              className="block bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${TIPO_COLORS[p.tipo!]}`}>
                      {TIPO_LABELS[p.tipo!]}
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-sm">{p.numero}</span>
                  </div>
                  <p className="text-white text-sm font-medium">{p.mercadoria || '—'}</p>
                  {p.previsao_chegada && (
                    <p className="text-slate-500 text-xs mt-1">
                      Previsão: {formatDate(p.previsao_chegada)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${STATUS_COLORS[p.status!]}`}>
                    {STATUS_LABELS[p.status!]}
                  </span>
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Processos concluídos */}
      {concluidos.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Concluídos</p>
          {concluidos.map((p) => (
            <Link
              key={p.id}
              href={`/portal/processos/${p.id}`}
              className="block bg-slate-900/50 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition group opacity-70 hover:opacity-100"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-sm text-slate-400">{p.numero}</span>
                  <span className="text-slate-500 text-sm ml-2">{p.mercadoria}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_COLORS[p.status!]}`}>
                    {STATUS_LABELS[p.status!]}
                  </span>
                  <ArrowRight size={14} className="text-slate-700 group-hover:text-slate-500 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
