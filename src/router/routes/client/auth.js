const AuthLayout = () => import('@/views/layouts/AuthLayout.vue')
const LoginView = () => import('@/views/Login/LoginView.vue')
const AuthCallbackView = () => import('@/views/Login/AuthCallbackView.vue')

export const clientAuthRoutes = [
    {
        path: '/login',
        component: AuthLayout,
        children: [
            {
                path: '',
                name: 'login',
                component: LoginView,
                meta: { title: 'Đăng nhập' },
            },
        ],
    },
    {
        path: '/auth/callback',
        component: AuthCallbackView,
    },
]