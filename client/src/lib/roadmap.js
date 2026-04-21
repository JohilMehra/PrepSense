const roadmapStorageKey = 'roadmap'
const roadmapProgressStorageKey = 'roadmapProgress'

export function getRoadmapStorageKey() {
  return roadmapStorageKey
}

export function getRoadmapProgressStorageKey() {
  return roadmapProgressStorageKey
}

export function readStoredJson(key, fallbackValue) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallbackValue
  } catch {
    return fallbackValue
  }
}

export function readRoadmap() {
  return readStoredJson(roadmapStorageKey, null)
}

export function readRoadmapProgress() {
  return readStoredJson(roadmapProgressStorageKey, {})
}

export function writeRoadmap(roadmap) {
  localStorage.setItem(roadmapStorageKey, JSON.stringify(roadmap))
}

export function writeRoadmapProgress(progress) {
  localStorage.setItem(roadmapProgressStorageKey, JSON.stringify(progress))
}

export function resetRoadmapProgress() {
  localStorage.removeItem(roadmapProgressStorageKey)
}
