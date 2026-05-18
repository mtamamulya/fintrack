import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout       from './components/Layout'
import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget       from './pages/Budget'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const hydrate = useAuthStore(s => s.hydrate)
  useEffect(() => { hydrate() }, [hydrate])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index             element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budget"       element={<Budget />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
