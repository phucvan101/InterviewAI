export const adminPermissionRoutes = [
    {
        path: '/admin/role-configuration',
        name: 'admin-role-configuration',
        component: () => import('@/views/admin/permissionManagement/index.vue'),
        meta: { title: 'Quản lý vai trò', requiresAuth: true },
    },
    {
        path: '/admin/role-configuration/create',
        name: 'admin-role-configuration-create',
        component: () => import('@/views/admin/permissionManagement/createRole.vue'),
        meta: { title: 'Tạo vai trò mới', requiresAuth: true },
    },
    {
        path: '/admin/role-configuration/edit/:id',
        name: 'admin-role-configuration-edit',
        component: () => import('@/views/admin/permissionManagement/editRole.vue'),
        meta: { title: 'Chỉnh sửa vai trò', requiresAuth: true },
    }
]