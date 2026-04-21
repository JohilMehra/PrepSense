const resumeStorageKey = 'resumeData'

export function readStoredResume() {
  try {
    const value = localStorage.getItem(resumeStorageKey)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function writeStoredResume(resumeData) {
  localStorage.setItem(resumeStorageKey, JSON.stringify(resumeData))
}

export function clearStoredResume() {
  localStorage.removeItem(resumeStorageKey)
}

export function normalizeResumeData(resumeData) {
  if (!resumeData || typeof resumeData !== 'object' || Array.isArray(resumeData)) {
    return null
  }

  return {
    skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
    projects: Array.isArray(resumeData.projects) ? resumeData.projects : [],
    education: Array.isArray(resumeData.education) ? resumeData.education : [],
    summary: typeof resumeData.summary === 'string' ? resumeData.summary : '',
  }
}
