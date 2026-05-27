import { createServiceClient } from '@/lib/supabase/server'
import ConviteForm from './ConviteForm'
import Link from 'next/link'

export default async function ConvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0A101D] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Link inválido ou expirado.</p>
          <Link href="/portal/login" className="text-amber-400 hover:underline text-sm">
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  const service = createServiceClient()
  const { data: acesso } = await service
    .from('portal_acessos')
    .select('email, aceito, token_expira, ativo, clientes(razao_social), configuracoes:despachante_id(nome_empresa)')
    .eq('token_convite', token)
    .maybeSingle()

  if (!acesso || !acesso.ativo) {
    return (
      <div className="min-h-screen bg-[#0A101D] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Este convite não é válido ou foi revogado.</p>
          <Link href="/portal/login" className="text-amber-400 hover:underline text-sm">
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  const nomeEmpresa = (acesso as any).configuracoes?.nome_empresa ?? 'seu despachante'
  const nomeCliente = (acesso as any).clientes?.razao_social ?? ''

  return (
    <div className="min-h-screen bg-[#0A101D] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-amber-400 text-2xl font-bold">C</span>
          </div>
          <h1 className="text-white text-xl font-bold">Bem-vindo ao Portal!</h1>
          <p className="text-slate-400 text-sm mt-1">
            {nomeCliente && <span className="text-white font-medium">{nomeCliente}</span>}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {acesso.aceito
              ? 'Você já tem acesso. Use sua senha para entrar.'
              : `${nomeEmpresa} convidou você para acompanhar seus processos.`}
          </p>
        </div>

        <ConviteForm
          token={token}
          email={acesso.email}
          jaAceito={acesso.aceito}
        />

        <p className="text-center text-slate-600 text-xs mt-6">
          Problemas? Entre em contato com {nomeEmpresa}.
        </p>
      </div>
    </div>
  )
}
