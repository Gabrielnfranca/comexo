import { createClient } from '@/lib/supabase/server'
import { Globe } from 'lucide-react'
import SiscomexClient from './SiscomexClient'

export default async function SiscomexPage() {
  const supabase = await createClient()
  const [{ count: totalProcessos }, { count: totalDIs }] = await Promise.all([
    supabase.from('processos').select('*', { count: 'exact', head: true }),
    supabase.from('processos').select('*', { count: 'exact', head: true }).eq('tipo', 'importacao'),
  ])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center">
          <Globe size={24} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Siscomex / PUComex</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Integração com o Portal Único do Comércio Exterior</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
          <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Processos no Sistema</p>
          <p className="text-3xl font-bold text-white mt-1">{totalProcessos ?? 0}</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
          <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">DIs (Importações)</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{totalDIs ?? 0}</p>
        </div>
      </div>

      <SiscomexClient />
    </div>
  )
}
