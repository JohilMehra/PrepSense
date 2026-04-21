import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { formatAreaLabel, normalizeAttempt } from '../lib/interview'
import { handleUnauthorizedApiError } from '../lib/auth'

function StatCard({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
    </article>
  )
}

function WeakAreaTags({ weakAreas }) {
  if (!weakAreas.length) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
        None
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {weakAreas.map((area) => (
        <span
          key={area}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
        >
          {formatAreaLabel(area)}
        </span>
      ))}
    </div>
  )
}

function DashboardPage() {
  const { auth } = useOutletContext()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)

        const { data } = await axios.get(
          'http://localhost:5000/api/interview/history',
          {
            headers: {
              Authorization: `Bearer ${auth?.token || ''}`,
            },
          }
        )

        setHistory(
          (Array.isArray(data) ? data : [])
            .map(normalizeAttempt)
            .filter(Boolean)
            .slice(0, 5)
        )
      } catch (error) {
        if (handleUnauthorizedApiError(error)) {
          return
        }

        setHistory([])
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [auth?.token])

  const latestAttempt = history[0] || null
  const stats = useMemo(() => {
    const score = latestAttempt ? `${latestAttempt.score}/${latestAttempt.total}` : '-'
    const weakAreas = Array.isArray(latestAttempt?.weakAreas)
      ? latestAttempt.weakAreas
      : []
    const totalAttempts = history.length
    const progressValue = Math.min(100, (totalAttempts / 5) * 100)
    const progress = `${Math.round(progressValue)}%`

    return {
      score,
      weakAreas,
      totalAttempts,
      progress,
    }
  }, [history, latestAttempt])

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
            <p className="text-sm text-slate-500">
              {loading ? 'Loading...' : 'Track your latest interview progress.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/interview')}
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Start Interview
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Last Interview Score" value={stats.score} />
        <StatCard label="Total Attempts" value={stats.totalAttempts} />
        <StatCard label="Progress" value={stats.progress} />
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-3 xl:col-span-1">
          <p className="text-sm text-slate-500">Weak Areas</p>
          <div className="mt-3">
            <WeakAreaTags weakAreas={stats.weakAreas} />
          </div>
        </article>
      </section>
    </div>
  )
}

export default DashboardPage
