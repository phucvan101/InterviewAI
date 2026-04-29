export const adminUserRoutes = [
    {
        path: '/admin/user-management',
        name: 'admin-user-management',
        component: () => import('@/views/admin/userManagement/index.vue'),
        meta: { title: 'Quản lý người dùng', requiresAuth: true },
    },
]