'use client'

import { useActionState, useState } from 'react'
import { redefinirSenhaAction } from './actions'
import { Loader2, Globe, Eye, EyeOff, ShieldCheck } from 'lucide-react'

const estadoInicial = {}

export default function RedefinirSenhaPage() {
  const [state, formAction, isPending] = useActionState(redefinirSenhaAction, estadoInicial)
  const [verSenha, setVerSenha] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)

  return (
    <div className="space-y-8">
      {/* Logo e título */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 shadow-lg shadow-amber-500/20 mb-1 border border-amber-300/20">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">COMEXO</h1>
        <p className="text-slate-400 text-sm">Criar nova senha</p>
      </div>

      {/* Card */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Redefinir senha</h2>
          </div>
          <p className="text-slate-400 text-sm">Escolha uma senha forte com pelo menos 8 caracteres.</p>
        </div>

        <form action={formAction} className="space-y-5">
          {state.erro && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="shrink-0">⚠</span>
              {state.erro}
            </div>
          )}

          {/* Nova senha */}
          <div className="space-y-1.5">
            <label htmlFor="senha" className="text-sm font-medium text-slate-300">
              Nova senha
            </label>
            <div className="relative">
              <input
                id="senha"
                name="senha"
                type={verSenha ? 'text' : 'password'}
                autoComplete="new-password"
                autoFocus
                required
                disabled={isPending}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm
                           focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50
                           disabled:opacity-50 disabled:cursor-not-allowed transition pr-12"
              />
              <button type="button" onClick={() => setVerSenha(!verSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                tabIndex={-1}>
                {verSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {state.campos?.senha && (
              <p className="text-red-400 text-xs">{state.campos.senha[0]}</p>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="space-y-1.5">
            <label htmlFor="confirmar" className="text-sm font-medium text-slate-300">
              Confirmar senha
            </label>
            <div className="relative">
              <input
                id="confirmar"
                name="confirmar"
                type={verConfirmar ? 'text' : 'password'}
                autoComplete="new-password"
                required
                disabled={isPending}
                placeholder="Repita a senha"
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm
                           focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50
                           disabled:opacity-50 disabled:cursor-not-allowed transition pr-12"
              />
              <button type="button" onClick={() => setVerConfirmar(!verConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                tabIndex={-1}>
                {verConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {state.campos?.confirmar && (
              <p className="text-red-400 text-xs">{state.campos.confirmar[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500
                       disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl
                       transition-all flex items-center justify-center gap-2
                       shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] border border-amber-400/20"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar nova senha'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
