'use client'

import { useActionState } from 'react'
import { criarClienteAction } from '../actions'
import Link from 'next/link'
import { ArrowLeft, Building2, User, MapPin, FileText, ShieldCheck } from 'lucide-react'
import { TIPO_CLIENTE_LIST, TIPO_CLIENTE_LABELS, ESTADOS_BR } from '@/lib/types/cliente'

const ESTADO_INICIAL = {}

export default function NovoClientePage() {
  const [estado, action, pending] = useActionState(criarClienteAction, ESTADO_INICIAL)

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/clientes"
          className="p-2 text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-white hover:bg-white dark:bg-white dark:bg-slate-900/5 dark:bg-white dark:bg-slate-900/5 dark:bg-slate-900/5 dark:bg-white/5 rounded-xl transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Novo Cliente</h1>
          <p className="text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-sm">Cadastrar importador ou exportador</p>
        </div>
      </div>

      {estado.erro && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          {estado.erro}
        </div>
      )}

      <form action={action} className="space-y-5">

        {/* Tipo */}
        <div className="bg-white dark:bg-white dark:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Tipo de Cliente</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {TIPO_CLIENTE_LIST.map((t) => (
              <label key={t} className="cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value={t}
                  defaultChecked={t === 'importador'}
                  className="sr-only peer"
                />
                <div className="peer-checked:bg-amber-500/15 peer-checked:border-amber-500/40 peer-checked:text-amber-400
                               border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400
                               text-center font-medium transition hover:border-white/20">
                  {TIPO_CLIENTE_LABELS[t]}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Dados Fiscais */}
        <div className="bg-white dark:bg-white dark:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Dados da Empresa</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">
                Razão Social <span className="text-red-400">*</span>
              </label>
              <input
                name="razao_social"
                required
                placeholder="Ex: Comércio Internacional Ltda."
                className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600
                           focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">Nome Fantasia</label>
                <input
                  name="nome_fantasia"
                  placeholder="Nome comercial"
                  className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600
                             focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">CNPJ</label>
                <input
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 font-mono
                             focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="bg-white dark:bg-white dark:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Contato</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">Nome do Contato</label>
                <input
                  name="contato_nome"
                  placeholder="Responsável pelo processo"
                  className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600
                             focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">Telefone</label>
                <input
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600
                             focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">E-mail</label>
              <input
                name="email"
                type="email"
                placeholder="contato@empresa.com.br"
                className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600
                           focus:outline-none focus:border-amber-500/50 transition"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white dark:bg-white dark:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Endereço</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">Endereço</label>
              <input
                name="endereco"
                placeholder="Rua, número, bairro"
                className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600
                           focus:outline-none focus:border-amber-500/50 transition"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">Cidade</label>
                <input
                  name="cidade"
                  placeholder="São Paulo"
                  className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600
                             focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">UF</label>
                <select
                  name="estado"
                  className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm
                             focus:outline-none focus:border-amber-500/50 transition"
                >
                  <option value="">—</option>
                  {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">CEP</label>
                <input
                  name="cep"
                  placeholder="00000-000"
                  className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 font-mono
                             focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RADAR */}
        <div className="bg-white dark:bg-white dark:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-400" />
              <h2 className="text-white font-semibold text-sm">Habilitação RADAR</h2>
            </div>
            <span className="text-xs text-slate-500">Receita Federal — Siscomex</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">Número RADAR</label>
                <input
                  name="numero_radar"
                  placeholder="Ex: 10.000.000/0001-00"
                  className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 font-mono
                             focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">Tipo de Habilitação</label>
                <select
                  name="tipo_habilitacao_radar"
                  className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm
                             focus:outline-none focus:border-amber-500/50 transition"
                >
                  <option value="">Não informado</option>
                  <option value="limitada">Limitada</option>
                  <option value="ilimitada">Ilimitada</option>
                  <option value="especial">Especial</option>
                  <option value="nenhuma">Sem habilitação</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">Validade RADAR</label>
                <input
                  name="validade_radar"
                  type="date"
                  className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm
                             focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">Regime Tributário</label>
                <select
                  name="regime_tributario"
                  className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm
                             focus:outline-none focus:border-amber-500/50 transition"
                >
                  <option value="">Não informado</option>
                  <option value="simples_nacional">Simples Nacional</option>
                  <option value="lucro_presumido">Lucro Presumido</option>
                  <option value="lucro_real">Lucro Real</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mb-1.5">Inscrição Estadual</label>
              <input
                name="inscricao_estadual"
                placeholder="000.000.000.000"
                className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 font-mono
                           focus:outline-none focus:border-amber-500/50 transition"
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white dark:bg-white dark:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-amber-400" />
            <h2 className="text-white font-semibold text-sm">Observações</h2>
          </div>
          <textarea
            name="observacoes"
            rows={3}
            placeholder="Informações adicionais sobre o cliente..."
            className="w-full bg-slate-100 dark:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600
                       focus:outline-none focus:border-amber-500/50 transition resize-none"
          />
        </div>

        {/* Ações */}
        <div className="flex gap-3 justify-end">
          <Link
            href="/dashboard/clientes"
            className="px-5 py-2.5 text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-slate-200 dark:border-slate-200 dark:border-white/10 hover:border-white/20 rounded-xl text-sm transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition"
          >
            {pending ? 'Salvando...' : 'Cadastrar Cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}
