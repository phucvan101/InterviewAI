import { adminDashboardRoutes } from './dashboard'
import { adminUserRoutes } from './users'

// Thêm module admin mới vào đây
export const adminRoutes = [
    ...adminDashboardRoutes,
    ...adminUserRoutes,
]