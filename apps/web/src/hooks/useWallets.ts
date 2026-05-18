import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import type { WalletResponse, WalletCreate } from '../types'

export function useWallets() {
  return useQuery<WalletResponse[]>({
    queryKey: ['wallets'],
    queryFn : () => api.get('/wallets/').then(r => r.data),
  })
}

export function useCreateWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: WalletCreate) =>
      api.post<WalletResponse>('/wallets/', payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] }),
  })
}
