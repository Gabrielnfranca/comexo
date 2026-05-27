'use client'

import { useActionState } from 'react'
import { Save, Loader2, Building2, User, MapPin, Globe } from 'lucide-react'
import { salvarConfiguracoesAction } from './actions'
import { ESTADOS_BR } from '@/lib/types/cliente'

type Config = {
  nome_empresa?: string | null
  cnpj_empresa?: string | null
  telefone?: string | null
  email_empresa?: string | null
  site?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  responsavel?: string | null
} | null

function Campo({
  label, name, defaultValue, placeholder, type = 'text',
}: {
  label: string; name: string; defaultValue?: string | null
  placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white
                   placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition"
      />
    </div>
  )
}

export default function ConfiguracoesForm({
  config,
  email,
}: {
  config: Config
  email: string
}) {
  const [estado, action, isPending] = useActionState(salvarConfiguracoesAction, {})

  return (
    <form action={action} className="space-y-5">

      {/* Dados da empresa */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Building2 size={16} className="text-amber-400" />
          <p className="text-sm font-semibold text-white">Dados da Empresa</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Campo label="Razão Social / Nome da Empresa" name="nome_empresa"
              defaultValue={config?.nome_empresa} placeholder="Ex.: Comexo Assessoria Ltda." />
          </div>
          <Campo label="CNPJ" name="cnpj_empresa"
            defaultValue={config?.cnpj_empresa} placeholder="00.000.000/0001-00" />
          <Campo label="Telefone" name="telefone"
            defaultValue={config?.telefone} placeholder="(11) 99999-9999" />
          <Campo label="E-mail da Empresa" name="email_empresa" type="email"
            defaultValue={config?.email_empresa} placeholder="contato@empresa.com.br" />
          <Campo label="Site" name="site"
            defaultValue={config?.site} placeholder="https://empresa.com.br" />
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={16} className="text-amber-400" />
          <p className="text-sm font-semibold text-white">Endereço</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Campo label="Endereço" name="endereco"
              defaultValue={config?.endereco} placeholder="Rua, número, complemento" />
          </div>
          <Campo label="Cidade" name="cidade" defaultValue={config?.cidade} placeholder="São Paulo" />
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Estado (UF)</label>
            <select
              name="estado"
              defaultValue={config?.estado ?? ''}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white
                         focus:outline-none focus:border-amber-500/60 transition"
            >
              <option value="">Selecione...</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
          <Campo label="CEP" name="cep" defaultValue={config?.cep} placeholder="00000-000" />
        </div>
      </div>

      {/* Responsável */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <User size={16} className="text-amber-400" />
          <p className="text-sm font-semibold text-white">Responsável / Despachante</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Nome do Responsável" name="responsavel"
            defaultValue={config?.responsavel} placeholder="Nome do despachante" />
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">E-mail de acesso</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-slate-100 dark:bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2.5 text-sm
                         text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Feedback */}
      {estado.erro && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {estado.erro}
        </p>
      )}
      {estado.sucesso && (
        <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          {estado.sucesso}
        </p>
      )}

      {/* Salvar */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400
                     disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold text-sm transition"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isPending ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </form>
  )
}
