import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Anchor } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  dpc_gerado: 'DPC Gerado',
  pago: 'Pago',
  dispensado: 'Dispensado',
}

const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-amber-500/20 text-amber-400',
  dpc_gerado: 'bg-blue-500/20 text-blue-400',
  pago: 'bg-emerald-500/20 text-emerald-400',
  dispensado: 'bg-slate-500/20 text-slate-300',
}

const fmt = (v: any) => v ? Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'

export default async function MercantePage() {
  const supabase = await createClient()
  const { data: registros } = await supabase
    .from('afrmm_registros')
    .select('*')
    .order('created_at', { ascending: false })

  const total = registros?.length ?? 0
  const pendente = registros?.filter(r => r.status === 'pendente').length ?? 0
  const totalAffrmPendente = registros?.filter(r => r.status !== 'pago' && r.status !== 'dispensado')
    .reduce((acc, r) => acc + (Number(r.valor_afrmm_brl) || 0), 0) ?? 0
  const totalPago = registros?.filter(r => r.status === 'pago')
    .reduce((acc, r) => acc + (Number(r.valor_afrmm_brl) || 0), 0) ?? 0

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mercante / AFRMM</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Adicional ao Frete para Renovação da Marinha Mercante (25% do frete)</p>
        </div>
        <Link
          href="/dashboard/mercante/novo"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-xl transition"
        >
          <Plus size={16} /> Novo Registro
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, display: String(total), color: 'text-white' },
          { label: 'Pendentes', value: pendente, display: String(pendente), color: 'text-amber-400' },
          { label: 'AFRMM a Pagar', value: totalAffrmPendente, display: fmt(totalAffrmPendente), color: 'text-red-400' },
          { label: 'AFRMM Pago', value: totalPago, display: fmt(totalPago), color: 'text-emerald-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.display}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
        {(!registros || registros.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Anchor size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Nenhum registro de AFRMM</p>
            <p className="text-sm mt-1">Clique em "Novo Registro" para começar</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Nº Conhecimento</th>
                <th className="text-left px-4 py-3">Armador</th>
                <th className="text-left px-4 py-3">Frete USD</th>
                <th className="text-left px-4 py-3">AFRMM (BRL)</th>
                <th className="text-left px-4 py-3">Venc. DPC</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((reg) => {
                const vencido = reg.status === 'pendente' && reg.data_vencimento_dpc && new Date(reg.data_vencimento_dpc) < new Date()
                return (
                  <tr key={reg.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-white/3 transition">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/mercante/${reg.id}`} className="text-amber-400 hover:underline font-medium">
                        {reg.numero_conhecimento}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{reg.armador || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {reg.valor_frete_usd ? `USD ${Number(reg.valor_frete_usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{fmt(reg.valor_afrmm_brl)}</td>
                    <td className={`px-4 py-3 ${vencido ? 'text-red-400 font-medium' : 'text-slate-300'}`}>
                      {reg.data_vencimento_dpc ? new Date(reg.data_vencimento_dpc + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[reg.status] ?? 'bg-slate-600 text-slate-300'}`}>
                        {STATUS_LABELS[reg.status] ?? reg.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
