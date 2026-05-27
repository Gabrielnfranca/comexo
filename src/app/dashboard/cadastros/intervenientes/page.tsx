import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Users2 } from 'lucide-react'
import type { Interveniente } from '@/lib/types/interveniente'
import {
  INTERVENIENTE_TIPO_LABELS,
  INTERVENIENTE_TIPO_COLORS,
  INTERVENIENTE_TIPOS_LIST,
} from '@/lib/types/interveniente'

export default async function IntervenientesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; busca?: string }>
}) {
  const { tipo, busca } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('intervenientes')
    .select('*')
    .eq('ativo', true)
    .order('razao_social', { ascending: true })

  if (tipo && INTERVENIENTE_TIPOS_LIST.includes(tipo as Interveniente['tipo'])) {
    query = query.eq('tipo', tipo)
  }
  if (busca) {
    query = query.or(`razao_social.ilike.%${busca}%,nome_fantasia.ilike.%${busca}%,cnpj.ilike.%${busca}%`)
  }

  const { data } = await query
  const intervenientes: Interveniente[] = data ?? []

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Intervenientes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Agentes, terminais, transportadores e demais intervenientes do processo
          </p>
        </div>
        <Link
          href="/dashboard/cadastros/intervenientes/novo"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-xl transition"
        >
          <Plus size={16} />
          Novo Interveniente
        </Link>
      </div>

      {/* Filtro por tipo */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/dashboard/cadastros/intervenientes"
          className={`px-3 py-1.5 rounded-xl text-xs border transition ${
            !tipo
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-white/20'
          }`}
        >
          Todos ({intervenientes.length})
        </Link>
        {INTERVENIENTE_TIPOS_LIST.map(t => {
          const count = intervenientes.filter(i => i.tipo === t).length
          return (
            <Link
              key={t}
              href={`/dashboard/cadastros/intervenientes?tipo=${t}`}
              className={`px-3 py-1.5 rounded-xl text-xs border transition ${
                tipo === t
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-white/20'
              }`}
            >
              {INTERVENIENTE_TIPO_LABELS[t].split(' / ')[0]} ({count})
            </Link>
          )
        })}
      </div>

      {/* Busca */}
      <form>
        {tipo && <input type="hidden" name="tipo" value={tipo} />}
        <input
          name="busca"
          defaultValue={busca ?? ''}
          placeholder="Buscar por razão social, CNPJ..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-4 py-2.5 text-white text-sm placeholder-slate-500
                     focus:outline-none focus:border-amber-500/50 transition"
        />
      </form>

      {/* Lista */}
      {intervenientes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl">
          <Users2 size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Nenhum interveniente cadastrado</p>
          <Link
            href="/dashboard/cadastros/intervenientes/novo"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-xl transition"
          >
            <Plus size={15} />
            Cadastrar interveniente
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {intervenientes.map(i => (
            <Link
              key={i.id}
              href={`/dashboard/cadastros/intervenientes/${i.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 hover:border-slate-200 dark:border-white/10 transition flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs border px-2 py-0.5 rounded-full ${INTERVENIENTE_TIPO_COLORS[i.tipo]}`}>
                    {INTERVENIENTE_TIPO_LABELS[i.tipo]}
                  </span>
                  {i.pais !== 'BR' && (
                    <span className="text-xs text-slate-500">{i.pais}</span>
                  )}
                </div>
                <p className="text-white font-medium text-sm truncate">{i.razao_social}</p>
                {i.nome_fantasia && (
                  <p className="text-slate-500 text-xs">{i.nome_fantasia}</p>
                )}
              </div>
              <div className="text-right shrink-0 ml-4">
                {i.cnpj && <p className="text-slate-500 text-xs font-mono">{i.cnpj}</p>}
                {i.contato_nome && <p className="text-slate-600 text-xs">{i.contato_nome}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
