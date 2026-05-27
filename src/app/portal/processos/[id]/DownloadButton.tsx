'use client'

import { useTransition } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { getDownloadUrlAction } from '@/app/dashboard/documentos/actions'

export default function DownloadButton({ storagePath }: { storagePath: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDownload() {
    startTransition(async () => {
      const url = await getDownloadUrlAction(storagePath)
      if (url) window.open(url, '_blank')
    })
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isPending}
      title="Baixar"
      className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition shrink-0"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
    </button>
  )
}
