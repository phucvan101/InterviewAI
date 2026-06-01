<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import LayoutDefaultAdmin from '../layouts/LayoutDefaultAdmin.vue'
import {
    Search, RefreshCw, ChevronLeft, ChevronRight,
    TrendingUp, Radio, CheckCircle2, BarChart2,
    Calendar, Eye, Edit3, Trash2
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { use } from 'react'
import { ElNotification } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// ─── Types ───────────────────────────────────────────────────────────────────
interface Candidate {
    id: number
    username: string
    email: string
    avatar?: string
}

interface Session {
    id: number
    candidate: Candidate
    job_position: string
    company_name: string
    tech_stack?: string
    level?: string
    created_at: string
    duration: string
    status: 'active' | 'completed' | 'paused'
    score?: number | null
}

// ─── State ───────────────────────────────────────────────────────────────────
const sessions = ref<Session[]>([])
const loading = ref(false)
const totalCount = ref(0)

const stats = ref({
    total: 0,
    active: 0,
    completed: 0,
    avgScore: 0
})

const filter = ref({
    page: 1,
    page_size: 10,
    username: '',
    status: '',
    created_at: '',
    job_position: '',
    company_name: '',
})

const pagination = ref({
    current_page: 1,
    total_pages: 1,
})

// ─── Computed ─────────────────────────────────────────────────────────────────
const visiblePages = computed(() => {
    const total = pagination.value.total_pages
    const cur = pagination.value.current_page
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
    if (cur <= 3) return [1, 2, 3, '...', total]
    if (cur >= total - 2) return [1, '...', total - 2, total - 1, total]
    return [1, '...', cur - 1, cur, cur + 1, '...', total]
})

const rangeStart = computed(() => (pagination.value.current_page - 1) * filter.value.page_size + 1)
const rangeEnd = computed(() => Math.min(pagination.value.current_page * filter.value.page_size, totalCount.value))

function toQueryString(params = {}) {
    const query = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return
        query.append(key, String(value))
    })

    const queryString = query.toString()
    return queryString ? `?${queryString}` : ''
}

