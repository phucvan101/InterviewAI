import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name || 'Guest')

  // Actions
  async function login(credentials) {
    loading.value = true
    try {
      // TODO: Replace with real API call
      // const res = await api.post('/auth/login', credentials)
      // token.value = res.data.token
      // user.value = res.data.user

      // Demo mock
      token.value = 'mock-token-123'
      user.value = { id: 1, name: credentials.email.split('@')[0], email: credentials.email }
      localStorage.setItem('token', token.value)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function fetchProfile() {
    if (!token.value) return
    loading.value = true
    try {
      // TODO: Replace with real API call
      user.value = { id: 1, name: 'Demo User', email: 'demo@example.com' }
    } finally {
      loading.value = false
    }
  }

  return {
    user, token, loading,
    isLoggedIn, userName,
    login, logout, fetchProfile,
  }
})
