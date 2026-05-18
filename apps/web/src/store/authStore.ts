import { create } from 'zustand'
import api from '../api/client'

interface User { id: string; email: string; full_name: string }

interface AuthState {
  user     : User | null
  isLoading: boolean
  login    : (email: string, password: string) => Promise<void>
  logout   : () => void
  hydrate  : () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user     : null,
  isLoading: false,

  hydrate: () => {
    const raw = sessionStorage.getItem('ft_user')
    if (raw) set({ user: JSON.parse(raw) })
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const form = new FormData()
      form.append('username', email)
      form.append('password', password)
      const { data } = await api.post('/auth/token', form)
      sessionStorage.setItem('access_token', data.access_token)
      sessionStorage.setItem('ft_user', JSON.stringify(data.user))
      localStorage.setItem('refresh_token', data.refresh_token)
      set({ user: data.user })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    sessionStorage.clear()
    localStorage.removeItem('refresh_token')
    set({ user: null })
  },
}))
