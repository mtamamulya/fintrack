import { useDashboard } from '../hooks/useDashboard'
import { useAuthStore } from '../store/authStore'
import { formatShortIDR, formatIDR } from '../utils/format'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const { data, isLoading } = useDashboard()
  const user                = useAuthStore(s => s.user)
  const logout              = useAuthStore(s => s.logout)

  if (isLoading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
    </div>
  )

  return (
    <div className="p-5 space-y-6 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Selamat datang kembali</p>
          <p className="text-xl font-bold font-display tracking-tight text-white">{user?.full_name ?? 'Pengguna'}</p>
        </div>
        <button onClick={logout} className="glass-button px-4 py-2 rounded-full text-xs font-semibold text-slate-300">
          Keluar
        </button>
      </div>

      {/* Balance Card - Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-blue-600 to-indigo-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-xl -ml-10 -mb-10" />
        
        <div className="relative z-10">
          <p className="text-xs text-blue-200/80 mb-1.5 font-medium tracking-wider">TOTAL SALDO</p>
          <p className="text-4xl font-bold tracking-tight font-display text-white drop-shadow-md">
            {data ? formatIDR(data.total_balance) : '—'}
          </p>
          
          {data && (
            <div className="flex gap-4 mt-6 p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/5">
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-[10px] text-green-400">↓</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium">Pemasukan</p>
                </div>
                <p className="text-sm font-bold text-green-400">{formatShortIDR(data.total_income_mtd)}</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-[10px] text-red-400">↑</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium">Pengeluaran</p>
                </div>
                <p className="text-sm font-bold text-red-400">{formatShortIDR(data.total_expense_mtd)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      {data && data.monthly_chart.length > 0 && (
        <div className="glass-card rounded-3xl p-5">
          <p className="text-sm font-bold font-display mb-4">Tren 6 Bulan Terakhir</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_chart} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis 
                  dataKey="period" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  dy={10}
                  tickFormatter={(val) => {
                    const [y, m] = val.split('-');
                    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
                    return `${months[parseInt(m)-1]} '${y.slice(2)}`;
                  }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(val: number) => formatIDR(val)}
                />
                <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Wallets */}
      {data && data.wallets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold font-display">Dompet Saya</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {data.wallets.map(w => (
              <div key={w.wallet_id}
                className="snap-start min-w-[140px] glass-card rounded-2xl p-4 flex-shrink-0 transition-transform hover:scale-105">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                  <span className="text-sm">💳</span>
                </div>
                <p className="text-xs text-slate-400 font-medium truncate">{w.name}</p>
                <p className="text-sm font-bold text-white mt-0.5">{formatShortIDR(w.balance)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Warnings */}
      {data?.budget_statuses.filter(b => b.is_warning).length ? (
        <div className="space-y-2">
          <p className="text-sm font-bold font-display mb-2">Peringatan Budget</p>
          {data.budget_statuses.filter(b => b.is_warning).map(b => (
            <div key={b.category_name}
              className="relative overflow-hidden bg-red-950/40 border border-red-500/30 rounded-2xl p-4">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-xl -mr-4 -mt-4" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-200">
                    {b.category_name} hampir habis
                  </p>
                  <p className="text-xs text-red-300/80 mt-0.5">
                    Sisa {formatShortIDR(b.limit - b.spent)} ({b.remaining_pct}%)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Category spend */}
      {data && data.category_spend.length > 0 && (
        <div className="glass-card rounded-3xl p-5">
          <p className="text-sm font-bold font-display mb-5">Pengeluaran Tertinggi</p>
          <div className="space-y-4">
            {data.category_spend.map(c => {
              const budget = data.budget_statuses.find(b => b.category_name === c.category_name)
              const pct    = budget ? Math.min(100, Math.round((c.amount / budget.limit) * 100)) : null
              return (
                <div key={c.category_name} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shadow-lg" style={{ background: c.category_color ?? '#3b82f6', boxShadow: `0 0 8px ${c.category_color ?? '#3b82f6'}80` }} />
                      <span className="text-sm font-medium text-slate-200">{c.category_name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{formatShortIDR(c.amount)}</span>
                  </div>
                  {pct !== null && (
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-125"
                        style={{
                          width     : `${pct}%`,
                          background: c.category_color ?? '#3b82f6',
                          boxShadow: `0 0 10px ${c.category_color ?? '#3b82f6'}60`
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
        <div className="text-center py-16 px-4 glass-card rounded-3xl border-dashed border-2 border-slate-700">
          <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">👛</span>
          </div>
          <p className="text-lg font-bold font-display mb-1 text-white">Belum ada dompet</p>
          <p className="text-sm text-slate-400 mb-6">Tambahkan dompet pertama kamu untuk mulai melacak keuangan.</p>
        </div>
      )}
    </div>
  )
}
