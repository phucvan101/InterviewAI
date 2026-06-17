const ConversationLayout = () => import('@/views/conversation/index.vue')


export const clientConversationRoutes = [
    {
        path: '/conversation',
        name: 'conversation-history',
        component: ConversationLayout,
        meta: { title: 'Lịch sử phỏng vấn', requiresAuth: true },
    },
    {
        path: '/interview/:sessionId',
        name: 'interview-session',
        component: ConversationLayout,
        meta: { title: 'Phòng phỏng vấn', requiresAuth: true },
    },
]
