import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/* =========================
   Lazy-load Layouts
========================= */
const DefaultLayout = () => import('@/views/layouts/LayoutDefault.vue')
const AuthLayout = () => import('@/views/layouts/AuthLayout.vue')

/* =========================
   Lazy-load Views
========================= */
const HomeView = () => import('@/views/HomeView.vue')
const WebRTCView = () => import('@/views/WebRTCView.vue')
const SpeechView = () => import('@/views/SpeechView.vue')
const AboutView = () => import('@/views/AboutView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')
const LoginView = () => import('@/views/Login/LoginView.vue')

const routes = [
  /* =========================
     Default Layout (Landing)
  ========================= */
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: { title: 'Trang chủ' },
      },
      {
        path: 'webrtc',
        name: 'webrtc',
        component: WebRTCView,
        meta: { title: 'WebRTC Demo' },
      },
      {
        path: 'speech',
        name: 'speech',
        component: SpeechView,
        meta: { title: 'Web Speech API Demo' },
      },
      {
        path: 'about',
        name: 'about',
        component: AboutView,
        meta: { title: 'Giới thiệu' },
      },
    ],
  },

  /* =========================
     Auth Layout
  ========================= */
  {
    path: '/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: LoginView,
        meta: { title: 'Đăng nhập' },
      },
    ],
  },

  /* =========================
     404
  ========================= */
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: '404 - Không tìm thấy' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
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