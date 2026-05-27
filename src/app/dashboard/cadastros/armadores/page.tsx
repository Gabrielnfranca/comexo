import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Ship } from 'lucide-react'
import type { Armador } from '@/lib/types/armador'
import { MODAL_LABELS } from '@/lib/types/armador'

const MODAL_ICONS: Record<string, string> = {
  maritimo: '⚓',
  aereo: '✈️',
  rodoviario: '🚛',
  ferroviario: '🚂',
}

export default async function ArmadoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: armadores } = await supabase
    .from('armadores')
    .select('*')
    .eq('user_id', user.id)
    .order('nome')

  const lista = (armadores ?? []) as Armador[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Armadores / Transportadoras</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Companhias de transporte internacionais</p>
        </div>
        <Link
          href="/dashboard/cadastros/armadores/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition"
        >
          <Plus size={16} />
          Novo Armador
        </Link>
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Ship size={40} className="text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum armador cadastrado</p>
          <p className="text-slate-600 text-sm mt-1 mb-6">
            Cadastre armadores e transportadoras usadas nos seus processos
          </p>
          <Link
            href="/dashboard/cadastros/armadores/novo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition"
          >
            <Plus size={16} />
            Cadastrar Armador
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Modal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Código / País</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-5 py-4">
                    <p className="text-white font-medium text-sm">{a.nome}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-slate-300 text-sm">
                      {MODAL_ICONS[a.modal] ?? ''} {MODAL_LABELS[a.modal] ?? a.modal}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <p className="text-slate-300 text-sm">
                      {a.codigo ? <span className="font-mono text-amber-400/80 mr-2">{a.codigo}</span> : ''}
                      {a.pais_sede ?? '—'}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/cadastros/armadores/${a.id}`}
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
