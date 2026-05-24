import { clientPublicRoutes } from './public'
import { clientAuthRoutes } from './auth'
import { clientProtectedRoutes } from './protected'
import { clientNotFoundRoute } from './notFound'
import { clientConversationRoutes } from './conversation'

export const clientRoutes = [
    clientPublicRoutes,
    ...clientAuthRoutes,
    ...clientProtectedRoutes,
    ...clientConversationRoutes,
    clientNotFoundRoute, // phải đặt cuối cùng
]