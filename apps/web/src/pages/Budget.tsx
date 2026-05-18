import { useDashboard } from '../hooks/useDashboard'
import { formatIDR } from '../utils/format'

export default function Budget() {
  const { data, isLoading } = useDashboard()

  if (isLoading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
    </div>
  )

  return (
    <div className="p-5 pb-24 max-w-lg mx-auto space-y-6">
      <div className="pt-4 mb-2">
        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Manajemen</p>
        <h2 className="text-xl font-bold font-display text-white">Budget Bulan Ini</h2>
      </div>

      {!data || data.budget_statuses.length === 0 ? (
        <div className="text-center py-16 px-4 glass-card rounded-3xl border-dashed border-2 border-slate-700 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-20 h-20 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner rotate-3 transition-transform hover:rotate-6">
            <span className="text-4xl">🎯</span>
          </div>
          <p className="text-lg font-bold font-display mb-2 text-white relative z-10">Belum ada budget</p>
          <p className="text-sm text-slate-400 relative z-10">Atur budget pengeluaran bulanan kamu agar keuangan tetap sehat.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.budget_statuses.map(b => {
            const pct = Math.min(100, Math.round((b.spent / b.limit) * 100))
            const colorClass = b.is_warning ? 'from-red-500 to-orange-500' : 'from-emerald-400 to-emerald-600'
            const shadowColor = b.is_warning ? 'shadow-red-500/40' : 'shadow-emerald-500/40'
            
            return (
              <div key={b.category_name}
                className="glass-card rounded-3xl p-5 relative overflow-hidden transition-all hover:bg-slate-800/80">
                
                {b.is_warning && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                )}

                <div className="flex flex-col gap-4 relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                        <span className="text-lg">📊</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{b.category_name}</p>
                        <p className="text-xs text-slate-400 font-medium">Limit {formatIDR(b.limit)}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      b.is_warning ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      Sisa {b.remaining_pct}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-bold font-mono mb-2">
                      <span className="text-slate-300">{formatIDR(b.spent)}</span>
                      <span className={b.is_warning ? 'text-red-400' : 'text-slate-400'}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colorClass} ${shadowColor} shadow-lg transition-all duration-1000 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Warning Message */}
                  {b.is_warning && (
                    <div className="mt-1 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <span className="text-red-400 text-sm mt-0.5">⚠️</span>
                      <p className="text-xs text-red-300 font-medium leading-relaxed">
                        Hati-hati! Sisa budget kamu tinggal <span className="font-bold text-red-400">{formatIDR(b.limit - b.spent)}</span>. Kurangi pengeluaran agar tidak overbudget!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
