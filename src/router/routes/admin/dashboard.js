export const adminDashboardRoutes = [
    {
        path: '/admin/dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/dashboard/index.vue'),
        meta: { title: 'Bảng điều khiển Admin', requiresAuth: true },
    },
]