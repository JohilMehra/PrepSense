import axios from 'axios'
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import {
  DIFFICULTY_OPTIONS,
  formatAreaLabel,
  formatCountdown,
  formatHistoryDate,
  getAbsoluteQuestionIndex,
  getSectionMeta,
  getTotalQuestions,
  INTERVIEW_SECTIONS,
  joinWeakAreas,
  normalizeAttempt,
  sectionLabels,
} from '../lib/interview'
import { handleUnauthorizedApiError } from '../lib/auth'
import { resetRoadmapProgress, writeRoadmap } from '../lib/roadmap'

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.'

async function fetchInterviewHistory(token) {
  const { data } = await axios.get('http://localhost:5000/api/interview/history', {
    headers: {
      Authorization: `Bearer ${token || ''}`,
    },
  })

  return (Array.isArray(data) ? data : [])
    .map(normalizeAttempt)
    .filter(Boolean)
    .slice(0, 5)
}

function StatusBadge({ children }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  )
}

function AttemptRow({ attempt }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-950">
            {attempt.score}/{attempt.total}
          </p>
          <p className="text-sm text-slate-600">
            {joinWeakAreas(attempt.weakAreas)}
          </p>
        </div>
        <p className="text-sm text-slate-500">{formatHistoryDate(attempt.date)}</p>
      </div>
    </article>
  )
}

function AttemptsList({ history, isLoading }) {
  return (
    <section className="space-y-3">
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      ) : history.length ? (
        history.map((attempt, index) => (
          <AttemptRow
            key={`${attempt.date}-${attempt.score}-${index}`}
            attempt={attempt}
          />
        ))
      ) : null}
    </section>
  )
}

function StartView({
  difficulty,
  error,
  history,
  historyLoading,
  isStarting,
  onDifficultyChange,
  onRoleChange,
  onStart,
  role,
  totalQuestions,
}) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <section className="max-w-md mx-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            <StatusBadge>{totalQuestions} Questions</StatusBadge>
            <StatusBadge>MCQ + Text</StatusBadge>
          </div>

          <h1 className="text-center text-2xl font-semibold text-slate-950">
            Interview
          </h1>

          <input
            type="text"
            value={role}
            onChange={(event) => onRoleChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
            placeholder="Target role"
          />

          <select
            value={difficulty}
            onChange={(event) => onDifficultyChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={onStart}
              disabled={isStarting}
              className="inline-flex min-w-44 items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isStarting ? 'Starting...' : 'Start Interview'}
            </button>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <p className="text-sm font-medium text-rose-700">{error}</p>
            </div>
          ) : null}
        </div>
      </section>

      <AttemptsList history={history} isLoading={historyLoading} />
    </div>
  )
}

