import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NovoFornecedorForm from './NovoFornecedorForm'

export default function NovoFornecedorPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/cadastros/fornecedores"
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-white text-sm mb-4 transition"
        >
          <ArrowLeft size={16} />
          Voltar para Fornecedores
        </Link>
        <h1 className="text-xl font-bold text-white">Novo Fornecedor</h1>
        <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-sm mt-0.5">Cadastre um fornecedor do exterior</p>
      </div>
      <NovoFornecedorForm />
    </div>
  )
}
