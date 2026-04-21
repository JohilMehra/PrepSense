export const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard']
export const INTERVIEW_SECTIONS = [
  {
    key: 'fundamental',
    label: 'Fundamentals Round',
    type: 'mcq',
    count: 2,
    timeLimitSeconds: 10 * 60,
  },
  {
    key: 'coding',
    label: 'Coding Round',
    type: 'mcq',
    count: 6,
    timeLimitSeconds: 10 * 60,
  },
  {
    key: 'project',
    label: 'Project Round',
    type: 'text',
    count: 2,
    timeLimitSeconds: null,
  },
  {
    key: 'scenario',
    label: 'Scenario Round',
    type: 'text',
    count: 2,
    timeLimitSeconds: null,
  },
  {
    key: 'behavioral',
    label: 'Behavioral Round',
    type: 'text',
    count: 1,
    timeLimitSeconds: null,
  },
]

export const TOTAL_INTERVIEW_QUESTIONS = INTERVIEW_SECTIONS.reduce(
  (sum, section) => sum + section.count,
  0
)
export const TOTAL_INTERVIEW_SCORE = INTERVIEW_SECTIONS.reduce((sum, section) => {
  const questionScore = section.type === 'mcq' ? 10 : 10
  return sum + section.count * questionScore
}, 0)

export const sectionLabels = {
  fundamental: 'Fundamentals',
  coding: 'Coding',
  project: 'Project',
  scenario: 'Scenario',
  behavioral: 'Behavioral',
}

const historyDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatHistoryDate(value) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return historyDateFormatter.format(date)
}

export function normalizeAttempt(record) {
  if (!record || typeof record !== 'object') {
    return null
  }

  return {
    score: Number(record.score) || 0,
    total: Number(record.total) || TOTAL_INTERVIEW_SCORE,
    weakAreas: Array.isArray(record.weakAreas) ? record.weakAreas : [],
    improvedAreas: Array.isArray(record.improvedAreas) ? record.improvedAreas : [],
    sectionScores:
      record.sectionScores && typeof record.sectionScores === 'object'
        ? record.sectionScores
        : {},
    questionResults: Array.isArray(record.questionResults) ? record.questionResults : [],
    date: record.date || record.createdAt || '',
  }
}

export function getBestAttempt(history) {
  return history.reduce((best, record) => {
    if (!best) {
      return record
    }

    const bestRatio = best.total ? best.score / best.total : 0
    const currentRatio = record.total ? record.score / record.total : 0

    return currentRatio > bestRatio ? record : best
  }, null)
}

export function getMostFrequentWeakArea(history) {
  const counts = history.reduce((accumulator, record) => {
    record.weakAreas.forEach((area) => {
      accumulator[area] = (accumulator[area] || 0) + 1
    })

    return accumulator
  }, {})

  return (
    Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] ||
    ''
  )
}

export function formatAreaLabel(area) {
  return sectionLabels[area] || area || 'None'
}

export function joinWeakAreas(weakAreas) {
  if (!weakAreas?.length) {
    return 'None'
  }

  return weakAreas.map(formatAreaLabel).join(', ')
}

export function formatCountdown(totalSeconds) {
  if (typeof totalSeconds !== 'number' || totalSeconds < 0) {
    return '--:--'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function getSectionMeta(sections, sectionIndex) {
  return sections[sectionIndex] || null
}

export function getQuestionRangeForSection(sections, sectionIndex) {
  const safeIndex = Math.max(0, sectionIndex)
  const start = sections
    .slice(0, safeIndex)
    .reduce((sum, section) => sum + section.count, 0)
  const count = sections[safeIndex]?.count || 0

  return {
    start,
    end: start + count - 1,
  }
}

export function getSectionIndexForQuestion(sections, questionIndex) {
  let cursor = 0

  for (let index = 0; index < sections.length; index += 1) {
    const nextCursor = cursor + sections[index].count

    if (questionIndex >= cursor && questionIndex < nextCursor) {
      return index
    }

    cursor = nextCursor
  }

  return 0
}

export function getTotalQuestions(sections) {
  return (Array.isArray(sections) ? sections : INTERVIEW_SECTIONS).reduce(
    (sum, section) => sum + (Number(section?.count) || 0),
    0
  )
}

export function getAbsoluteQuestionIndex(sections, sectionIndex, questionIndex) {
  const range = getQuestionRangeForSection(sections, sectionIndex)
  return range.start + Math.max(0, questionIndex)
}
