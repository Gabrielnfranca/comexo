import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Plus, FileOutput, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import {
  OperacaoFicta,
  FICTA_TIPO_LABELS,
  FICTA_TIPO_COLORS,
  FICTA_STATUS_LABELS,
  FICTA_STATUS_COLORS,
} from '@/lib/types/ficta'

export const dynamic = 'force-dynamic'

export default async function FictaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: operacoes } = await supabase
    .from('operacoes_fictas')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const lista: OperacaoFicta[] = operacoes ?? []

  const total       = lista.length
  const abertas     = lista.filter(o => o.status === 'aberta' || o.status === 'em_andamento').length
  const comprovadas = lista.filter(o => o.status === 'comprovada').length
  const totalBenef  = lista.reduce((s, o) => s + (o.valor_beneficio_fiscal ?? 0), 0)

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <FileOutput className="h-7 w-7 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Operação Ficta</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Exportação documental sem saída física — ZFM, ZPE, RECOF e venda a beneficiário de Drawback.
          </p>
        </div>
        <Link
          href="/dashboard/ficta/novo"
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition"
        >
          <Plus className="h-4 w-4" />
          Nova Operação
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total de Operações</p>
          <p className="mt-1 text-3xl font-bold text-white">{total}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <p className="text-sm text-amber-400">Em Aberto</p>
          </div>
          <p className="mt-1 text-3xl font-bold text-amber-300">{abertas}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <p className="text-sm text-emerald-400">Comprovadas</p>
          </div>
          <p className="mt-1 text-3xl font-bold text-emerald-300">{comprovadas}</p>
        </div>
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
          <p className="text-sm text-purple-400">Benefícios Fiscais</p>
          <p className="mt-1 text-2xl font-bold text-purple-300">{fmt(totalBenef)}</p>
        </div>
      </div>

      {/* Tabela */}
      {lista.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-16 text-center">
          <FileOutput className="mx-auto h-12 w-12 text-purple-400/40" />
          <h3 className="mt-4 text-lg font-semibold text-white">Nenhuma operação cadastrada</h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Cadastre operações de exportação ficta — vendas para ZFM, ZPE, RECOF ou beneficiários de Drawback.
          </p>
          <Link
            href="/dashboard/ficta/novo"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 transition"
          >
            <Plus className="h-4 w-4" />
            Cadastrar primeira operação
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3">Nº Operação</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">NF-e</th>
                  <th className="px-4 py-3 text-right">Valor NF</th>
                  <th className="px-4 py-3 text-right">Benefício Fiscal</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lista.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-900/5 dark:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/ficta/${op.id}`}
                        className="font-semibold text-white hover:text-purple-400 transition"
                      >
                        {op.numero_operacao}
                      </Link>
                      {op.referencia_interna && (
                        <p className="text-xs text-slate-500">{op.referencia_interna}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${FICTA_TIPO_COLORS[op.tipo]}`}>
                        {op.tipo === 'zfm' ? 'ZFM' :
                         op.tipo === 'zpe' ? 'ZPE' :
                         op.tipo === 'recof' ? 'RECOF' :
                         op.tipo === 'drawback_fornecedor' ? 'Drawback' : 'Outros'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white">{op.cliente}</p>
                      {op.cnpj_cliente && (
                        <p className="text-xs text-slate-500">{op.cnpj_cliente}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {op.numero_nf ? (
                        <>
                          <p className="text-white">{op.numero_nf}</p>
                          {op.data_nf && (
                            <p className="text-xs text-slate-500">
                              {new Date(op.data_nf).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {op.valor_nf != null
                        ? op.valor_nf.toLocaleString('pt-BR', { style: 'currency', currency: op.moeda === 'BRL' ? 'BRL' : 'USD' })
                        : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {op.valor_beneficio_fiscal != null ? (
                        <span className="font-semibold text-purple-300">
                          {fmt(op.valor_beneficio_fiscal)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${FICTA_STATUS_COLORS[op.status]}`}>
                        {FICTA_STATUS_LABELS[op.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
