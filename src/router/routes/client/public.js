const DefaultLayout = () => import('@/views/layouts/LayoutDefault.vue')

const HomeView = () => import('@/views/HomeView.vue')
const WebRTCView = () => import('@/views/WebRTCView.vue')
const SpeechView = () => import('@/views/SpeechView.vue')
const AboutView = () => import('@/views/AboutView.vue')

export const clientPublicRoutes = {
    path: '/',
    component: DefaultLayout,
    children: [
        {
            path: '',
            name: 'home',
            component: HomeView,
            meta: { title: 'Trang chủ' },
        },
        {
            path: 'webrtc',
            name: 'webrtc',
            component: WebRTCView,
            meta: { title: 'WebRTC Demo' },
        },
        {
            path: 'speech',
            name: 'speech',
            component: SpeechView,
            meta: { title: 'Web Speech API Demo' },
        },
        {
            path: 'about',
            name: 'about',
            component: AboutView,
            meta: { title: 'Giới thiệu' },
        },
    ],
}