// ─── Methods ──────────────────────────────────────────────────────────────────
async function fetchSessions() {
    loading.value = true
    try {
        const params: Record<string, any> = {
            page: filter.value.page,
            page_size: filter.value.page_size,
        }
        if (filter.value.username) params.username = filter.value.username
        if (filter.value.job_position) params.job_position = filter.value.job_position
        if (filter.value.company_name) params.company_name = filter.value.company_name
        if (filter.value.status) params.status = filter.value.status
        if (filter.value.created_at) params.created_at = filter.value.created_at

        console.log('params', params)

        const res = await authStore.authorizedRequest(`/api/v1/admin/sessions/${toQueryString(params)}`)

        sessions.value = res.items
        totalCount.value = res.count ?? res.data?.count ?? 0

        pagination.value.current_page = filter.value.page
        pagination.value.total_pages = Math.ceil(totalCount.value / filter.value.page_size)

        stats.value.total = res.stats.total_sessions
        stats.value.active = res.stats.active_sessions
        stats.value.completed = res.stats.completed_sessions
        stats.value.avgScore = res.stats.average_score
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

function goToPage(page: number | string) {
    if (typeof page !== 'number') return
    if (page < 1 || page > pagination.value.total_pages) return
    filter.value.page = page
    fetchSessions()
}

function handleRefresh() {
    filter.value.page = 1
    fetchSessions()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
}

function getAvatarColor(name: string) {
    const colors = [
        'from-violet-500 to-purple-600',
        'from-pink-500 to-rose-600',
        'from-blue-500 to-cyan-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
    ]
    let hash = 0
    for (const c of name) hash += c.charCodeAt(0)
    return colors[hash % colors.length]
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

function getScoreColor(score: number) {
    if (score >= 90) return 'text-emerald-400'
    if (score >= 70) return 'text-blue-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-rose-400'
}

function getScoreBarColor(score: number) {
    if (score >= 90) return 'bg-emerald-400'
    if (score >= 70) return 'bg-blue-400'
    if (score >= 50) return 'bg-amber-400'
    return 'bg-rose-400'
}

async function handleDeleteSession(id: Number) {
    try {
        await authStore.authorizedRequest(`/api/v1/admin/sessions/${id}`, {
            method: 'DELETE'
        })
        ElNotification.success({
            title: 'Success',
            message: 'Đã xóa phiên phỏng vấn thành công!',
        })
        fetchSessions()
    } catch (error) {
        console.error('Error deleting session:', error)
    }
}

function handleDetailSession(id: Number) {
    router.push(`/admin/sessions/${id}`)
}

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(() => filter.value.status, () => {
    filter.value.page = 1
    fetchSessions()
})

onMounted(fetchSessions)
</script>

<template>
    <LayoutDefaultAdmin>
        <div class="min-h-screen bg-[#0d0f1a] text-white px-6 py-8 font-sans">

            <!-- ── Stats Cards ─────────────────────────────────────── -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div
                    class="relative bg-[#141627] rounded-2xl p-5 border border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-300">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <BarChart2 class="w-4 h-4 text-blue-400" />
                        </div>
                        <span
                            class="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                            <TrendingUp class="w-3 h-3" /> +12%
                        </span>
                    </div>
                    <p class="text-xs text-white/40 uppercase tracking-widest mb-1">Tổng phiên</p>
                    <p class="text-3xl font-bold tracking-tight">{{ stats.total }}</p>
                </div>

                <div
                    class="relative bg-[#141627] rounded-2xl p-5 border border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-300">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <Radio class="w-4 h-4 text-violet-400" />
                        </div>
                        <span
                            class="flex items-center gap-1.5 text-xs font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                            <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                            LIVE
                        </span>
                    </div>
                    <p class="text-xs text-white/40 uppercase tracking-widest mb-1">Đang diễn ra</p>
                    <p class="text-3xl font-bold tracking-tight">{{ stats.active }}</p>
                </div>

                <div
                    class="relative bg-[#141627] rounded-2xl p-5 border border-violet-500/20 overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
                    <div class="absolute inset-0 bg-gradient-to-br from-violet-600/8 to-transparent" />
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
                            <CheckCircle2 class="w-4 h-4 text-violet-300" />
                        </div>
                    </div>
                    <p class="text-xs text-white/40 uppercase tracking-widest mb-1">Đã hoàn thành</p>
                    <p class="text-3xl font-bold tracking-tight">{{ stats.completed.toLocaleString() }}</p>
                </div>

                <div
                    class="relative bg-[#141627] rounded-2xl p-5 border border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-300">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-pink-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center">
                            <TrendingUp class="w-4 h-4 text-pink-400" />
                        </div>
                        <div class="h-1 w-16 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full mt-2" />
                    </div>
                    <p class="text-xs text-white/40 uppercase tracking-widest mb-1">Điểm TB</p>
                    <p class="text-3xl font-bold tracking-tight">
                        {{ stats.avgScore }}<span class="text-base text-white/30 font-normal">/100</span>
                    </p>
                </div>
            </div>

            <!-- ── Table Panel ─────────────────────────────────────── -->
            <div class="bg-[#141627] rounded-2xl border border-white/5 overflow-hidden">

                <!-- Toolbar -->
                <div class="flex flex-wrap items-center gap-3 p-5 border-b border-white/5">
                    <div class="relative flex-1 min-w-52">
                        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input v-model="filter.username" @keyup.enter="handleRefresh" type="text"
                            placeholder="Tìm tên ứng viên..."
                            class="w-full bg-white/5 border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all" />
                    </div>

                    <div class="relative">
                        <select v-model="filter.status"
                            class="appearance-none bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 pr-9 text-sm text-white/80 focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer">
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Đang diễn ra</option>
                            <option value="completed">Đã xong</option>
                        </select>
                        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    <div class="relative">
                        <Calendar class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input v-model="filter.created_at" type="date" placeholder="Thời gian"
                            class="bg-white/5 border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all w-44" />
                    </div>


                    <button @click="handleRefresh" :class="loading ? 'animate-spin' : ''"
                        class="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/8 rounded-xl hover:bg-white/10 hover:border-white/15 transition-all text-white/50 hover:text-white/80">
                        <RefreshCw class="w-4 h-4" />
                    </button>
                </div>

                <!-- Table header -->
                <div
                    class="grid grid-cols-[2fr_1.8fr_1.2fr_1fr_1.5fr_1fr] gap-4 px-6 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest border-b border-white/5">
                    <span>Ứng viên</span>
                    <span>Vị trí</span>
                    <span>Thời gian</span>
                    <span>Trạng thái</span>
                    <span>Điểm số</span>
                    <span class="text-right">Thao tác</span>
                </div>

                <!-- Loading skeleton -->
                <template v-if="loading">
                    <div v-for="i in filter.page_size" :key="i"
                        class="grid grid-cols-[2fr_1.8fr_1.2fr_1fr_1.5fr_1fr] gap-4 px-6 py-5 border-b border-white/5 animate-pulse">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-white/8" />
                            <div class="space-y-1.5">
                                <div class="h-3 w-28 bg-white/8 rounded-md" />
                                <div class="h-2.5 w-36 bg-white/5 rounded-md" />
                            </div>
                        </div>
                        <div class="space-y-1.5 self-center">
                            <div class="h-3 w-32 bg-white/8 rounded-md" />
                            <div class="h-2.5 w-24 bg-white/5 rounded-md" />
                        </div>
                        <div class="h-3 w-24 bg-white/8 rounded-md self-center" />
                        <div class="h-6 w-20 bg-white/8 rounded-full self-center" />
                        <div class="h-3 w-20 bg-white/8 rounded-md self-center" />
                        <div class="h-3 w-16 bg-white/8 rounded-md self-center ml-auto" />
                    </div>
                </template>

                <!-- Rows -->
                <template v-else>
                    <div v-for="session in sessions" :key="session.id"
                        class="grid grid-cols-[2fr_1.8fr_1.2fr_1fr_1.5fr_1fr] gap-4 px-6 py-5 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors group">
                        <div class="flex items-center gap-3 min-w-0">
                            <div
                                :class="`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(session.candidate.username)} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ring-2 ring-white/5`">
                                {{ getInitials(session.candidate.username) }}
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-semibold text-white truncate">{{ session.candidate.username }}
                                </p>
                                <p class="text-xs text-white/35 truncate">{{ session.candidate.email }}</p>
                            </div>
                        </div>

                        <div class="self-center min-w-0">
                            <p class="text-sm font-semibold text-white/90 leading-snug">{{ session.job_position }}</p>
                            <p v-if="session.tech_stack" class="text-xs text-white/35 mt-0.5">Tech Stack: {{
                                session.tech_stack }}</p>
                            <p v-else-if="session.level" class="text-xs text-white/35 mt-0.5">Lvl: {{ session.level }}
                            </p>
                        </div>

                        <div class="self-center">
                            <p class="text-sm text-white/70">{{ formatDate(session.created_at) }}</p>
                            <p class="text-xs text-white/35 mt-0.5">{{ session.duration }}</p>
                        </div>

                        <div class="self-center">
                            <span v-if="session.status === 'active'"
                                class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                                <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                Đang diễn ra
                            </span>
                            <span v-else-if="session.status === 'completed'"
                                class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                                Đã xong
                            </span>
                        </div>

                        <div class="self-center">
                            <template v-if="session.status === 'active'">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm text-white/30 font-medium">-/100</span>
                                    <div class="h-1 flex-1 max-w-16 bg-white/8 rounded-full" />
                                </div>
                            </template>
                            <template v-else-if="session.score !== null && session.score !== undefined">
                                <div class="flex items-center gap-2">
                                    <span :class="`text-sm font-bold ${getScoreColor(session.score)}`">
                                        {{ session.score }}<span class="text-white/30 font-normal text-xs">/100</span>
                                    </span>
                                    <div class="h-1 flex-1 max-w-16 bg-white/8 rounded-full overflow-hidden">
                                        <div :class="`h-full rounded-full ${getScoreBarColor(session.score)}`"
                                            :style="{ width: `${session.score}%` }" />
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <span class="text-sm text-white/25 italic">N/A</span>
                            </template>
                        </div>

                        <div
                            class="self-center flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-white/40 hover:text-white/80 transition-all"
                                @click="handleDetailSession(session.id)">
                                <Eye class="w-3.5 h-3.5" />
                            </button>
                            <!-- <button
                                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-white/40 hover:text-white/80 transition-all">
                                <Edit3 class="w-3.5 h-3.5" />
                            </button> -->
                            <button v-if="authStore.hasPermission('sessions.delete')"
                                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-white/40 hover:text-rose-400 transition-all"
                                @click="handleDeleteSession(session.id)">
                                <Trash2 class="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </template>

                <!-- Empty state -->
                <div v-if="!loading && sessions.length === 0" class="py-16 text-center">
                    <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <Search class="w-5 h-5 text-white/20" />
                    </div>
                    <p class="text-white/30 text-sm">Không tìm thấy phiên phỏng vấn nào</p>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between px-6 py-4 border-t border-white/5">
                    <p class="text-xs text-white/30">
                        Đang hiển thị
                        <span class="text-white/60 font-medium">{{ rangeStart }} - {{ rangeEnd }}</span>
                        của <span class="text-white/60 font-medium">{{ totalCount.toLocaleString() }}</span> phiên
                    </p>

                    <div class="flex items-center gap-1">
                        <button @click="goToPage(pagination.current_page - 1)" :disabled="pagination.current_page === 1"
                            class="w-8 h-8 flex items-center justify-center rounded-lg border border-white/8 text-white/40 hover:text-white/80 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            <ChevronLeft class="w-4 h-4" />
                        </button>

                        <template v-for="page in visiblePages" :key="page">
                            <button v-if="page !== '...'" @click="goToPage(page as number)" :class="[
                                'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all',
                                pagination.current_page === page
                                    ? 'bg-violet-600 text-white border border-violet-500/50'
                                    : 'border border-white/8 text-white/50 hover:text-white/80 hover:bg-white/5'
                            ]">
                                {{ page }}
                            </button>
                            <span v-else
                                class="w-8 h-8 flex items-center justify-center text-xs text-white/25">...</span>
                        </template>

                        <button @click="goToPage(pagination.current_page + 1)"
                            :disabled="pagination.current_page === pagination.total_pages"
                            class="w-8 h-8 flex items-center justify-center rounded-lg border border-white/8 text-white/40 hover:text-white/80 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            <ChevronRight class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </LayoutDefaultAdmin>
</template>
