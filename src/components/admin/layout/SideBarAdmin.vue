<template>
    <aside class="flex flex-col w-[268px] flex-shrink-0 border-r"
        style="background:#0f1225; border-color:rgba(255,255,255,0.06);">

        <!-- Brand -->
        <div class="flex items-center gap-3 px-5 py-5 border-b" style="border-color:rgba(255,255,255,0.06);">
            <div class="flex items-center justify-center w-9 h-9 rounded-xl"
                style="background: linear-gradient(90deg, #4F46E5 0%, #06B6D4 100%); ">
                <img style="color: #fff;" src="@/assets/icon/sidebar/logo.svg" alt="Logo" />
            </div>
            <div>
                <div class="text-sm font-bold text-white leading-tight">Interview AI</div>
                <div class="text-[10px] font-medium" style="color:rgba(255,255,255,0.38);">Hệ thống luyện tập v2.0
                </div>
            </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <button v-for="item in visibleNavItems" :key="item.label"
                class="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                :style="route.path === item.route
                    ? 'background: #4F46E5; border: 1px solid rgba(79, 70, 229, 0.2); color:#fff;'
                    : 'color:rgba(255,255,255,0.5);'" @click="router.push(item.route)">
                <div class="w-[18px] h-[18px]" :style="{
                    WebkitMask: `url(${item.icon}) no-repeat center / contain`,
                    mask: `url(${item.icon}) no-repeat center / contain`,
                    backgroundColor: route.path === item.route ? '#fff' : '#94A3B8'
                }" />
                {{ item.label }}
            </button>

        </nav>

        <!-- User -->
        <div class="flex items-center gap-3 px-4 py-4 border-t" style="border-color:rgba(255,255,255,0.06);">
            <img :src="`https://i.pravatar.cc/40?u=${auth.user?.email || 'default'}`"
                class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            <div class="flex-1 min-w-0">
                <div class="text-[12.5px] font-semibold text-white truncate">{{ auth.userName }}</div>
                <div class="text-[10.5px] truncate" style="color:rgba(255,255,255,0.38);">{{ auth.user?.email || 'Khách'
                }}</div>
            </div>
            <button @click="handleLogout"
                class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                style="color:rgba(255,255,255,0.35);">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
            </button>
        </div>
    </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import icon_qlnd from '@/assets/icon/admin/dashboard/qlnd.svg'
import icon_cdht from '@/assets/icon/admin/dashboard/cdht.svg'
import icon_chq from '@/assets/icon/admin/dashboard/chq.svg'
import icon_ppv from '@/assets/icon/admin/dashboard/ppv.svg'
import icon_db from '@/assets/icon/admin/dashboard/db.svg'

const router = useRouter()
const route = useRoute()

// ── Navigation ───────────────────────────────────────────────────────────────
const navItems = ref([
    {
        label: 'Bảng điều khiển', active: true,
        icon: icon_db,
        route: '/admin/dashboard',
        permissions: [],
    },
    {
        label: 'Quản lý người dùng', active: false,
        icon: icon_qlnd,
        route: '/admin/user-management',
        permissions: ['users.read'],
    },
    {
        label: 'Phòng phỏng vấn', active: false,
        icon: icon_ppv,
        route: '/admin/interview-rooms',
        permissions: [],
    },
    {
        label: 'Cấu hình quyền', active: false,
        icon: icon_chq,
        route: '/admin/role-configuration',
        permissions: ['roles.read'],
    },
    {
        label: 'Cài đặt hệ thống', active: false,
        icon: icon_cdht,
        route: '/admin/system-settings',
        permissions: [],
    },
])

function setActiveNav(selected) {
    navItems.value.forEach(i => i.active = i === selected)
    const route = selected.route && selected.route.trim() !== '' ? selected.route : '/admin'
    router.push(route).catch(err => {
        // tránh lỗi khi navigation trùng lặp hoặc bị từ chối; in log nếu cần debug
        // console.debug('router push ignored:', err)
    })
}

const recentSessions = [
    { title: 'Vị trí PM Cấp cao', color: '#4ade80' },
    { title: 'Trưởng nhóm UX tại Google', color: '#fbbf24' },
]

// Auth store
const auth = useAuthStore();
const visibleNavItems = computed(() => {
    return navItems.value.filter((item) => auth.hasAnyPermission(item.permissions))
})

const handleLogout = () => {
    auth.logout()
    router.push('/')
}
</script>
