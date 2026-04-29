import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import { clientRoutes } from './routes/client/index'
import { adminRoutes } from './routes/admin/index'

/* =========================
   Router Instance
========================= */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...clientRoutes,
    ...adminRoutes,
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

/* =========================
   Global Navigation Guard
========================= */
router.beforeEach((to, from, next) => {
  // Update document title
  document.title = to.meta?.title
    ? `${to.meta.title} | AI Interview Prep`
    : 'AI Interview Prep'

  // Auth Guard
  if (to.meta?.requiresAuth) {
    const auth = useAuthStore()

    if (!auth.isLoggedIn) {
      return next({
        name: 'login',
        query: { redirect: to.fullPath },
      })
    }
  }

  next()
})

export default router