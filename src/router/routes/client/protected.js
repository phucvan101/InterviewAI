export const clientProtectedRoutes = [
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: 'Bảng điều khiển', requiresAuth: true },
    },
]