import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Tag } from 'lucide-react'
import type { NcmCodigo } from '@/lib/types/ncm'
import { formatarNcm } from '@/lib/types/ncm'

function formatAliquota(v: number | null) {
  if (v === null) return '—'
  return `${v.toFixed(2)}%`
}

export default async function NcmPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ncms } = await supabase
    .from('ncm_codigos')
    .select('*')
    .eq('user_id', user.id)
    .order('codigo')

  const lista = (ncms ?? []) as NcmCodigo[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Códigos NCM</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Nomenclatura Comum do Mercosul — classificação fiscal das mercadorias
          </p>
        </div>
        <Link
          href="/dashboard/cadastros/ncm/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition"
        >
          <Plus size={16} />
          Novo NCM
        </Link>
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Tag size={40} className="text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum NCM cadastrado</p>
          <p className="text-slate-600 text-sm mt-1 mb-6">
            Cadastre os códigos NCM que utiliza com frequência e suas alíquotas
          </p>
          <Link
            href="/dashboard/cadastros/ncm/novo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition"
          >
            <Plus size={16} />
            Cadastrar NCM
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Código</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Descrição</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">II</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">IPI</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">PIS</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">COFINS</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((n) => (
                <tr key={n.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-5 py-4">
                    <span className="font-mono text-amber-400 font-semibold text-sm">
                      {formatarNcm(n.codigo)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-white text-sm">{n.descricao}</p>
                    {n.unidade_medida && (
                      <p className="text-slate-500 text-xs mt-0.5">Un: {n.unidade_medida}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right hidden lg:table-cell">
                    <span className="text-slate-300 text-sm font-mono">{formatAliquota(n.aliquota_ii)}</span>
                  </td>
                  <td className="px-5 py-4 text-right hidden lg:table-cell">
                    <span className="text-slate-300 text-sm font-mono">{formatAliquota(n.aliquota_ipi)}</span>
                  </td>
                  <td className="px-5 py-4 text-right hidden lg:table-cell">
                    <span className="text-slate-300 text-sm font-mono">{formatAliquota(n.aliquota_pis)}</span>
                  </td>
                  <td className="px-5 py-4 text-right hidden lg:table-cell">
                    <span className="text-slate-300 text-sm font-mono">{formatAliquota(n.aliquota_cofins)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/cadastros/ncm/${n.id}`}
                      className="text-amber-400 hover:text-amber-300 text-sm font-medium transition"
                    >
                      Editar
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
