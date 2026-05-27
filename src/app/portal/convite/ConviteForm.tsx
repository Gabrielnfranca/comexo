'use client'

import { useActionState } from 'react'
import { Loader2, KeyRound } from 'lucide-react'
import { aceitarConviteAction } from './actions'

export default function ConviteForm({
  token,
  email,
  jaAceito,
}: {
  token: string
  email: string
  jaAceito: boolean
}) {
  const [estado, action, isPending] = useActionState(aceitarConviteAction, {})

  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        {/* E-mail (somente leitura) */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">E-mail</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5">
            {jaAceito ? 'Sua Senha' : 'Criar Senha'}
          </label>
          <input
            type="password"
            name="senha"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                       placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition"
          />
        </div>

        {!jaAceito && (
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Confirmar Senha</label>
            <input
              type="password"
              name="senha_conf"
              required
              placeholder="Repita a senha"
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                         placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition"
            />
          </div>
        )}

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
                     text-slate-900 font-semibold text-sm transition"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          {isPending ? 'Aguarde...' : jaAceito ? 'Entrar' : 'Ativar Acesso'}
        </button>
      </form>
    </div>
  )
}
