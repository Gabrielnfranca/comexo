import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NovoArmadorForm from '../novo/NovoArmadorForm'

export default function NovoArmadorPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/cadastros/armadores"
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-white text-sm mb-4 transition"
        >
          <ArrowLeft size={16} />
          Voltar para Armadores
        </Link>
        <h1 className="text-xl font-bold text-white">Novo Armador</h1>
        <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-sm mt-0.5">Cadastre uma companhia de transporte internacional</p>
      </div>
      <NovoArmadorForm />
    </div>
  )
}
