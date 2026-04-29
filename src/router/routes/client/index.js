import { clientPublicRoutes } from './public'
import { clientAuthRoutes } from './auth'
import { clientProtectedRoutes } from './protected'
import { clientNotFoundRoute } from './notFound'

export const clientRoutes = [
    clientPublicRoutes,
    ...clientAuthRoutes,
    ...clientProtectedRoutes,
    clientNotFoundRoute, // phải đặt cuối cùng
]