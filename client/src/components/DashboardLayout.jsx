import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearStoredAuth } from '../lib/auth'

const navigationItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 13h8V3H3z" />
        <path d="M13 21h8v-6h-8z" />
        <path d="M13 3h8v8h-8z" />
        <path d="M3 21h8v-4H3z" />
      </svg>
    ),
  },
  {
    label: 'Resume',
    path: '/resume',
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5" />
        <path d="M10 13h6" />
        <path d="M10 17h6" />
      </svg>
    ),
  },
  {
    label: 'Interview',
    path: '/interview',
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6h16" />
        <path d="M4 12h10" />
        <path d="M4 18h7" />
        <circle cx="18" cy="12" r="3" />
      </svg>
    ),
  },
  {
    label: 'Roadmap',
    path: '/roadmap',
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19h16" />
        <path d="M6 16V8" />
        <path d="M12 16V5" />
        <path d="M18 16v-6" />
      </svg>
    ),
  },
]

function DashboardLayout({ auth, setAuth, resumeData, setResumeData }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearStoredAuth()
    setAuth(null)
    setResumeData(null)
    navigate('/login', { replace: true })
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-slate-100">
      <aside className="flex h-screen w-64 min-w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white p-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-600">
              PrepSense
            </span>
          </div>

          <nav className="grid gap-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-3 transition ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto space-y-3">
          <div className="rounded-xl bg-slate-100 p-3">
            <p className="text-sm font-medium text-slate-900">
              {auth?.user?.name || 'User'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {auth?.user?.email || 'No email'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </aside>

      <section className="h-screen min-w-0 flex-1 overflow-y-auto">
        <Outlet context={{ auth, resumeData, setResumeData }} />
      </section>
    </main>
  )
}

export default DashboardLayout
