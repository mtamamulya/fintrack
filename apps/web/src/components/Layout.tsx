import { Outlet, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',             label: 'Dashboard',  icon: '⊞' },
  { to: '/transactions', label: 'Transaksi',  icon: '↕' },
  { to: '/budget',       label: 'Budget',     icon: '◎' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-lg mx-auto relative">
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg
                      bg-slate-900 border-t border-slate-800 flex z-50">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 text-xs gap-1 transition-colors
               ${isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
