export const clientProtectedRoutes = [
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: 'Bảng điều khiển', requiresAuth: true },
    },
    {
        path: '/analysis-reports',
        name: 'analysis-reports',
        component: () => import('@/views/anlysisReport/index.vue'),
        meta: { title: 'Báo cáo phân tích', requiresAuth: true },
    },
    {
        path: '/analysis-reports/:id',
        name: 'analysis-report-detail',
        component: () => import('@/views/anlysisReport/DetailReport.vue'),
        meta: { title: 'Chi tiết báo cáo phân tích', requiresAuth: true },
    }
]
