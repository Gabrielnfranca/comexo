'use client'

import { useActionState, useState } from 'react'
import { loginAction } from './actions'
import type { LoginState } from './actions'
import { Eye, EyeOff, Loader2, Globe, Shield } from 'lucide-react'

const estadoInicial: LoginState = {}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, estadoInicial)
  const [verSenha, setVerSenha] = useState(false)

  return (
    <div className="space-y-8">
      {/* Logo e título */}
      <div className="text-center space-y-3 relative">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 shadow-lg shadow-amber-500/20 mb-1 border border-amber-300/20">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">COMEXO</h1>
        <p className="text-slate-400 text-sm">Simplificando o Comércio Exterior</p>
      </div>

      {/* Card do formulário */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Linha superior de destaque âmbar no card */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Acesse sua conta</h2>
          <p className="text-slate-400 text-sm mt-1">Insira suas credenciais para continuar</p>
        </div>

        <form action={formAction} className="space-y-5">
          {/* Erro geral */}
          {state.erro && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="shrink-0">⚠</span>
              {state.erro}
            </div>
          )}

          {/* E-mail */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              E-mail corporativo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
              placeholder="nome@empresa.com.br"
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm
                         focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50
                         disabled:opacity-50 disabled:cursor-not-allowed transition"
            />
            {state.campos?.email && (
              <p className="text-red-400 text-xs">{state.campos.email[0]}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="senha" className="text-sm font-medium text-slate-300">
                Senha
              </label>
              <a
                href="/esqueci-senha"
                className="text-xs text-amber-400/80 hover:text-amber-400 transition"
              >
                Esqueceu a senha?
              </a>
            </div>
            <div className="relative">
              <input
                id="senha"
                name="senha"
                type={verSenha ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={isPending}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm
                           focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50
                           disabled:opacity-50 disabled:cursor-not-allowed transition pr-12"
              />
              <button
                type="button"
                onClick={() => setVerSenha(!verSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                tabIndex={-1}
              >
                {verSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {state.campos?.senha && (
              <p className="text-red-400 text-xs">{state.campos.senha[0]}</p>
            )}
          </div>

          {/* Botão de entrar */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 disabled:cursor-not-allowed
                       text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 mt-2
                       shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] border border-amber-400/20"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Autenticando...
              </>
            ) : (
              'Entrar na plataforma'
            )}
          </button>
        </form>
      </div>

      {/* Rodapé de segurança */}
      <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
        <Shield className="w-3.5 h-3.5" />
        <span>Acesso restrito e monitorado</span>
      </div>
    </div>
  )
}
