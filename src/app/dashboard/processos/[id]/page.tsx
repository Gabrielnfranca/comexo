import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Ship, Plane, DollarSign, FileText, Package2 } from 'lucide-react'
import {
  STATUS_COLORS, STATUS_LABELS,
  TIPO_COLORS, MODAL_LABELS,
  getTipoModalLabel,
} from '@/lib/types/processo'
import type { Processo } from '@/lib/types/processo'
import type { TributoDi } from '@/lib/types/desembaraco'
import { formatarNcm } from '@/lib/types/ncm'
import AtualizarStatus from './AtualizarStatus'
import LancamentosProcesso from '@/components/LancamentosProcesso'
import DocumentosProcesso from '@/components/DocumentosProcesso'
import DesembaracoSection from '@/components/DesembaracoSection'
import ProcessoProgresso from '@/components/ProcessoProgresso'
import ProcessoTimeline from '@/components/ProcessoTimeline'
import CambioCard from '@/components/CambioCard'
import ResumoFinanceiroProcesso from '@/components/ResumoFinanceiroProcesso'
import type { Lancamento } from '@/lib/types/financeiro'
import type { Documento } from '@/lib/types/documento'

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-slate-500 pt-0.5">{label}</span>
      <span className="text-sm text-slate-200 text-right max-w-[60%]">{value}</span>
    </div>
  )
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR')
}

