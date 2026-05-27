import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import { Plus, Package, Ship, Plane } from 'lucide-react'
import {
  STATUS_COLORS, STATUS_LABELS,
  TIPO_COLORS,
  getTipoModalLabel,
} from '@/lib/types/processo'
import type { Processo, ProcessoTipo, ProcessoModal } from '@/lib/types/processo'

export default async function ProcessosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; status?: string; modal?: string }>
}) {
  const { tipo, status, modal } = await searchParams

  const tipoValido = (tipo === 'importacao' || tipo === 'exportacao') ? tipo as ProcessoTipo : undefined
  const modalValido = (modal === 'maritimo' || modal === 'aereo' || modal === 'rodoviario' || modal === 'ferroviario') ? modal as ProcessoModal : undefined

  const supabase = await createClient()

  let query = supabase
    .from('processos')
    .select('*')
    .order('created_at', { ascending: false })

  if (tipoValido) query = query.eq('tipo', tipoValido)
  if (modalValido) query = query.eq('modal', modalValido)
  if (status) query = query.eq('status', status)

  const { data } = await query
  const processos: Processo[] = data ?? []

  const ativos = processos.filter(p => !['liberado', 'entregue', 'averbado', 'cancelado'].includes(p.status)).length
  const finalizados = processos.filter(p => ['liberado', 'entregue', 'averbado'].includes(p.status)).length

  const titulo = tipoValido && modalValido
    ? getTipoModalLabel(tipoValido, modalValido)
    : tipoValido
      ? getTipoModalLabel(tipoValido, undefined)
      : 'Todos os Processos'

  const isImportacao = tipoValido === 'importacao'
  const isExportacao = tipoValido === 'exportacao'
  const isMaritimo = modalValido === 'maritimo'
  const isAereo = modalValido === 'aereo'

  const novoHref = tipoValido && modalValido
    ? `/dashboard/processos/novo?tipo=${tipoValido}&modal=${modalValido}`
    : tipoValido
      ? `/dashboard/processos/novo?tipo=${tipoValido}`
      : '/dashboard/processos/novo'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMaritimo && <Ship size={22} className={isImportacao ? 'text-cyan-400' : 'text-indigo-400'} />}
          {isAereo && <Plane size={22} className={isImportacao ? 'text-cyan-400' : 'text-indigo-400'} />}
          {!isMaritimo && !isAereo && <Package size={22} className="text-slate-500 dark:text-slate-400" />}
          <div>
            <h1 className="text-xl font-bold text-white">{titulo}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {processos.length} processo{processos.length !== 1 ? 's' : ''} encontrado{processos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link
          href={novoHref}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition"
        >
          <Plus size={16} />
          Novo Processo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4">
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{processos.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4">
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Em andamento</p>
          <p className="text-2xl font-bold text-amber-400">{ativos}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4">
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Finalizados</p>
          <p className="text-2xl font-bold text-green-400">{finalizados}</p>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Todos', href: '/dashboard/processos', active: !tipoValido },
          { label: 'Imp. Marítima', href: '/dashboard/processos?tipo=importacao&modal=maritimo', active: tipoValido === 'importacao' && modalValido === 'maritimo' },
          { label: 'Imp. Aérea', href: '/dashboard/processos?tipo=importacao&modal=aereo', active: tipoValido === 'importacao' && modalValido === 'aereo' },
          { label: 'Exp. Marítima', href: '/dashboard/processos?tipo=exportacao&modal=maritimo', active: tipoValido === 'exportacao' && modalValido === 'maritimo' },
          { label: 'Exp. Aérea', href: '/dashboard/processos?tipo=exportacao&modal=aereo', active: tipoValido === 'exportacao' && modalValido === 'aereo' },
        ].map(f => (
          <Link
            key={f.label}
            href={f.href}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
              f.active
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-white border-slate-200 dark:border-white/5 hover:border-slate-200 dark:border-white/10'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Tabela */}
      {processos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-16 text-center">
          <Package size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg mb-2">Nenhum processo encontrado</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {tipoValido && modalValido
              ? `Nenhum processo de ${titulo} cadastrado ainda.`
              : 'Crie o primeiro processo de importação ou exportação.'}
          </p>
          <Link href={novoHref} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition">
            <Plus size={16} />
            Criar Processo
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Número</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Cliente</th>
                {!tipoValido && <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Tipo/Modal</th>}
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Mercadoria</th>
                {isMaritimo && <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">BL / Container</th>}
                {isAereo && <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">AWB / CIA Aérea</th>}
                {isImportacao && <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">DI / Canal</th>}
                {isExportacao && <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">DU-E / RE</th>}
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Previsão</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processos.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition group">
                  <td className="px-4 py-3">
                    <span className="text-white font-mono text-xs font-semibold">{p.numero}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-200 text-sm">{p.cliente}</span>
                  </td>
                  {!tipoValido && (
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${TIPO_COLORS[p.tipo]}`}>
                        {getTipoModalLabel(p.tipo, p.modal)}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{p.mercadoria || '—'}</span>
                  </td>
                  {isMaritimo && (
                    <td className="px-4 py-3">
                      <p className="text-slate-300 text-xs font-mono">{p.numero_bl_awb || '—'}</p>
                      {p.container_tipo && (
                        <p className="text-slate-500 text-xs">
                          {p.container_tipo.toUpperCase()}{p.container_numero ? ` Â· ${p.container_numero}` : ''}
                        </p>
                      )}
                    </td>
                  )}
                  {isAereo && (
                    <td className="px-4 py-3">
                      <p className="text-slate-300 text-xs font-mono">{p.numero_bl_awb || '—'}</p>
                      {p.companhia_aerea && <p className="text-slate-500 text-xs">{p.companhia_aerea}</p>}
                    </td>
                  )}
                  {isImportacao && (
                    <td className="px-4 py-3">
                      <p className="text-slate-300 text-xs font-mono">{p.numero_di || '—'}</p>
                      {p.canal_parametrizacao && (
                        <p className={`text-xs font-semibold ${
                          p.canal_parametrizacao === 'verde' ? 'text-green-400' :
                          p.canal_parametrizacao === 'amarelo' ? 'text-yellow-400' :
                          p.canal_parametrizacao === 'vermelho' ? 'text-red-400' :
                          'text-slate-500 dark:text-slate-500 dark:text-slate-400'
                        }`}>Canal {p.canal_parametrizacao}</p>
                      )}
                    </td>
                  )}
                  {isExportacao && (
                    <td className="px-4 py-3">
                      <p className="text-slate-300 text-xs font-mono">{p.numero_due || '—'}</p>
                      {p.numero_re && <p className="text-slate-500 text-xs">RE: {p.numero_re}</p>}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                      {p.previsao_chegada
                        ? new Date(p.previsao_chegada + 'T12:00:00').toLocaleDateString('pt-BR')
                        : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/processos/${p.id}`} className="text-amber-400 hover:text-amber-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                      Ver â†’
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
