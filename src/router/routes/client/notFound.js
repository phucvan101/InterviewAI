const NotFoundView = () => import('@/views/NotFoundView.vue')

export const clientNotFoundRoute = {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: '404 - Không tìm thấy' },
}