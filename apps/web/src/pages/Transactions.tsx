import { useState } from 'react'
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '../hooks/useTransactions'
import { useWallets } from '../hooks/useWallets'
import { formatIDR, formatDate, todayISO } from '../utils/format'

type TxnType = 'income' | 'expense' | 'transfer'

export default function Transactions() {
  const now = new Date()
  const { data: txns = [], isLoading } = useTransactions({
    month: now.getMonth() + 1,
    year : now.getFullYear(),
  })
  const { data: wallets = [] } = useWallets()
  const createMut              = useCreateTransaction()
  const deleteMut              = useDeleteTransaction()

  const [showForm, setShowForm] = useState(false)
  const [type, setType]         = useState<TxnType>('expense')
  const [amount, setAmount]     = useState('')
  const [walletId, setWalletId] = useState('')
  const [desc, setDesc]         = useState('')
  const [txDate, setTxDate]     = useState(todayISO())
  const [formError, setFormError] = useState('')

  const reset = () => {
    setAmount(''); setDesc(''); setTxDate(todayISO()); setFormError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!walletId) { setFormError('Pilih dompet terlebih dahulu'); return }
    try {
      await createMut.mutateAsync({
        wallet_id       : walletId,
        type,
        amount          : parseFloat(amount),
        description     : desc || undefined,
        transaction_date: txDate,
      })
      setShowForm(false)
      reset()
    } catch (err: any) {
      setFormError(err?.response?.data?.detail ?? 'Terjadi kesalahan')
    }
  }

  return (
    <div className="p-5 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6 pt-4">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Aktivitas</p>
          <h2 className="text-xl font-bold font-display text-white">Transaksi Bulan Ini</h2>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); reset() }}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all shadow-lg ${
            showForm 
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25'
          }`}
        >
          {showForm ? 'Batal' : '+ Tambah'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit}
          className="glass-card rounded-3xl p-6 mb-8 border border-white/10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          {/* Type switcher */}
          <div className="flex p-1 bg-slate-900/50 rounded-2xl mb-5">
            {(['expense', 'income', 'transfer'] as TxnType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  type === t 
                    ? t === 'expense' ? 'bg-red-500/20 text-red-400 shadow-sm'
                    : t === 'income' ? 'bg-green-500/20 text-green-400 shadow-sm'
                    : 'bg-blue-500/20 text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {t === 'income' ? 'Pemasukan' : t === 'expense' ? 'Pengeluaran' : 'Transfer'}
              </button>
            ))}
          </div>

          <div className="space-y-4 relative z-10">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
              <input
                type="number"
                placeholder="0"
                required
                min={1}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl pl-11 pr-4 py-3.5
                           text-lg font-bold font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
              />
            </div>

            <select
              required
              value={walletId}
              onChange={e => setWalletId(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-4 py-3.5
                         text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-200 appearance-none"
            >
              <option value="" disabled>Pilih Sumber Dompet</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id} className="bg-slate-800">
                  {w.name} — Rp {new Intl.NumberFormat('id-ID').format(w.balance)}
                </option>
              ))}
            </select>

            <div className="flex gap-4">
              <input
                type="date"
                value={txDate}
                onChange={e => setTxDate(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-4 py-3.5
                           text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-200"
              />
            </div>

            <textarea
              placeholder="Catatan transaksi (opsional)"
              rows={2}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-4 py-3.5
                         text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none placeholder-slate-500 text-slate-200"
            />

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-xs font-medium text-center">{formError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={createMut.isPending}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-70 transition-all"
            >
              {createMut.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      )}

      {/* Transaction list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          </div>
        ) : txns.length === 0 ? (
          <div className="text-center py-16 px-4 glass-card rounded-3xl border-dashed border-2 border-slate-700 mt-8">
            <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-lg font-bold font-display mb-1 text-white">Belum ada aktivitas</p>
            <p className="text-sm text-slate-400">Transaksi bulan ini akan muncul di sini.</p>
          </div>
        ) : (
          txns.map((t) => (
            <div
              key={t.id}
              className="group glass-card rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-slate-800/80 hover:border-slate-600 cursor-default"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner
                ${t.type === 'income' ? 'bg-gradient-to-br from-green-400/20 to-green-600/20 text-green-400 border border-green-500/20' 
                : t.type === 'expense' ? 'bg-gradient-to-br from-red-400/20 to-red-600/20 text-red-400 border border-red-500/20'
                : 'bg-gradient-to-br from-blue-400/20 to-blue-600/20 text-blue-400 border border-blue-500/20'}`}>
                {t.type === 'income' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                ) : t.type === 'expense' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-200 truncate">
                  {t.description ?? (t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer')}
                </p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{formatDate(t.transaction_date)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-sm font-bold font-mono tracking-tight
                  ${t.type === 'income' ? 'text-green-400' : t.type === 'expense' ? 'text-red-400' : 'text-blue-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatIDR(t.amount)}
                </span>
                <button
                  onClick={() => {
                    if (confirm('Hapus transaksi ini?')) deleteMut.mutate(t.id)
                  }}
                  disabled={deleteMut.isPending}
                  className="opacity-0 group-hover:opacity-100 text-[10px] uppercase font-bold tracking-wider text-red-400/70 hover:text-red-400 transition-all disabled:opacity-0"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
