import { useDashboard } from '../hooks/useDashboard'
import { formatIDR } from '../utils/format'

export default function Budget() {
  const { data, isLoading } = useDashboard()

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-4">
      <h2 className="text-base font-semibold mb-4 pt-2">Budget Bulan Ini</h2>

      {!data || data.budget_statuses.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          <p className="text-2xl mb-2">🎯</p>
          <p>Belum ada budget yang diatur.</p>
          <p className="text-xs mt-1 text-slate-600">Hubungi admin atau tambah via API.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.budget_statuses.map(b => {
            const pct = Math.min(100, Math.round((b.spent / b.limit) * 100))
            return (
              <div key={b.category_name}
                className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{b.category_name}</span>
                  <span className={`text-xs font-semibold ${b.is_warning ? 'text-red-400' : 'text-slate-400'}`}>
                    {b.is_warning ? '⚠ ' : ''}Sisa {b.remaining_pct}%
                  </span>
                </div>

                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width     : `${pct}%`,
                      background: b.is_warning ? '#f87171' : '#22c55e',
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Terpakai {formatIDR(b.spent)}</span>
                  <span>Limit {formatIDR(b.limit)}</span>
                </div>

                {b.is_warning && (
                  <p className="text-xs text-red-400 bg-red-950/40 rounded-lg px-3 py-2">
                    ⚠ Sisa budget tinggal {formatIDR(b.limit - b.spent)} lagi!
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