function ActiveInterview({
  answers,
  currentQuestion,
  currentQuestionIndex,
  error,
  isSubmitting,
  onAnswerChange,
  onNext,
  onPrevious,
  onSubmit,
  sectionIndex,
  sectionQuestionCount,
  sectionSecondsLeft,
  sections,
  totalQuestions,
}) {
  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">No questions available.</p>
        </div>
      </div>
    )
  }

  const activeSection = getSectionMeta(sections, sectionIndex)
  const absoluteQuestionIndex = getAbsoluteQuestionIndex(
    sections,
    sectionIndex,
    currentQuestionIndex
  )
  const canGoPrevious = activeSection?.type === 'mcq' && currentQuestionIndex > 0
  const isLastQuestion = absoluteQuestionIndex === totalQuestions - 1
  const sectionLabel =
    sectionLabels[activeSection?.key] || activeSection?.label || 'Interview'

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">{sectionLabel}</p>
              <StatusBadge>
                {absoluteQuestionIndex + 1}/{totalQuestions}
              </StatusBadge>
            </div>

            {activeSection?.type === 'mcq' ? (
              <StatusBadge>{formatCountdown(sectionSecondsLeft)}</StatusBadge>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <p className="text-sm font-medium text-rose-700">{error}</p>
            </div>
          ) : null}

          <div className="space-y-4">
            {currentQuestion.category === 'coding' ? (
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {currentQuestion.question}
              </pre>
            ) : (
              <h1 className="text-2xl font-semibold text-slate-950">
                {currentQuestion.question}
              </h1>
            )}

            {currentQuestion.type === 'mcq' ? (
              <div className="grid gap-3">
                {currentQuestion.options.map((option) => {
                  const checked = answers[absoluteQuestionIndex] === option

                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                        checked
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${absoluteQuestionIndex}`}
                        value={option}
                        checked={checked}
                        onChange={() => onAnswerChange(option)}
                        className="mt-0.5 h-4 w-4 accent-slate-950"
                      />
                      <span className="text-sm leading-6">{option}</span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <textarea
                rows={8}
                value={answers[absoluteQuestionIndex] || ''}
                onChange={(event) => onAnswerChange(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                placeholder="Write your answer..."
              />
            )}
          </div>

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!canGoPrevious || isSubmitting}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {isLastQuestion && currentQuestionIndex === sectionQuestionCount - 1 ? (
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function ResultList({ emptyLabel, items }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.length ? (
        items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            {formatAreaLabel(item)}
          </span>
        ))
      ) : (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          {emptyLabel}
        </span>
      )}
    </div>
  )
}

function BreakdownCard({ category, stats }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        {sectionLabels[category] || formatAreaLabel(category)}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">
        {stats?.score || 0}/{stats?.maxScore || 0}
      </p>
    </article>
  )
}

function FeedbackCard({ item, index }) {
  if (item.type !== 'text') {
    return null
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-950">
            Q{index + 1} - {sectionLabels[item.category]}
          </p>
          <p className="text-sm text-slate-600">{item.question}</p>
        </div>
        <StatusBadge>
          {item.score}/{item.maxScore}
        </StatusBadge>
      </div>

      {item.strengths?.length ? (
        <p className="mt-3 text-sm text-slate-700">
          Strengths: {item.strengths.join(', ')}
        </p>
      ) : null}

      {item.weaknesses?.length ? (
        <p className="mt-2 text-sm text-slate-700">
          Weaknesses: {item.weaknesses.join(', ')}
        </p>
      ) : null}

      {item.suggestion ? (
        <p className="mt-2 text-sm text-slate-700">Suggestion: {item.suggestion}</p>
      ) : null}
    </article>
  )
}

function ResultView({
  error,
  isGeneratingRoadmap,
  onUpdateRoadmap,
  onViewRoadmap,
  result,
}) {
  const breakdownEntries = Object.entries(result.sectionScores || {})

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      ) : null}

      <section className="rounded-xl bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
              Total Score
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-medium tracking-tight">
                {result.score}
              </span>
              <span className="pb-1 text-base text-slate-300">
                / {result.total}
              </span>
            </div>
          </div>
          <StatusBadge>{formatHistoryDate(result.date)}</StatusBadge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {breakdownEntries.map(([category, stats]) => (
          <BreakdownCard key={category} category={category} stats={stats} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Weak Areas</h2>
          <ResultList emptyLabel="None" items={result.weakAreas || []} />
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Improved Areas</h2>
          <ResultList emptyLabel="None" items={result.improvedAreas || []} />
        </article>
      </section>

      {result.questionResults?.some((item) => item.type === 'text') ? (
        <section className="space-y-4">
          {result.questionResults.map((item, index) => (
            <FeedbackCard key={`${item.question}-${index}`} item={item} index={index} />
          ))}
        </section>
      ) : null}

      <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <button
          type="button"
          onClick={onViewRoadmap}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          View Roadmap
        </button>
        <button
          type="button"
          onClick={onUpdateRoadmap}
          disabled={isGeneratingRoadmap}
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isGeneratingRoadmap ? 'Updating...' : 'Update Roadmap'}
        </button>
      </section>
    </div>
  )
}

const createTimerState = (sections) =>
  (Array.isArray(sections) ? sections : []).reduce((accumulator, section) => {
    if (section?.type === 'mcq') {
      accumulator[section.key] = Number(section.timeLimitSeconds) || 0
    }

    return accumulator
  }, {})

function InterviewPage() {
  const { auth, resumeData } = useOutletContext()
  const navigate = useNavigate()
  const [view, setView] = useState('start')
  const [difficulty, setDifficulty] = useState('Medium')
  const [role, setRole] = useState('Software Engineer')
  const [sessionId, setSessionId] = useState('')
  const [sections, setSections] = useState(INTERVIEW_SECTIONS)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [lockedTextAnswers, setLockedTextAnswers] = useState({})
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [sectionTimeRemaining, setSectionTimeRemaining] = useState(
    createTimerState(INTERVIEW_SECTIONS)
  )
  const [isStarting, setIsStarting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const submitInFlightRef = useRef(false)

  const totalQuestions = useMemo(() => getTotalQuestions(sections), [sections])
  const activeSection = getSectionMeta(sections, currentSection)
  const absoluteQuestionIndex = getAbsoluteQuestionIndex(
    sections,
    currentSection,
    currentQuestionIndex
  )
  const currentQuestion = questions[absoluteQuestionIndex] || null
  const sectionSecondsLeft =
    sectionTimeRemaining[activeSection?.key] ?? activeSection?.timeLimitSeconds ?? 0

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true)
        setHistory(await fetchInterviewHistory(auth?.token))
      } catch (requestError) {
        if (handleUnauthorizedApiError(requestError)) {
          return
        }

        setHistory([])
      } finally {
        setHistoryLoading(false)
      }
    }

    loadHistory()
  }, [auth?.token])

  const submitInterview = async () => {
    if (submitInFlightRef.current || !questions.length) {
      return
    }

    submitInFlightRef.current = true
    setIsSubmitting(true)
    setError('')

    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/interview/submit',
        {
          sessionId,
          answers,
          questions,
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token || ''}`,
          },
        }
      )

      setResult(normalizeAttempt(data))
      setView('result')
      setHistory(await fetchInterviewHistory(auth?.token))
    } catch (requestError) {
      if (handleUnauthorizedApiError(requestError)) {
        return
      }

      setError(GENERIC_ERROR_MESSAGE)
      submitInFlightRef.current = false
    } finally {
      setIsSubmitting(false)
    }
  }

  const completeCurrentSection = () => {
    if (!activeSection) {
      return
    }

    if (currentSection >= sections.length - 1) {
      submitInterview()
      return
    }

    setCurrentSection((current) => current + 1)
    setCurrentQuestionIndex(0)
  }

  const advanceSectionFromTimer = useEffectEvent(() => {
    completeCurrentSection()
  })

  useEffect(() => {
    if (view !== 'active' || isSubmitting || activeSection?.type !== 'mcq') {
      return
    }

    if (sectionSecondsLeft <= 0) {
      advanceSectionFromTimer()
      return
    }

    const timer = window.setTimeout(() => {
      setSectionTimeRemaining((current) => ({
        ...current,
        [activeSection.key]: Math.max(
          (current[activeSection.key] ?? activeSection.timeLimitSeconds ?? 0) - 1,
          0
        ),
      }))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [
    activeSection,
    currentSection,
    isSubmitting,
    sectionSecondsLeft,
    sections.length,
    view,
  ])

  const handleStartInterview = async () => {
    if (isStarting) {
      return
    }

    try {
      setIsStarting(true)
      setError('')

      const { data } = await axios.post(
        'http://localhost:5000/api/interview/start',
        {
          difficulty,
          role: role.trim() || 'Software Engineer',
          resumeData: resumeData || null,
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token || ''}`,
          },
        }
      )

      const nextSections =
        Array.isArray(data.sections) && data.sections.length
          ? data.sections
          : INTERVIEW_SECTIONS
      const nextQuestions = Array.isArray(data.questions) ? data.questions : []

      submitInFlightRef.current = false
      setSessionId(data.sessionId || '')
      setSections(nextSections)
      setQuestions(nextQuestions)
      setAnswers({})
      setLockedTextAnswers({})
      setCurrentSection(0)
      setCurrentQuestionIndex(0)
      setSectionTimeRemaining(createTimerState(nextSections))
      setResult(null)
      setView('active')
    } catch (requestError) {
      if (handleUnauthorizedApiError(requestError)) {
        return
      }

      setError(GENERIC_ERROR_MESSAGE)
    } finally {
      setIsStarting(false)
    }
  }

  const handleUpdateRoadmap = async () => {
    try {
      setIsGeneratingRoadmap(true)
      setError('')

      const weakAreas = Array.isArray(result?.weakAreas) ? result.weakAreas : []

      const { data } = await axios.post(
        'http://localhost:5000/api/roadmap/generate',
        {
          weakAreas: weakAreas.length ? weakAreas : ['revision'],
          role: role.trim() || 'Software Engineer',
          resumeData: resumeData || null,
        }
      )

      writeRoadmap({
        ...data,
        role: role.trim() || 'Software Engineer',
        weakAreas,
        date: result?.date || new Date().toISOString(),
      })
      resetRoadmapProgress()
      navigate('/roadmap')
    } catch (requestError) {
      if (handleUnauthorizedApiError(requestError)) {
        return
      }

      setError(GENERIC_ERROR_MESSAGE)
    } finally {
      setIsGeneratingRoadmap(false)
    }
  }

  const handleAnswerChange = (value) => {
    if (
      currentQuestion?.type === 'text' &&
      lockedTextAnswers[absoluteQuestionIndex]
    ) {
      return
    }

    setAnswers((current) => ({
      ...current,
      [absoluteQuestionIndex]: value,
    }))
  }

  const handleNextQuestion = () => {
    if (!activeSection || isSubmitting) {
      return
    }

    setError('')

    if (activeSection.type === 'text') {
      setLockedTextAnswers((current) => ({
        ...current,
        [absoluteQuestionIndex]: true,
      }))
    }

    if (currentQuestionIndex < activeSection.count - 1) {
      setCurrentQuestionIndex((current) => current + 1)
      return
    }

    completeCurrentSection()
  }

  const handlePreviousQuestion = () => {
    if (activeSection?.type !== 'mcq' || currentQuestionIndex === 0 || isSubmitting) {
      return
    }

    setCurrentQuestionIndex((current) => Math.max(current - 1, 0))
  }

  if (view === 'active') {
    return (
      <ActiveInterview
        answers={answers}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        error={error}
        isSubmitting={isSubmitting}
        onAnswerChange={handleAnswerChange}
        onNext={handleNextQuestion}
        onPrevious={handlePreviousQuestion}
        onSubmit={submitInterview}
        sectionIndex={currentSection}
        sectionQuestionCount={activeSection?.count || 0}
        sectionSecondsLeft={sectionSecondsLeft}
        sections={sections}
        totalQuestions={totalQuestions}
      />
    )
  }

  if (view === 'result' && result) {
    return (
      <ResultView
        error={error}
        isGeneratingRoadmap={isGeneratingRoadmap}
        onUpdateRoadmap={handleUpdateRoadmap}
        onViewRoadmap={() => navigate('/roadmap')}
        result={result}
      />
    )
  }

  return (
    <StartView
      difficulty={difficulty}
      error={error}
      history={history}
      historyLoading={historyLoading}
      isStarting={isStarting}
      onDifficultyChange={setDifficulty}
      onRoleChange={setRole}
      onStart={handleStartInterview}
      role={role}
      totalQuestions={totalQuestions}
    />
  )
}

export default InterviewPage