export default async function ProcessoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('processos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const p = data as Processo

  const [lancamentosRes, documentosRes, tributosRes, timelineRes] = await Promise.all([
    supabase.from('lancamentos_financeiros').select('*').eq('processo_id', id).order('created_at', { ascending: false }),
    supabase.from('documentos').select('*').eq('processo_id', id).order('created_at', { ascending: false }),
    supabase.from('tributos_di').select('*').eq('processo_id', id).order('created_at'),
    supabase.from('processo_timeline').select('*').eq('processo_id', id).order('criado_em', { ascending: false }),
  ])

  const isImportacao = p.tipo === 'importacao'
  const isExportacao = p.tipo === 'exportacao'
  const isMaritimo = p.modal === 'maritimo'
  const isAereo = p.modal === 'aereo'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href={p.modal ? `/dashboard/processos?tipo=${p.tipo}&modal=${p.modal}` : '/dashboard/processos'}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-white font-mono">{p.numero}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${TIPO_COLORS[p.tipo]}`}>
                {getTipoModalLabel(p.tipo, p.modal)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[p.status]}`}>
                {STATUS_LABELS[p.status]}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{p.cliente}</p>
          </div>
          <AtualizarStatus processoId={p.id} statusAtual={p.status} tipo={p.tipo} modal={p.modal} />
        </div>
      </div>

      {/* Barra de progresso */}
      <ProcessoProgresso status={p.status} tipo={p.tipo} modal={p.modal} />

      {/* Grid principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Dados do processo */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-amber-400" />
            <p className="text-sm font-semibold text-white">Dados do Processo</p>
          </div>
          <InfoRow label="Cliente" value={p.cliente} />
          <InfoRow label="Mercadoria" value={p.mercadoria} />
          <InfoRow label="NCM" value={p.ncm ? formatarNcm(p.ncm) : null} />
          <InfoRow label="Nº Invoice" value={p.numero_invoice} />
          {p.valor_fob && <InfoRow label="Valor FOB" value={`${p.moeda} ${p.valor_fob.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />}
          {p.peso_bruto && <InfoRow label="Peso Bruto" value={`${p.peso_bruto.toLocaleString('pt-BR')} kg`} />}
          <InfoRow label="Abertura" value={formatDate(p.data_abertura)} />
        </div>

        {/* Transporte */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            {isMaritimo ? <Ship size={16} className="text-amber-400" /> : isAereo ? <Plane size={16} className="text-amber-400" /> : <Package2 size={16} className="text-amber-400" />}
            <p className="text-sm font-semibold text-white">Transporte</p>
          </div>
          <InfoRow label="Modal" value={p.modal ? MODAL_LABELS[p.modal] : null} />
          {isMaritimo && <InfoRow label="Armador" value={p.armador} />}
          {isMaritimo && <InfoRow label="Nº BL" value={p.numero_bl_awb} />}
          {isMaritimo && p.container_tipo && <InfoRow label="Container" value={`${p.container_tipo.toUpperCase()}${p.container_numero ? ` — ${p.container_numero}` : ''}`} />}
          {isAereo && <InfoRow label="Companhia Aérea" value={p.companhia_aerea} />}
          {isAereo && <InfoRow label="Nº AWB" value={p.numero_bl_awb} />}
          {!isMaritimo && !isAereo && <InfoRow label="Transportadora" value={p.armador} />}
          {!isMaritimo && !isAereo && <InfoRow label="Nº Conhecimento" value={p.numero_bl_awb} />}
        </div>

        {/* Rota */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-amber-400" />
            <p className="text-sm font-semibold text-white">Rota</p>
          </div>
          {isImportacao && <InfoRow label="País de Origem" value={p.pais_origem} />}
          {isExportacao && <InfoRow label="País de Destino" value={p.pais_destino} />}
          <InfoRow label={isMaritimo ? 'Porto de Embarque' : 'Aeroporto de Embarque'} value={p.porto_embarque} />
          <InfoRow label={isMaritimo ? 'Porto de Destino' : 'Aeroporto de Destino'} value={p.porto_destino} />
          {isImportacao && <InfoRow label={isAereo ? 'Previsão de Chegada' : 'Previsão de Chegada'} value={formatDate(p.previsao_chegada)} />}
          {isExportacao && <InfoRow label="Previsão de Embarque" value={formatDate(p.previsao_chegada)} />}
        </div>

        {/* Documentação */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-amber-400" />
            <p className="text-sm font-semibold text-white">
              {isImportacao ? 'Desembaraço' : 'Exportação'}
            </p>
          </div>
          {isImportacao && <>
            <InfoRow label="Nº DI / DUIMP" value={p.numero_di} />
            <InfoRow label="Data do Registro" value={formatDate(p.data_registro_di)} />
            {p.canal_parametrizacao && (
              <div className="flex items-start justify-between py-2.5 border-b border-white/5">
                <span className="text-xs text-slate-500">Canal</span>
                <span className={`text-sm font-semibold ${
                  p.canal_parametrizacao === 'verde' ? 'text-green-400' :
                  p.canal_parametrizacao === 'amarelo' ? 'text-yellow-400' :
                  p.canal_parametrizacao === 'vermelho' ? 'text-red-400' :
                  'text-slate-400'
                }`}>
                  Canal {p.canal_parametrizacao.charAt(0).toUpperCase() + p.canal_parametrizacao.slice(1)}
                </span>
              </div>
            )}
            {isImportacao && p.fornecedor && <InfoRow label="Fornecedor (exterior)" value={p.fornecedor} />}
          </>}
          {isExportacao && <>
            <InfoRow label="Nº DU-E" value={p.numero_due} />
            <InfoRow label="Nº RE" value={p.numero_re} />
          </>}
          {p.observacoes && <InfoRow label="Observações" value={p.observacoes} />}
        </div>
      </div>

      {/* Câmbio & Calculadora de Tributos (somente importação) */}
      {isImportacao && (
        <CambioCard
          processoId={p.id}
          moeda={p.moeda}
          valorFob={p.valor_fob}
          valorFrete={p.valor_frete}
          valorSeguro={p.valor_seguro}
          taxaCambio={p.taxa_cambio}
          isMaritimo={isMaritimo}
        />
      )}

      {/* Tributos (somente importação) */}
      {isImportacao && (
        <DesembaracoSection
          processoId={p.id}
          tipo={p.tipo}
          numeroDi={p.numero_di ?? null}
          canal={p.canal_parametrizacao ?? null}
          dataRegistroDi={p.data_registro_di ?? null}
          dataDesembaraco={p.data_desembaraco ?? null}
          tributos={(tributosRes.data ?? []) as TributoDi[]}
        />
      )}

      {/* Resumo financeiro do processo */}
      <ResumoFinanceiroProcesso
        lancamentos={(lancamentosRes.data ?? []) as Lancamento[]}
        tributos={(tributosRes.data ?? []) as TributoDi[]}
        valorCifBRL={
          p.taxa_cambio && p.valor_fob
            ? ((p.valor_fob ?? 0) + (p.valor_frete ?? 0) + (p.valor_seguro ?? 0)) * p.taxa_cambio
            : null
        }
      />

      {/* Financeiro */}
      <LancamentosProcesso
        processoId={p.id}
        lancamentos={(lancamentosRes.data ?? []) as Lancamento[]}
      />

      {/* Documentos */}
      <DocumentosProcesso
        processoId={p.id}
        documentos={(documentosRes.data ?? []) as Documento[]}
      />

      {/* Timeline / histórico */}
      <ProcessoTimeline
        processoId={p.id}
        eventos={timelineRes.data ?? []}
      />
    </div>
  )
}