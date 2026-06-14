import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const ACCESS_TOKEN_KEY = 'access_token'
  const REFRESH_TOKEN_KEY = 'refresh_token'
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

  function buildUrl(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    if (!API_BASE_URL) {
      return normalizedPath
    }

    // Support both baseURL ".../api" and full path "/api/v1/..."
    if (API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api/')) {
      return `${API_BASE_URL.slice(0, -4)}${normalizedPath}`
    }

    return `${API_BASE_URL}${normalizedPath}`
  }

  function getErrorMessage(errorData, fallback = 'Có lỗi xảy ra, vui lòng thử lại.') {
    if (!errorData) return fallback

    if (typeof errorData === 'string') return errorData
    if (errorData.message && typeof errorData.message === 'string') return errorData.message
    if (errorData.error && typeof errorData.error === 'string') return errorData.error
    if (errorData.detail && typeof errorData.detail === 'string') return errorData.detail

    return fallback
  }

  function normalizeAuthData(payload) {
    const source = payload?.data ?? payload ?? {}

    return {
      accessToken:
        source.access_token ??
        source.accessToken ??
        source.token ??
        source.access ??
        null,
      refreshToken:
        source.refresh_token ??
        source.refreshToken ??
        source.refresh ??
        null,
      user:
        source.user ??
        source.profile ??
        null,
    }
  }

  function normalizePermissionCode(permission) {
    if (!permission) return ''
    if (typeof permission === 'string') return permission

    return (
      permission.code ??
      permission.name ??
      permission.permission_code ??
      permission.permissionCode ??
      ''
    )
  }

  function collectPermissionCodes(source, result = new Set()) {
    if (!source) return result

    if (Array.isArray(source)) {
      source.forEach((item) => collectPermissionCodes(item, result))
      return result
    }

    if (typeof source === 'string') {
      result.add(source)
      return result
    }

    const directCode = normalizePermissionCode(source)
    if (directCode) result.add(directCode)

    collectPermissionCodes(source.permissions, result)
    collectPermissionCodes(source.permission_codes, result)
    collectPermissionCodes(source.permissionCodes, result)
    collectPermissionCodes(source.roles, result)
    collectPermissionCodes(source.role, result)

    return result
  }

  function isLockedAccount(userData) {
    if (!userData) return false

    const rawStatus = String(
      userData.status ??
      userData.account_status ??
      userData.accountStatus ??
      ''
    ).toLowerCase()

    return (
      userData.is_deleted === true ||
      userData.is_deleted === 1 ||
      userData.is_active === false ||
      userData.is_active === 0 ||
      ['inactive', 'deactivated', 'locked', 'suspended', 'disabled', 'blocked'].includes(rawStatus)
    )
  }

  function extractTokensFromParams(params) {
    if (!params) return null

    const accessToken =
      params.get('access_token') ??
      params.get('accessToken') ??
      params.get('token') ??
      params.get('access') ??
      null
    const refreshToken =
      params.get('refresh_token') ??
      params.get('refreshToken') ??
      params.get('refresh') ??
      null

    if (!accessToken && !refreshToken) return null

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  function extractAuthFromUrl(urlString) {
    if (!urlString) return null
    try {
      const url = new URL(urlString)
      const fromQuery = extractTokensFromParams(url.searchParams)
      if (fromQuery) return fromQuery

      if (url.hash) {
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
        return extractTokensFromParams(hashParams)
      }
    } catch {
      return null
    }

    return null
  }

  function parseAuthPayload(text) {
    if (!text) return null
    const trimmed = text.trim()
    if (!trimmed) return null
    try {
      return JSON.parse(trimmed)
    } catch {
      return null
    }
  }

  function openCenteredPopup(url, name = 'oauth', width = 520, height = 640) {
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2)
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2)
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`

    return window.open(url, name, features)
  }

  function getStoredAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('token') || null
  }

  function getStoredRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || null
  }

  function syncTokensFromStorage() {
    const storedAccessToken = getStoredAccessToken()
    const storedRefreshToken = getStoredRefreshToken()

    if (storedAccessToken && storedAccessToken !== token.value) {
      token.value = storedAccessToken
    }

    if (storedRefreshToken && storedRefreshToken !== refreshToken.value) {
      refreshToken.value = storedRefreshToken
    }

    return {
      accessToken: token.value,
      refreshToken: refreshToken.value,
    }
  }

  function waitForPopupResult(popup, options = {}) {
    const { timeoutMs = 2 * 60 * 1000, intervalMs = 500 } = options

    return new Promise((resolve, reject) => {
      const startedAt = Date.now()

      const timer = setInterval(() => {
        if (!popup) {
          clearInterval(timer)
          reject(new Error('Cửa sổ đăng nhập đã bị đóng.'))
          return
        }

        try {
          if (popup.closed) {
            clearInterval(timer)
            reject(new Error('Cửa sổ đăng nhập đã bị đóng.'))
            return
          }
        } catch {
          // COOP/COEP can block access while the popup is on a different origin.
          return
        }

        if (Date.now() - startedAt > timeoutMs) {
          clearInterval(timer)
          popup.close()
          reject(new Error('Đăng nhập quá thời gian chờ. Vui lòng thử lại.'))
          return
        }

        let sameOrigin = false
        try {
          sameOrigin = popup.location.origin === window.location.origin
        } catch {
          return
        }

        if (!sameOrigin) return

        let payload = null
        try {
          payload = extractAuthFromUrl(popup.location.href)
        } catch {
          payload = null
        }

        if (!payload) {
          const text = popup.document?.body?.textContent
          payload = parseAuthPayload(text)
        }

        if (payload) {
          clearInterval(timer)
          popup.close()
          resolve(payload)
        }
      }, intervalMs)
    })
  }

  function saveTokens(nextAccessToken, nextRefreshToken) {
    // Set ref trước
    token.value = nextAccessToken || null
    refreshToken.value = nextRefreshToken || null

    // Sau đó sync localStorage
    if (token.value) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token.value)
      localStorage.setItem('token', token.value)
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem('token')
    }

    if (refreshToken.value) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.value)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }

    // THÊM: verify ref đã update
    console.log('saveTokens - token.value after save:', token.value?.substring(0, 30))
  }

  async function request(path, options = {}) {
    const {
      method = 'GET',
      body,
      auth = false,
      retryOn401 = true,
      headers = {},
    } = options

    const requestHeaders = {
      ...headers,
    }

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

    if (body !== undefined && !isFormData) {
      requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json'
    }

    const currentTokens = auth
      ? syncTokensFromStorage()
      : { accessToken: token.value, refreshToken: refreshToken.value }

    if (auth && currentTokens.accessToken) {
      requestHeaders.Authorization = `Bearer ${currentTokens.accessToken}`
    }

    console.log('→ Request:', method, buildUrl(path))
    console.log('→ Headers being sent:', requestHeaders)

    try {
      const response = await axios({
        url: buildUrl(path),
        method,
        headers: requestHeaders,
        data: body,
      })

      return response.data ?? null
    } catch (err) {
      const status = err.response?.status
      const data = err.response?.data

      if (status === 401 && auth && retryOn401 && currentTokens.refreshToken) {
        await refreshAccessToken()
        return request(path, { ...options, retryOn401: false })
      }

      const error = new Error(getErrorMessage(data, err.message))
      error.status = status
      error.data = data
      throw error
    }
  }

  const user = ref(null)
  const token = ref(localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('token') || null)
  const refreshToken = ref(localStorage.getItem(REFRESH_TOKEN_KEY) || null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.full_name || user.value?.name || 'Guest')
  const isAccountLocked = computed(() => isLockedAccount(user.value))
  const canUseInterviewFeatures = computed(() => !isAccountLocked.value)
  const userPermissions = computed(() => {
    return Array.from(collectPermissionCodes(user.value))
  })

  const isSuperUser = computed(() => {
    return user.value?.is_superuser === true || user.value?.is_superuser === 1
  })

  function hasPermission(permissionCode) {
    if (!permissionCode) return true
    if (isSuperUser.value) return true

    return userPermissions.value.includes(permissionCode)
  }

  function hasAnyPermission(permissionCodes = []) {
    const codes = Array.isArray(permissionCodes) ? permissionCodes : [permissionCodes]
    const filteredCodes = codes.filter(Boolean)

    if (!filteredCodes.length) return true
    if (isSuperUser.value) return true

    return filteredCodes.some((permissionCode) => hasPermission(permissionCode))
  }

  function hasAllPermissions(permissionCodes = []) {
    const codes = Array.isArray(permissionCodes) ? permissionCodes : [permissionCodes]
    const filteredCodes = codes.filter(Boolean)

    if (!filteredCodes.length) return true
    if (isSuperUser.value) return true

    return filteredCodes.every((permissionCode) => hasPermission(permissionCode))
  }

  async function login(credentials) {
    loading.value = true
    try {
      const payload = {
        email: credentials.email,
        password: credentials.password,
      }

      const response = await request('/api/v1/users/login', {
        method: 'POST',
        body: payload,
      })

      const normalized = normalizeAuthData(response)
      if (!normalized.accessToken) {
        throw new Error('Đăng nhập thành công nhưng không nhận được access token.')
      }

      saveTokens(normalized.accessToken, normalized.refreshToken)
      if (normalized.user) {
        user.value = normalized.user
      }

      return response
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    loading.value = true
    try {
      const response = await request('/api/v1/users/register', {
        method: 'POST',
        body: payload,
      })

      const normalized = normalizeAuthData(response)
      if (normalized.accessToken || normalized.refreshToken) {
        saveTokens(normalized.accessToken, normalized.refreshToken)
      }
      if (normalized.user) {
        user.value = normalized.user
      }

      return response
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle(options = {}) {
    loading.value = true
    try {
      const { usePopup = true } = options
      const loginUrl = buildUrl('/api/v1/auth/google/login')

      if (!usePopup) {
        window.location.href = loginUrl
        return null
      }

      const popup = openCenteredPopup(loginUrl, 'google-oauth')
      if (!popup) {
        throw new Error('Trình duyệt đã chặn pop-up. Vui lòng cho phép pop-up để tiếp tục.')
      }

      const response = await waitForPopupResult(popup)
      const normalized = normalizeAuthData(response)

      if (!normalized.accessToken) {
        throw new Error('Đăng nhập Google thành công nhưng không nhận được access token.')
      }

      saveTokens(normalized.accessToken, normalized.refreshToken)
      if (normalized.user) {
        user.value = normalized.user
      }

      return response
    } finally {
      loading.value = false
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      throw new Error('Không có refresh token để làm mới phiên đăng nhập.')
    }

    const response = await request('/api/v1/users/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken.value },
      retryOn401: false,
    })

    // THÊM LOG
    console.log('Refresh response:', response)

    const normalized = normalizeAuthData(response)

    // THÊM LOG
    console.log('Normalized after refresh:', normalized)

    if (!normalized.accessToken) {
      throw new Error('Làm mới token thất bại do thiếu access token.')
    }

    saveTokens(normalized.accessToken, normalized.refreshToken || refreshToken.value)
    return normalized.accessToken
  }

  async function fetchProfile() {
    if (!token.value) return null
    loading.value = true
    try {
      const response = await request('/api/v1/users/me', {
        auth: true,
      })
      const profile = response?.data ?? response
      user.value = profile?.user ?? profile
      return user.value
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(payload) {
    const response = await request('/api/v1/users/me', {
      method: 'PATCH',
      auth: true,
      body: payload,
    })

    const profile = response?.data ?? response
    user.value = profile?.user ?? profile
    return user.value
  }

  async function changePassword(payload) {
    return request('/api/v1/users/me/password', {
      method: 'PATCH',
      auth: true,
      body: payload,
    })
  }

  async function forgotPassword(email) {
    return request('/api/v1/users/forgot-password', {
      method: 'POST',
      body: { email }
    })
  }

  async function authorizedRequest(path, options = {}) {
    return request(path, { ...options, auth: true })
  }

  async function authorizedBlobRequest(path, options = {}) {
    const {
      method = 'GET',
      body,
      retryOn401 = true,
      headers = {},
    } = options

    const currentTokens = syncTokensFromStorage()
    const requestHeaders = { ...headers }

    if (currentTokens.accessToken) {
      requestHeaders.Authorization = `Bearer ${currentTokens.accessToken}`
    }

    try {
      const response = await axios({
        url: buildUrl(path),
        method,
        headers: requestHeaders,
        data: body,
        responseType: 'blob',
      })

      return response.data
    } catch (err) {
      const status = err.response?.status

      if (status === 401 && retryOn401 && currentTokens.refreshToken) {
        await refreshAccessToken()
        return authorizedBlobRequest(path, { ...options, retryOn401: false })
      }

      const error = new Error(err.message || 'Không thể tải file.')
      error.status = status
      error.data = err.response?.data
      throw error
    }
  }

  async function authorizedStreamRequest(path, options = {}) {
    const {
      method = 'GET',
      body,
      retryOn401 = true,
      headers = {},
      signal,
    } = options

    const currentTokens = syncTokensFromStorage()
    const requestHeaders = { ...headers }
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
    let requestBody = body

    if (body !== undefined && !isFormData && !(body instanceof Blob)) {
      requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json'
      requestBody = typeof body === 'string' ? body : JSON.stringify(body)
    }

    if (currentTokens.accessToken) {
      requestHeaders.Authorization = `Bearer ${currentTokens.accessToken}`
    }

    const response = await fetch(buildUrl(path), {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal,
    })

    if (response.status === 401 && retryOn401 && currentTokens.refreshToken) {
      await refreshAccessToken()
      return authorizedStreamRequest(path, { ...options, retryOn401: false })
    }

    if (!response.ok) {
      let data = null
      try {
        const contentType = response.headers.get('content-type') || ''
        data = contentType.includes('application/json')
          ? await response.json()
          : await response.text()
      } catch (_) {
        data = null
      }

      const error = new Error(getErrorMessage(data, 'Không thể tải dữ liệu.'))
      error.status = response.status
      error.data = data
      throw error
    }

    return response
  }

  async function logout() {
    saveTokens(null, null)
    user.value = null
  }

  return {
    user,
    token,
    refreshToken,
    loading,
    isLoggedIn, userName,
    isAccountLocked,
    canUseInterviewFeatures,
    userPermissions,
    isSuperUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    login,
    register,
    loginWithGoogle,
    refreshAccessToken,
    fetchProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    authorizedRequest,
    authorizedBlobRequest,
    authorizedStreamRequest,
    logout,
  }
})
