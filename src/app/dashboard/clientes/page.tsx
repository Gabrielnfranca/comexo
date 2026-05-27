import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Users, Search } from 'lucide-react'
import {
  TIPO_CLIENTE_LABELS,
  TIPO_CLIENTE_COLORS,
} from '@/lib/types/cliente'
import type { Cliente } from '@/lib/types/cliente'

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; busca?: string }>
}) {
  const { tipo, busca } = await searchParams

  const supabase = await createClient()

  let query = supabase
    .from('clientes')
    .select('*')
    .order('razao_social', { ascending: true })

  if (tipo === 'importador' || tipo === 'exportador' || tipo === 'ambos') {
    query = query.eq('tipo', tipo)
  }
  if (busca) {
    query = query.or(`razao_social.ilike.%${busca}%,cnpj.ilike.%${busca}%,contato_nome.ilike.%${busca}%`)
  }

  const { data } = await query
  const clientes: Cliente[] = data ?? []

  const total       = clientes.length
  const importadores = clientes.filter(c => c.tipo === 'importador').length
  const exportadores = clientes.filter(c => c.tipo === 'exportador').length
  const ambos        = clientes.filter(c => c.tipo === 'ambos').length

  const filtros = [
    { label: 'Todos',              href: '/dashboard/clientes',                   active: !tipo },
    { label: 'Importadores',       href: '/dashboard/clientes?tipo=importador',   active: tipo === 'importador' },
    { label: 'Exportadores',       href: '/dashboard/clientes?tipo=exportador',   active: tipo === 'exportador' },
    { label: 'Importador/Export.', href: '/dashboard/clientes?tipo=ambos',        active: tipo === 'ambos' },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Clientes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {total} cliente{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/clientes/novo"
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-amber-500/20"
        >
          <Plus size={16} />
          Novo Cliente
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total',              valor: total,        cor: 'text-white' },
          { label: 'Importadores',       valor: importadores, cor: 'text-blue-400' },
          { label: 'Exportadores',       valor: exportadores, cor: 'text-emerald-400' },
          { label: 'Ambos',              valor: ambos,        cor: 'text-purple-400' },
        ].map(({ label, valor, cor }) => (
          <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4">
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{label}</p>
            <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {filtros.map((f) => (
          <Link
            key={f.label}
            href={f.href}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition border
              ${f.active
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-white border-slate-200 dark:border-white/5 hover:border-slate-200 dark:border-white/10'
              }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Lista ou empty state */}
      {clientes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-16 text-center">
          <Users size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg mb-2">
            {busca || tipo ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {busca || tipo
              ? 'Tente ajustar os filtros da busca.'
              : 'Comece cadastrando seus clientes importadores e exportadores.'}
          </p>
          {!busca && !tipo && (
            <Link
              href="/dashboard/clientes/novo"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-medium text-sm rounded-xl transition"
            >
              <Plus size={16} />
              Cadastrar Primeiro Cliente
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="text-left text-slate-500 font-medium px-5 py-3.5">Razão Social</th>
                <th className="text-left text-slate-500 font-medium px-4 py-3.5">CNPJ</th>
                <th className="text-left text-slate-500 font-medium px-4 py-3.5">Tipo</th>
                <th className="text-left text-slate-500 font-medium px-4 py-3.5">Cidade / UF</th>
                <th className="text-left text-slate-500 font-medium px-4 py-3.5">Contato</th>
                <th className="text-left text-slate-500 font-medium px-4 py-3.5">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-white/2 transition">
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/clientes/${c.id}`} className="block">
                      <p className="text-white font-medium hover:text-amber-400 transition truncate max-w-[220px]">
                        {c.razao_social}
                      </p>
                      {c.nome_fantasia && (
                        <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[220px]">{c.nome_fantasia}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs">
                    {c.cnpj ?? '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TIPO_CLIENTE_COLORS[c.tipo]}`}>
                      {TIPO_CLIENTE_LABELS[c.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                    {c.cidade && c.estado ? `${c.cidade} / ${c.estado}` : c.cidade || c.estado || '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    {c.contato_nome ? (
                      <div>
                        <p className="text-slate-300 text-xs">{c.contato_nome}</p>
                        {c.email && <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[160px]">{c.email}</p>}
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${c.ativo ? 'text-green-400' : 'text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.ativo ? 'bg-green-400' : 'bg-slate-600'}`} />
                      {c.ativo ? 'Ativo' : 'Inativo'}
                    </span>
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
