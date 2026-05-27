import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, ShieldCheck, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import type { LpcoRegistro } from '@/lib/types/lpco'
import {
  LPCO_STATUS_LABELS,
  LPCO_STATUS_COLORS,
  LPCO_TIPO_LABELS,
  ORGAOS_ANUENTES_LPCO,
} from '@/lib/types/lpco'

export default async function LpcoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; orgao?: string }>
}) {
  const { status, orgao } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('lpco_registros')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (orgao) query = query.eq('orgao_anuente', orgao)

  const { data } = await query
  const registros: LpcoRegistro[] = data ?? []

  const total = registros.length
  const emAnalise = registros.filter(r => r.status === 'em_analise' || r.status === 'solicitado').length
  const aprovados = registros.filter(r => r.status === 'aprovado').length
  const expirados = registros.filter(r => r.status === 'expirado').length
  const hoje = new Date()
  const aVencer = registros.filter(r => {
    if (!r.data_validade || r.status !== 'aprovado') return false
    const v = new Date(r.data_validade)
    const diff = (v.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 30
  }).length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">LPCO / Licenciamento</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Licenças, Permissões, Certificados e Anuências por órgão
          </p>
        </div>
        <Link
          href="/dashboard/lpco/novo"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-xl transition"
        >
          <Plus size={16} />
          Nova LPCO
        </Link>
      </div>

      {/* Alerta vencimentos */}
      {aVencer > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-amber-400 shrink-0" />
          <p className="text-amber-300 text-sm">
            <span className="font-semibold">{aVencer} LPCO{aVencer !== 1 ? 's' : ''}</span> vencem nos próximos 30 dias. Verifique e renove.
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, icon: ShieldCheck, color: 'text-blue-400' },
          { label: 'Em Análise', value: emAnalise, icon: Clock, color: 'text-amber-400' },
          { label: 'Aprovadas', value: aprovados, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Expiradas', value: expirados, icon: XCircle, color: 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} className={color} />
              <span className="text-slate-500 dark:text-slate-400 text-xs">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        {(['em_analise', 'aprovado', 'solicitado', 'indeferido', 'expirado'] as const).map(s => (
          <Link
            key={s}
            href={status === s ? '/dashboard/lpco' : `/dashboard/lpco?status=${s}`}
            className={`px-3 py-1.5 rounded-xl text-xs border transition ${
              status === s
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-white/20'
            }`}
          >
            {LPCO_STATUS_LABELS[s]}
          </Link>
        ))}
        <div className="border-l border-slate-200 dark:border-white/10 h-4" />
        {ORGAOS_ANUENTES_LPCO.slice(0, 5).map(o => (
          <Link
            key={o.value}
            href={orgao === o.value ? '/dashboard/lpco' : `/dashboard/lpco?orgao=${o.value}`}
            className={`px-3 py-1.5 rounded-xl text-xs border transition ${
              orgao === o.value
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-white/20'
            }`}
          >
            {o.value}
          </Link>
        ))}
      </div>

      {/* Lista */}
      {registros.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl">
          <ShieldCheck size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Nenhuma LPCO registrada</p>
          <Link
            href="/dashboard/lpco/novo"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-xl transition"
          >
            <Plus size={15} />
            Registrar LPCO
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Número / Tipo</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Órgão</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">NCM / Mercadoria</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Validade</th>
              </tr>
            </thead>
            <tbody>
              {registros.map(r => {
                const vencendo = r.data_validade && r.status === 'aprovado'
                  ? (new Date(r.data_validade).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24) <= 30
                  : false
                return (
                  <tr key={r.id} className="border-b border-slate-200 dark:border-white/5 last:border-0 hover:bg-white/2 transition">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/lpco/${r.id}`} className="group">
                        <p className="text-white font-mono text-xs group-hover:text-amber-400 transition">
                          {r.numero_lpco ?? '(sem número)'}
                        </p>
                        <p className="text-slate-500 text-xs">{LPCO_TIPO_LABELS[r.tipo_licenca]}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-300 text-xs font-semibold">{r.orgao_anuente}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.ncm_codigo && <p className="text-slate-300 text-xs font-mono">{r.ncm_codigo}</p>}
                      {r.descricao_mercadoria && (
                        <p className="text-slate-500 text-xs line-clamp-1">{r.descricao_mercadoria}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs border px-2 py-0.5 rounded-full ${LPCO_STATUS_COLORS[r.status]}`}>
                        {LPCO_STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.data_validade ? (
                        <span className={`text-xs ${vencendo ? 'text-amber-400' : 'text-slate-500 dark:text-slate-500 dark:text-slate-400'}`}>
                          {vencendo && '⚠ '}
                          {new Date(r.data_validade).toLocaleDateString('pt-BR')}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
