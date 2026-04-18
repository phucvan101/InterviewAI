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
            <button v-for="item in navItems" :key="item.label"
                class="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                :style="item.active
                    ? 'background: #4F46E5;border: 1px solid rgba(79, 70, 229, 0.2); border-radius: 10px; color:#fff;'
                    : 'color:rgba(255,255,255,0.5);'"
                @mouseenter="!item.active && ($event.currentTarget.style.background = 'rgba(255,255,255,0.05)', $event.currentTarget.style.color = 'rgba(255,255,255,0.85)')"
                @mouseleave="!item.active && ($event.currentTarget.style.background = '', $event.currentTarget.style.color = 'rgba(255,255,255,0.5)')"
                @click="setActiveNav(item)">
                <span v-html="item.icon" class="w-[18px] h-[18px] flex-shrink-0" />
                {{ item.label }}
            </button>

            <!-- Recent sessions -->
            <div class="pt-4 pb-1 px-1">
                <div class="text-[10px] font-bold uppercase tracking-widest mb-3" style="color:rgba(255,255,255,0.25);">
                    Phiên gần đây</div>
                <div v-for="s in recentSessions" :key="s.title"
                    class="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer group transition-colors duration-150"
                    style="color:rgba(255,255,255,0.5);"
                    @mouseenter="$event.currentTarget.style.color = 'rgba(255,255,255,0.8)'"
                    @mouseleave="$event.currentTarget.style.color = 'rgba(255,255,255,0.5)'">
                    <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: s.color }" />
                    <span class="text-[12.5px] truncate">{{ s.title }}</span>
                </div>
            </div>
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
import { useRouter } from 'vue-router'

const router = useRouter()

// ── Navigation ───────────────────────────────────────────────────────────────
const navItems = ref([
    {
        label: 'Bảng điều khiển', active: true,
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    },
    {
        label: 'Kho kiến thức', active: false,
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/></svg>`,
    },
    {
        label: 'Phòng phỏng vấn', active: false,
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>`,
    },
    {
        label: 'Báo cáo', active: false,
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>`,
    },
])

function setActiveNav(selected) {
    navItems.value.forEach(i => i.active = i === selected)
}

const recentSessions = [
    { title: 'Vị trí PM Cấp cao', color: '#4ade80' },
    { title: 'Trưởng nhóm UX tại Google', color: '#fbbf24' },
]

// Auth store
const auth = useAuthStore();
console.log('user', auth.user);
const handleLogout = () => {
    auth.logout()
    router.push('/')
}
</script>