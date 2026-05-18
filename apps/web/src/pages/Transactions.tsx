import { useState } from 'react'
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '../hooks/useTransactions'
import { useWallets } from '../hooks/useWallets'
import { formatIDR, formatDate, todayISO } from '../utils/format'

type TxnType = 'income' | 'expense' | 'transfer'

const TYPE_STYLE: Record<TxnType, string> = {
  expense : 'bg-red-900/60 text-red-300',
  income  : 'bg-green-900/60 text-green-300',
  transfer: 'bg-blue-900/60 text-blue-300',
}

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
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 pt-2">
        <h2 className="text-base font-semibold">Transaksi Bulan Ini</h2>
        <button
          onClick={() => { setShowForm(true); reset() }}
          className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
        >
          + Tambah
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit}
          className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-4 space-y-3">

          {/* Type switcher */}
          <div className="flex gap-2">
            {(['expense', 'income', 'transfer'] as TxnType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors
                  ${type === t ? TYPE_STYLE[t] : 'bg-slate-700 text-slate-400'}`}
              >
                {t === 'income' ? 'Masuk' : t === 'expense' ? 'Keluar' : 'Transfer'}
              </button>
            ))}
          </div>

          <input
            type="number"
            placeholder="Jumlah (Rp)"
            required
            min={1}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none focus:border-blue-500"
          />

          <select
            required
            value={walletId}
            onChange={e => setWalletId(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none text-slate-100"
          >
            <option value="">— Pilih Dompet —</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} — {new Intl.NumberFormat('id-ID').format(w.balance)}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={txDate}
            onChange={e => setTxDate(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none focus:border-blue-500"
          />

          <textarea
            placeholder="Catatan (opsional)"
            rows={2}
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none focus:border-blue-500 resize-none"
          />

          {formError && <p className="text-red-400 text-xs">{formError}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-600 text-sm text-slate-400"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMut.isPending}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {createMut.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      {/* Transaction list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : txns.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          <p className="text-2xl mb-2">📋</p>
          <p>Belum ada transaksi bulan ini.</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
          {txns.map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-slate-700' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0
                ${t.type === 'income' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                {t.type === 'income' ? '▲' : '▼'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {t.description ?? (t.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{formatDate(t.transaction_date)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold font-mono
                  ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatIDR(t.amount)}
                </span>
                <button
                  onClick={() => deleteMut.mutate(t.id)}
                  disabled={deleteMut.isPending}
                  className="text-slate-600 hover:text-red-400 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
