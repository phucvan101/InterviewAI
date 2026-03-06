import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  function parseResponseBody(response) {
    return response
      .text()
      .then((text) => {
        if (!text) return null
        try {
          return JSON.parse(text)
        } catch {
          return { message: text }
        }
      })
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

  function saveTokens(nextAccessToken, nextRefreshToken) {
    token.value = nextAccessToken || null
    refreshToken.value = nextRefreshToken || null

    if (token.value) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token.value)
      localStorage.setItem('token', token.value) // Backward compatibility
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem('token')
    }

    if (refreshToken.value) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.value)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
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

    if (body !== undefined) {
      requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json'
    }

    if (auth && token.value) {
      requestHeaders.Authorization = `Bearer ${token.value}`
    }

    const response = await fetch(buildUrl(path), {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (response.status === 401 && auth && retryOn401 && refreshToken.value) {
      await refreshAccessToken()
      return request(path, { ...options, retryOn401: false })
    }

    const data = await parseResponseBody(response)

    if (!response.ok) {
      const error = new Error(getErrorMessage(data))
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  }

  const user = ref(null)
  const token = ref(localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('token') || null)
  const refreshToken = ref(localStorage.getItem(REFRESH_TOKEN_KEY) || null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.full_name || user.value?.name || 'Guest')

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

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      throw new Error('Không có refresh token để làm mới phiên đăng nhập.')
    }

    const response = await request('/api/v1/users/refresh', {
      method: 'POST',
      body: {
        refresh_token: refreshToken.value,
      },
      retryOn401: false,
    })

    const normalized = normalizeAuthData(response)
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

  async function authorizedRequest(path, options = {}) {
    return request(path, { ...options, auth: true })
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
    login,
    register,
    refreshAccessToken,
    fetchProfile,
    updateProfile,
    changePassword,
    authorizedRequest,
    logout,
  }
})
