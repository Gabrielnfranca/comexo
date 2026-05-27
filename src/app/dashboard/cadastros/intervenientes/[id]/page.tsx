import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NovoIntervenienteForm from './NovoIntervenienteForm'

export default function NovoIntervenientePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/cadastros/intervenientes"
          className="p-2 text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-white hover:bg-white dark:bg-white dark:bg-slate-900/5 dark:bg-white dark:bg-slate-900/5 dark:bg-slate-900/5 dark:bg-white/5 rounded-xl transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Novo Interveniente</h1>
          <p className="text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-sm">Agente de carga, terminal, transportador, etc.</p>
        </div>
      </div>
      <NovoIntervenienteForm />
    </div>
  )
}
