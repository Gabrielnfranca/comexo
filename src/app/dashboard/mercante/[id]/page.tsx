import NovoMercanteForm from '../novo/NovoMercanteForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NovoMercantePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/mercante" className="text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Novo Registro AFRMM</h1>
          <p className="text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-sm">Registrar conhecimento marítimo e calcular AFRMM</p>
        </div>
      </div>
      <NovoMercanteForm />
    </div>
  )
}
