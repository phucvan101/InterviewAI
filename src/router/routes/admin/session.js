export const adminSessionRoutes = [
    {
        path: '/admin/sessions',
        name: 'admin-session-management',
        component: () => import('@/views/admin/sessionManagement/index.vue'),
        meta: { title: 'Quản lý phiên', requiresAuth: true },
    },

    {
        path: '/admin/sessions/:id',
        name: 'admin-session-detail',
        component: () => import('@/views/admin/sessionManagement/detail.vue'),
        meta: { title: 'Chi tiết phiên', requiresAuth: true },
    }
]