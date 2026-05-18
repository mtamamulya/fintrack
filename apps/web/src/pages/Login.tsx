import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [email, setEmail]    = useState('')
  const [password, setPass]  = useState('')
  const [error, setError]    = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate              = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Email atau password salah.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">FinTrack 💰</h1>
          <p className="text-slate-400 text-sm mt-1">Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
                       text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={e => setPass(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
                       text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white
                       py-3 rounded-xl font-semibold text-sm disabled:opacity-50
                       hover:opacity-90 transition-opacity"
          >
            {isLoading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
