'use client'

import { useActionState } from 'react'
import { criarFornecedorAction } from '../actions'

const inputClass =
  'w-full px-4 py-2.5 bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'
const labelClass = 'block text-xs text-slate-500 dark:text-slate-400 mb-1.5'

export default function NovoFornecedorForm() {
  const [state, action, pending] = useActionState(criarFornecedorAction, null)

  return (
    <form action={action} className="space-y-5">
      {state?.erro && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          {state.erro}
        </div>
      )}

      {/* Dados da empresa */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Dados da Empresa</p>

        <div>
          <label className={labelClass}>Razão Social *</label>
          <input name="razao_social" required placeholder="Ex: Shanghai Electronics Co., Ltd." className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Nome Fantasia</label>
          <input name="nome_fantasia" placeholder="Nome comercial (opcional)" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>País</label>
            <input name="pais" placeholder="Ex: China, EUA, Alemanha..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cidade</label>
            <input name="cidade" placeholder="Ex: Shanghai, New York..." className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Site</label>
          <input name="site" placeholder="https://www.empresa.com" className={inputClass} />
        </div>
      </div>

      {/* Contato */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Contato</p>

        <div>
          <label className={labelClass}>Nome do Contato</label>
          <input name="contato_nome" placeholder="Ex: John Smith" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>E-mail</label>
            <input name="contato_email" type="email" placeholder="email@empresa.com" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input name="contato_telefone" placeholder="+86 21 9999-9999" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6">
        <label className={labelClass}>Observações</label>
        <textarea
          name="observacoes"
          rows={3}
          placeholder="Informações adicionais sobre o fornecedor..."
          className={inputClass + ' resize-none'}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-xl transition"
        >
          {pending ? 'Salvando...' : 'Salvar Fornecedor'}
        </button>
      </div>
    </form>
  )
}
