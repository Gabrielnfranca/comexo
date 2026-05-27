import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Building2, Globe } from 'lucide-react'
import type { Fornecedor } from '@/lib/types/fornecedor'

export default async function FornecedoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: fornecedores } = await supabase
    .from('fornecedores')
    .select('*')
    .eq('user_id', user.id)
    .order('razao_social')

  const lista = (fornecedores ?? []) as Fornecedor[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Fornecedores</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Empresas fornecedoras no exterior
          </p>
        </div>
        <Link
          href="/dashboard/cadastros/fornecedores/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition"
        >
          <Plus size={16} />
          Novo Fornecedor
        </Link>
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 size={40} className="text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum fornecedor cadastrado</p>
          <p className="text-slate-600 text-sm mt-1 mb-6">
            Cadastre fornecedores para vincular aos seus processos de importação
          </p>
          <Link
            href="/dashboard/cadastros/fornecedores/novo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition"
          >
            <Plus size={16} />
            Cadastrar Fornecedor
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Razão Social</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">País</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Contato</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((f) => (
                <tr key={f.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-5 py-4">
                    <p className="text-white font-medium text-sm">{f.razao_social}</p>
                    {f.nome_fantasia && (
                      <p className="text-slate-500 text-xs mt-0.5">{f.nome_fantasia}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {f.pais ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-300 text-sm">
                        <Globe size={13} className="text-slate-500" />
                        {f.pais}{f.cidade ? `, ${f.cidade}` : ''}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <p className="text-slate-300 text-sm">{f.contato_nome ?? '—'}</p>
                    {f.contato_email && (
                      <p className="text-slate-500 text-xs mt-0.5">{f.contato_email}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/cadastros/fornecedores/${f.id}`}
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
