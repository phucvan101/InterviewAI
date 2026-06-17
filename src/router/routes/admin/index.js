import { adminDashboardRoutes } from './dashboard'
import { adminUserRoutes } from './users'
import { adminPermissionRoutes } from './permission'
import { adminSessionRoutes } from './session'

// Thêm module admin mới vào đây
export const adminRoutes = [
    ...adminDashboardRoutes,
    ...adminUserRoutes,
    ...adminSessionRoutes,
    ...adminPermissionRoutes,
]