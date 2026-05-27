import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FileCheck2 } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  aguardando: 'Aguardando',
  recebido: 'Recebido',
  com_divergencia: 'Com Divergência',
  regularizado: 'Regularizado',
}

const STATUS_COLORS: Record<string, string> = {
  aguardando: 'bg-slate-500/20 text-slate-300',
  recebido: 'bg-emerald-500/20 text-emerald-400',
  com_divergencia: 'bg-red-500/20 text-red-400',
  regularizado: 'bg-blue-500/20 text-blue-400',
}

export default async function CCTPage() {
  const supabase = await createClient()
  const { data: ccts } = await supabase
    .from('ccts')
    .select('*')
    .order('created_at', { ascending: false })

  const total = ccts?.length ?? 0
  const aguardando = ccts?.filter(c => c.status === 'aguardando').length ?? 0
  const comDivergencia = ccts?.filter(c => c.status === 'com_divergencia').length ?? 0
  const regularizados = ccts?.filter(c => c.status === 'regularizado').length ?? 0

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Chegada de Transporte (CCT)</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Controle de chegada de cargas e comprovantes de transporte</p>
        </div>
        <Link
          href="/dashboard/cct/novo"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-xl transition"
        >
          <Plus size={16} /> Novo CCT
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, color: 'text-white' },
          { label: 'Aguardando', value: aguardando, color: 'text-amber-400' },
          { label: 'Com Divergência', value: comDivergencia, color: 'text-red-400' },
          { label: 'Regularizados', value: regularizados, color: 'text-emerald-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">{kpi.label}</p>
            <p className={`text-3xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
        {(!ccts || ccts.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FileCheck2 size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Nenhum CCT registrado</p>
            <p className="text-sm mt-1">Clique em "Novo CCT" para começar</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Nº Conhecimento</th>
                <th className="text-left px-4 py-3">Local de Chegada</th>
                <th className="text-left px-4 py-3">Transportadora</th>
                <th className="text-left px-4 py-3">Data Chegada</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {ccts.map((cct) => (
                <tr key={cct.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-white/3 transition">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/cct/${cct.id}`} className="text-amber-400 hover:underline font-medium">
                      {cct.numero_conhecimento}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{cct.local_chegada || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{cct.transportadora || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {cct.data_chegada ? new Date(cct.data_chegada + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[cct.status] ?? 'bg-slate-600 text-slate-300'}`}>
                      {STATUS_LABELS[cct.status] ?? cct.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
