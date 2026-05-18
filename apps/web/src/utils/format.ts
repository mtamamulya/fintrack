export const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style              : 'currency',
    currency           : 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)

export const formatShortIDR = (amount: number): string => {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
  if (amount >= 1_000_000)     return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`
  if (amount >= 1_000)         return `Rp ${(amount / 1_000).toFixed(0)}K`
  return `Rp ${amount}`
}

export const formatDate = (d: string | Date) =>
  new Intl.DateTimeFormat('id-ID', {
    day  : '2-digit',
    month: 'short',
    year : 'numeric',
  }).format(new Date(d))

export const todayISO = () => new Date().toISOString().split('T')[0]
