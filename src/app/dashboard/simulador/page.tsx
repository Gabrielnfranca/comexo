import { Calculator } from 'lucide-react'
import SimuladorForm from './SimuladorForm'

export default function SimuladorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator size={22} className="text-amber-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Simulador de Tributos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Calcule II, IPI, PIS, COFINS, ICMS, AFRMM e Taxa Siscomex
          </p>
        </div>
      </div>
      <SimuladorForm />
    </div>
  )
}
