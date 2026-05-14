import { adminDashboardRoutes } from './dashboard'
import { adminUserRoutes } from './users'
import { adminPermissionRoutes } from './permission'

// Thêm module admin mới vào đây
export const adminRoutes = [
    ...adminDashboardRoutes,
    ...adminUserRoutes,
    ...adminPermissionRoutes,
]