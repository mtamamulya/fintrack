import { useDashboard } from '../hooks/useDashboard'
import { useAuthStore } from '../store/authStore'
import { formatShortIDR, formatIDR } from '../utils/format'

export default function Dashboard() {
  const { data, isLoading } = useDashboard()
  const user                = useAuthStore(s => s.user)
  const logout              = useAuthStore(s => s.logout)

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs text-slate-400">Selamat datang,</p>
          <p className="font-semibold">{user?.full_name ?? 'Pengguna'}</p>
        </div>
        <button onClick={logout} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
          Keluar
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-700 to-violet-700 rounded-2xl p-5">
        <p className="text-xs text-blue-200 mb-1 tracking-wide">TOTAL SALDO</p>
        <p className="text-3xl font-semibold tracking-tight font-mono">
          {data ? formatIDR(data.total_balance) : '—'}
        </p>
        {data && (
          <div className="flex gap-6 mt-4">
            <div>
              <p className="text-xs text-blue-200 mb-1">▲ Pemasukan</p>
              <p className="text-sm font-semibold text-green-300">{formatShortIDR(data.total_income_mtd)}</p>
            </div>
            <div className="w-px bg-blue-500/40" />
            <div>
              <p className="text-xs text-blue-200 mb-1">▼ Pengeluaran</p>
              <p className="text-sm font-semibold text-red-300">{formatShortIDR(data.total_expense_mtd)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Wallets */}
      {data && data.wallets.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-3">Dompet Saya</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {data.wallets.map(w => (
              <div key={w.wallet_id}
                className="min-w-[130px] bg-slate-800 rounded-2xl p-4 border border-slate-700 flex-shrink-0">
                <p className="text-xs text-slate-400 mb-2">{w.name}</p>
                <p className="text-sm font-semibold font-mono">{formatShortIDR(w.balance)}</p>
                <p className="text-xs text-slate-500 mt-1">{w.wallet_type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Warnings */}
      {data?.budget_statuses.filter(b => b.is_warning).map(b => (
        <div key={b.category_name}
          className="bg-red-950/50 border border-red-800 rounded-xl p-3 text-xs text-red-300">
          ⚠ Budget <strong>{b.category_name}</strong> sisa {b.remaining_pct}% —{' '}
          {formatShortIDR(b.limit - b.spent)} dari {formatShortIDR(b.limit)}
        </div>
      ))}

      {/* Category spend */}
      {data && data.category_spend.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <p className="text-sm font-semibold mb-4">Pengeluaran Bulan Ini</p>
          <div className="space-y-3">
            {data.category_spend.map(c => {
              const budget = data.budget_statuses.find(b => b.category_name === c.category_name)
              const pct    = budget ? Math.min(100, Math.round((c.amount / budget.limit) * 100)) : null
              return (
                <div key={c.category_name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{c.category_name}</span>
                    <span className="text-slate-400">{formatShortIDR(c.amount)}</span>
                  </div>
                  {pct !== null && (
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width     : `${pct}%`,
                          background: c.category_color ?? '#3b82f6',
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {data && data.wallets.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          <p className="text-2xl mb-2">👛</p>
          <p>Belum ada dompet.</p>
          <p className="text-xs mt-1">Tambahkan dompet di halaman Transaksi.</p>
        </div>
      )}
    </div>
  )
}
