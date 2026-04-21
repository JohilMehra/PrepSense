import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatAreaLabel } from '../lib/interview'
import {
  readRoadmap,
  readRoadmapProgress,
  writeRoadmapProgress,
} from '../lib/roadmap'

function FocusAreas({ weakAreas }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Focus Areas</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {weakAreas?.length ? (
          weakAreas.map((area) => (
            <span
              key={area}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
            >
              {formatAreaLabel(area)}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
            None
          </span>
        )}
      </div>
    </section>
  )
}

function ProgressBar({ progress }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-950">Progress</h2>
        <p className="text-sm font-medium text-slate-700">{progress}%</p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-950 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  )
}

function DayCard({ completedTasks, day, onToggleTask, tasks }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">Day {day}</h3>
      <ul className="mt-4 space-y-3">
        {tasks.map((task, index) => {
          const taskKey = `${day}-${index}`
          const checked = Boolean(completedTasks[taskKey])

          return (
            <li
              key={taskKey}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTask(day, index)}
                  className="mt-1 h-4 w-4 rounded accent-slate-950"
                />
                <span
                  className={`text-sm ${
                    checked ? 'text-slate-400 line-through' : 'text-slate-700'
                  }`}
                >
                  {task}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

function EmptyRoadmap({ onStartInterview }) {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-slate-950">No roadmap yet</h1>
          <button
            type="button"
            onClick={onStartInterview}
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Start Interview
          </button>
        </div>
      </section>
    </div>
  )
}

function RoadmapPage() {
  const navigate = useNavigate()
  const [roadmap] = useState(() => readRoadmap())
  const [completedTasks, setCompletedTasks] = useState(() => readRoadmapProgress())

  useEffect(() => {
    writeRoadmapProgress(completedTasks)
  }, [completedTasks])

  const planItems = useMemo(
    () => (Array.isArray(roadmap?.plan) ? roadmap.plan : []),
    [roadmap]
  )

  const totalTasks = useMemo(
    () => planItems.reduce((count, item) => count + item.tasks.length, 0),
    [planItems]
  )

  const completedCount = useMemo(
    () => Object.values(completedTasks).filter(Boolean).length,
    [completedTasks]
  )

  const progress = totalTasks
    ? Math.round((completedCount / totalTasks) * 100)
    : 0

  if (!roadmap) {
    return <EmptyRoadmap onStartInterview={() => navigate('/interview')} />
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">Roadmap</h1>
      </section>

      <FocusAreas weakAreas={roadmap.weakAreas || []} />
      <ProgressBar progress={progress} />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-950">{roadmap.duration}</p>
      </section>

      <section className="space-y-4">
        {planItems.map((item) => (
          <DayCard
            key={item.day}
            completedTasks={completedTasks}
            day={item.day}
            onToggleTask={(day, taskIndex) => {
              const taskKey = `${day}-${taskIndex}`
              setCompletedTasks((current) => ({
                ...current,
                [taskKey]: !current[taskKey],
              }))
            }}
            tasks={item.tasks}
          />
        ))}
      </section>
    </div>
  )
}

export default RoadmapPage
