import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import InterviewPage from './pages/InterviewPage'
import RoadmapPage from './pages/RoadmapPage'
import ResumePage from './pages/ResumePage'
import {
  authStorageKey,
  consumeAuthNotice,
  getStoredToken,
  readStoredAuth,
} from './lib/auth'
import { clearStoredResume, readStoredResume, writeStoredResume } from './lib/resume'

const initialFormState = {
  name: '',
  email: '',
  password: '',
}

const api = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
})

const modeCopy = {
  login: {
    eyebrow: 'Login',
    title: 'Sign in',
    subtitle: 'Continue to your workspace.',
    button: 'Sign in',
    switchLabel: "Don't have an account?",
    switchAction: 'Create one',
  },
  register: {
    eyebrow: 'Register',
    title: 'Create account',
    subtitle: 'Set up your workspace.',
    button: 'Create account',
    switchLabel: 'Already have an account?',
    switchAction: 'Sign in',
  },
}

function AuthPage({ auth, setAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialFormState)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRegister = mode === 'register'
  const copy = modeCopy[mode]
  const navigate = useNavigate()
  const location = useLocation()

  const token = auth?.token ?? getStoredToken()
  const redirectPath = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, token])

  useEffect(() => {
    const authNotice = consumeAuthNotice()

    if (authNotice) {
      setStatus({
        type: 'error',
        message: authNotice,
      })
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleToggle = (nextMode) => {
    setMode(nextMode)
    setForm(initialFormState)
    setStatus({ type: '', message: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    const payload = isRegister
      ? form
      : { email: form.email, password: form.password }

    try {
      const { data } = await api.post(isRegister ? '/register' : '/login', payload)

      if (isRegister) {
        setStatus({
          type: 'success',
          message: 'Account created successfully. You can sign in now.',
        })
        setMode('login')
        setForm({ ...initialFormState, email: form.email })
        return
      }

      const nextAuth = {
        token: data.token,
        user: data.user,
      }

      setAuth(nextAuth)
      setStatus({
        type: 'success',
        message: `Welcome back, ${data.user?.name || 'there'}!`,
      })
      setForm(initialFormState)
      navigate(redirectPath, { replace: true })
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error.response?.data?.message ||
          error.message ||
          'Unable to reach the server. Make sure the backend is running on port 5000.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-xl bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-slate-950 px-6 py-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-200">
                PrepSense
              </span>
              <h1 className="max-w-sm text-xl font-medium tracking-tight">
                Prep workspace
              </h1>
            </div>

            <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex gap-2 text-xs text-slate-300">
                <span className="rounded-full border border-white/10 px-2.5 py-1">
                  Secure
                </span>
                <span className="rounded-full border border-white/10 px-2.5 py-1">
                  Clean
                </span>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center bg-white p-4 sm:p-6">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => handleToggle('login')}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle('register')}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Register
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  {copy.eyebrow}
                </p>
                <h2 className="text-xl font-medium tracking-tight text-slate-950">
                  {copy.title}
                </h2>
                <p className="text-sm text-slate-500">
                  {copy.subtitle}
                </p>
              </div>

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                {isRegister && (
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      Full name
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                      required={isRegister}
                    />
                  </label>
                )}

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Email address
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Password
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                    required
                  />
                </label>

                {status.message && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      status.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {status.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Please wait...' : copy.button}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                {copy.switchLabel}{' '}
                <button
                  type="button"
                  onClick={() =>
                    handleToggle(isRegister ? 'login' : 'register')
                  }
                  className="font-semibold text-slate-900 transition hover:text-slate-700"
                >
                  {copy.switchAction}
                </button>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function ProtectedRoute() {
  const token = getStoredToken()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

function App() {
  const [auth, setAuth] = useState(() => readStoredAuth())
  const [resumeData, setResumeData] = useState(() => readStoredResume())

  useEffect(() => {
    if (auth?.token) {
      localStorage.setItem(authStorageKey, JSON.stringify(auth))
      return
    }

    localStorage.removeItem(authStorageKey)
  }, [auth])

  useEffect(() => {
    if (resumeData) {
      writeStoredResume(resumeData)
      return
    }

    clearStoredResume()
  }, [resumeData])

  return (
    <Routes>
      <Route path="/" element={<AuthPage auth={auth} setAuth={setAuth} />} />
      <Route path="/login" element={<AuthPage auth={auth} setAuth={setAuth} />} />
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <DashboardLayout
              auth={auth}
              setAuth={setAuth}
              resumeData={resumeData}
              setResumeData={setResumeData}
            />
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
