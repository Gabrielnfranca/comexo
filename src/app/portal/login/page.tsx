'use client'

import { useActionState } from 'react'
import { Loader2, LogIn } from 'lucide-react'
import { loginPortalAction } from './actions'

export default function PortalLoginPage() {
  const [estado, action, isPending] = useActionState(loginPortalAction, {})

  return (
    <div className="min-h-screen bg-[#0A101D] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-amber-400 text-2xl font-bold">C</span>
          </div>
          <h1 className="text-white text-xl font-bold">Portal do Cliente</h1>
          <p className="text-slate-500 text-sm mt-1">Acompanhe seus processos de importação e exportação</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <form action={action} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">E-mail</label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                           placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Senha</label>
              <input
                type="password"
                name="senha"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                           placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition"
              />
            </div>

            {estado.erro && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {estado.erro}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                         bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed
                         text-slate-900 font-semibold text-sm transition mt-2"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {isPending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Não tem acesso? Solicite ao seu despachante.
        </p>
      </div>
    </div>
  )
}
