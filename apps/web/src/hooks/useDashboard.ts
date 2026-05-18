import { useQuery } from '@tanstack/react-query'
import api from '../api/client'
import type { DashboardSummary } from '../types'

export function useDashboard() {
  return useQuery<DashboardSummary>({
    queryKey : ['dashboard'],
    queryFn  : () => api.get('/dashboard/summary').then(r => r.data),
    staleTime: 30_000,
  })
}
