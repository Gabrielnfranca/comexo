import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Package, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react'
import type { ProdutoCatalogo } from '@/lib/types/produto'
import { formatarNcm } from '@/lib/types/produto'

export default async function ProdutosCatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; lpco?: string }>
}) {
  const { busca, lpco } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('produtos_catalogo')
    .select('*')
    .eq('ativo', true)
    .order('descricao', { ascending: true })

  if (busca) {
    query = query.or(`descricao.ilike.%${busca}%,ncm_codigo.ilike.%${busca}%,fabricante.ilike.%${busca}%,codigo_interno.ilike.%${busca}%`)
  }
  if (lpco === '1') {
    query = query.eq('requer_lpco', true)
  }

  const { data } = await query
  const produtos: ProdutoCatalogo[] = data ?? []

  const total = produtos.length
  const comLpco = produtos.filter(p => p.requer_lpco).length
  const comAntidumping = produtos.filter(p => p.tem_antidumping).length
  const semCClassTrib = produtos.filter(p => !p.c_class_trib).length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Catálogo de Produtos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Produtos cadastrados com NCM, cClassTrib e atributos para DUIMP
          </p>
        </div>
        <Link
          href="/dashboard/cadastros/produtos/novo"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-xl transition"
        >
          <Plus size={16} />
          Novo Produto
        </Link>
      </div>

      {/* Alerta cClassTrib */}
      {semCClassTrib > 0 && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-amber-300 text-sm">
            <span className="font-semibold">{semCClassTrib} produto{semCClassTrib !== 1 ? 's' : ''}</span> sem cClassTrib cadastrado.
            O campo é obrigatório na DUIMP desde janeiro de 2026 (Reforma Tributária).
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total de Produtos', value: total, icon: Package, color: 'text-blue-400' },
          { label: 'Requerem LPCO', value: comLpco, icon: ShieldCheck, color: 'text-amber-400' },
          { label: 'Com Antidumping', value: comAntidumping, icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Sem cClassTrib', value: semCClassTrib, icon: AlertCircle, color: semCClassTrib > 0 ? 'text-orange-400' : 'text-slate-500 dark:text-slate-500 dark:text-slate-400' },
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

      {/* Filtros e busca */}
      <div className="flex items-center gap-3">
        <form className="flex-1 relative">
          <input
            name="busca"
            defaultValue={busca ?? ''}
            placeholder="Buscar por descrição, NCM, fabricante ou código interno..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-4 py-2.5 text-white text-sm placeholder-slate-500
                       focus:outline-none focus:border-amber-500/50 transition"
          />
        </form>
        <Link
          href={lpco === '1' ? '/dashboard/cadastros/produtos' : '/dashboard/cadastros/produtos?lpco=1'}
          className={`px-4 py-2.5 rounded-xl text-sm border transition ${
            lpco === '1'
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-white/20'
          }`}
        >
          Requerem LPCO
        </Link>
      </div>

      {/* Lista */}
      {produtos.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl">
          <Package size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Nenhum produto cadastrado</p>
          <p className="text-slate-600 text-sm mt-1">
            Cadastre produtos reutilizáveis para agilizar a abertura de DUIMP
          </p>
          <Link
            href="/dashboard/cadastros/produtos/novo"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-xl transition"
          >
            <Plus size={15} />
            Cadastrar primeiro produto
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Produto</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">NCM</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">cClassTrib</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Fabricante / Origem</th>
                <th className="text-left px-4 py-3 text-slate-500 text-xs font-medium">Flags</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id} className="border-b border-slate-200 dark:border-white/5 last:border-0 hover:bg-white/2 transition">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/cadastros/produtos/${p.id}`} className="group">
                      <p className="text-white font-medium group-hover:text-amber-400 transition line-clamp-1">
                        {p.descricao}
                      </p>
                      {p.codigo_interno && (
                        <p className="text-slate-600 text-xs font-mono">{p.codigo_interno}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-slate-300 text-xs">{formatarNcm(p.ncm_codigo)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.c_class_trib ? (
                      <span className="font-mono text-emerald-400 text-xs">{p.c_class_trib}</span>
                    ) : (
                      <span className="text-orange-400 text-xs flex items-center gap-1">
                        <AlertCircle size={12} />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-300 text-xs">{p.fabricante ?? '—'}</p>
                    {p.pais_origem && (
                      <p className="text-slate-600 text-xs">{p.pais_origem}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.requer_lpco && (
                        <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                          LPCO
                        </span>
                      )}
                      {p.tem_antidumping && (
                        <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                          Antidumping
                        </span>
                      )}
                      {p.ex_tarifario && (
                        <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                          EX
                        </span>
                      )}
                    </div>
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
