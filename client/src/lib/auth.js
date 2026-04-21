export const authStorageKey = 'prepsense_auth'
export const expiredSessionMessage = 'Session expired. Please login again.'

export function readStoredAuth() {
  try {
    const storedAuth = localStorage.getItem(authStorageKey)
    return storedAuth ? JSON.parse(storedAuth) : null
  } catch {
    return null
  }
}

export function getStoredToken() {
  return readStoredAuth()?.token || localStorage.getItem('token') || ''
}

export function clearStoredAuth() {
  localStorage.removeItem(authStorageKey)
  localStorage.removeItem('token')
}

export function redirectToLogin({ withMessage = true } = {}) {
  clearStoredAuth()

  if (withMessage) {
    sessionStorage.setItem('auth_notice', expiredSessionMessage)
  } else {
    sessionStorage.removeItem('auth_notice')
  }

  window.location.href = '/login'
}

export function consumeAuthNotice() {
  const message = sessionStorage.getItem('auth_notice') || ''
  sessionStorage.removeItem('auth_notice')
  return message
}

export function handleUnauthorizedApiError(error) {
  if (error?.response?.status === 401) {
    redirectToLogin()
    return true
  }

  return false
}
