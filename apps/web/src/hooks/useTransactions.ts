import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import type { TransactionCreate, TransactionResponse } from '../types'

export function useTransactions(params?: { month?: number; year?: number; wallet_id?: string }) {
  return useQuery<TransactionResponse[]>({
    queryKey: ['transactions', params],
    queryFn : () => api.get('/transactions/', { params }).then(r => r.data),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TransactionCreate) =>
      api.post<TransactionResponse>('/transactions/', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}
