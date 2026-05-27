import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Ship, DollarSign, FolderOpen, MapPin, FileText, Download } from 'lucide-react'
import {
  STATUS_LABELS, STATUS_COLORS,
  TIPO_LABELS, TIPO_COLORS,
  MODAL_LABELS,
} from '@/lib/types/processo'
import type { Processo } from '@/lib/types/processo'
import { CATEGORIA_LABELS, STATUS_LANCAMENTO_LABELS, STATUS_LANCAMENTO_COLORS } from '@/lib/types/financeiro'
import { TIPO_DOCUMENTO_LABELS, TIPO_DOCUMENTO_ICONES, formatarTamanho } from '@/lib/types/documento'
import DownloadButton from './DownloadButton'

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-slate-500 pt-0.5">{label}</span>
      <span className="text-sm text-slate-200 text-right max-w-[60%]">{value}</span>
    </div>
  )
}

function formatDate(d?: string | null) {
  if (!d) return null
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')
}

export default async function PortalProcessoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const service = createServiceClient()

  // Verifica acesso do portal
  const { data: acesso } = await service
    .from('portal_acessos')
    .select('despachante_id, clientes(razao_social)')
    .eq('email', user.email!)
    .eq('ativo', true)
    .maybeSingle()

  if (!acesso) redirect('/portal/processos')

  const razaoSocial = (acesso as any).clientes?.razao_social ?? ''

  // Busca o processo garantindo que pertence ao cliente
  const { data: processo } = await service
    .from('processos')
    .select('*')
    .eq('id', id)
    .eq('user_id', acesso.despachante_id)
    .eq('cliente', razaoSocial)
    .maybeSingle()

  if (!processo) notFound()

  const p = processo as Processo

  // Busca documentos e lançamentos em paralelo
  const [{ data: documentos }, { data: lancamentos }] = await Promise.all([
    service.from('documentos').select('*').eq('processo_id', id).order('created_at', { ascending: false }),
    service.from('lancamentos_financeiros')
      .select('tipo, categoria, descricao, valor, moeda, status, vencimento')
      .eq('processo_id', id)
      .neq('status', 'cancelado')
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/portal/processos"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition"
        >
          <ArrowLeft size={16} />
          Meus Processos
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-white font-mono">{p.numero}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${TIPO_COLORS[p.tipo]}`}>
                {TIPO_LABELS[p.tipo]}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{p.mercadoria}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold border ${STATUS_COLORS[p.status]}`}>
            {STATUS_LABELS[p.status]}
          </span>
        </div>
      </div>

      {/* Grid de info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={15} className="text-amber-400" />
            <p className="text-sm font-semibold text-white">Dados do Processo</p>
          </div>
          <InfoRow label="Abertura" value={formatDate(p.data_abertura)} />
          <InfoRow label="Modal" value={p.modal ? MODAL_LABELS[p.modal] : null} />
          <InfoRow label={p.tipo === 'importacao' ? 'Previsão de Chegada' : 'Previsão de Embarque'} value={formatDate(p.previsao_chegada)} />
          {p.data_desembaraco && <InfoRow label="Data de Desembaraço" value={formatDate(p.data_desembaraco)} />}
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={15} className="text-amber-400" />
            <p className="text-sm font-semibold text-white">Origem e Destino</p>
          </div>
          <InfoRow label={p.tipo === 'importacao' ? 'País de Origem' : 'País de Destino'} value={p.pais_origem} />
          <InfoRow label="Porto de Embarque" value={p.porto_embarque} />
          <InfoRow label="Porto de Destino" value={p.porto_destino} />
        </div>
      </div>

      {/* Documentos */}
      {documentos && documentos.length > 0 && (
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <FolderOpen size={15} className="text-amber-400" />
            <p className="text-sm font-semibold text-white">
              Documentos <span className="text-slate-500 font-normal">({documentos.length})</span>
            </p>
          </div>
          <div className="px-5">
            {documentos.map((doc: any) => (
              <DownloadItem key={doc.id} doc={doc} />
            ))}
          </div>
        </div>
      )}

      {/* Financeiro */}
      {lancamentos && lancamentos.length > 0 && (
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <DollarSign size={15} className="text-amber-400" />
            <p className="text-sm font-semibold text-white">Financeiro</p>
          </div>
          <div className="px-5">
            {(lancamentos as any[]).map((l, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${l.tipo === 'receita' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200">{l.descricao}</p>
                  <p className="text-xs text-slate-500">{CATEGORIA_LABELS[l.categoria as keyof typeof CATEGORIA_LABELS] ?? l.categoria}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${l.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {l.tipo === 'receita' ? '+' : '-'}
                    {l.moeda} {Number(l.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium border ${(STATUS_LANCAMENTO_COLORS as any)[l.status] ?? ''}`}>
                    {(STATUS_LANCAMENTO_LABELS as any)[l.status] ?? l.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observações */}
      {p.observacoes && (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <p className="text-sm font-semibold text-white mb-2">Observações</p>
          <p className="text-slate-400 text-sm leading-relaxed">{p.observacoes}</p>
        </div>
      )}
    </div>
  )
}

// Componente de download de documentos
function DownloadItem({ doc }: { doc: any }) {
  const icone = TIPO_DOCUMENTO_ICONES[doc.tipo_documento as keyof typeof TIPO_DOCUMENTO_ICONES] ?? '📄'
  const label = TIPO_DOCUMENTO_LABELS[doc.tipo_documento as keyof typeof TIPO_DOCUMENTO_LABELS] ?? 'Documento'
  const data = new Date(doc.created_at).toLocaleDateString('pt-BR')

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-lg select-none">{icone}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate">{doc.nome_original}</p>
        <p className="text-xs text-slate-500">{label} · {formatarTamanho(doc.tamanho)} · {data}</p>
      </div>
      <DownloadButton storagePath={doc.storage_path} />
    </div>
  )
}
