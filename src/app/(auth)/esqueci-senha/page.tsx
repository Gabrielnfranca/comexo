'use client'

import { useActionState } from 'react'
import { esqueciSenhaAction } from './actions'
import { Loader2, Globe, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

const estadoInicial = {}

export default function EsqueciSenhaPage() {
  const [state, formAction, isPending] = useActionState(esqueciSenhaAction, estadoInicial)

  return (
    <div className="space-y-8">
      {/* Logo e título */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 shadow-lg shadow-amber-500/20 mb-1 border border-amber-300/20">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">COMEXO</h1>
        <p className="text-slate-400 text-sm">Recuperação de acesso</p>
      </div>

      {/* Card */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

        {state.sucesso ? (
          /* Tela de confirmação após envio */
          <div className="text-center space-y-4 py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">E-mail enviado!</h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Se esse endereço estiver cadastrado, você receberá um link para
                redefinir sua senha em breve. Verifique também a caixa de spam.
              </p>
            </div>
            <p className="text-slate-500 text-xs">O link expira em 1 hora.</p>
          </div>
        ) : (
          /* Formulário */
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Esqueceu sua senha?</h2>
              <p className="text-slate-400 text-sm mt-1">
                Informe seu e-mail e enviaremos um link para criar uma nova senha.
              </p>
            </div>

            <form action={formAction} className="space-y-5">
              {state.erro && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="shrink-0">⚠</span>
                  {state.erro}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  E-mail corporativo
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    required
                    disabled={isPending}
                    placeholder="nome@empresa.com.br"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm
                               focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50
                               disabled:opacity-50 disabled:cursor-not-allowed transition"
                  />
                </div>
                {state.campos?.email && (
                  <p className="text-red-400 text-xs">{state.campos.email[0]}</p>
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
                    Enviando...
                  </>
                ) : (
                  'Enviar link de recuperação'
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <div className="text-center">
        <a href="/login" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o login
        </a>
      </div>
    </div>
  )
}
