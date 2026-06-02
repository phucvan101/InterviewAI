<template>
    <LayoutDefaultAdmin>
        <div class="min-h-screen bg-[#06080f] px-5 py-8 text-white sm:px-8 lg:px-10">

            <!-- Hero -->
            <section class="dashboard-hero mb-8 overflow-hidden rounded-[32px] px-8 py-10 sm:px-12">
                <div class="relative z-10 max-w-2xl">
                    <div
                        class="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1">
                        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400"></span>
                        <p class="text-xs font-semibold uppercase tracking-widest text-violet-300">Admin overview</p>
                    </div>
                    <h1 class="text-3xl font-black leading-tight text-white sm:text-4xl">
                        Dashboard
                    </h1>
                    <p class="mt-3 text-base leading-relaxed text-slate-400">
                        Hệ thống đã ghi nhận
                        <span class="font-bold text-violet-300">{{ formatNumber(stats.totalInterviews) }}</span>
                        lượt phỏng vấn, tỉ lệ hoàn thành hiện tại là
                        <span class="font-bold text-violet-300">{{ formatPercent(stats.successRate) }}</span>.
                    </p>
                </div>
            </section>

            <!-- Error -->
            <div v-if="error"
                class="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/8 px-5 py-4 text-sm text-rose-300">
                <AlertCircle class="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                {{ error }}
            </div>

            <!-- Stat Cards -->
            <section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article v-for="card in statCards" :key="card.label" class="stat-card rounded-[24px] p-6">
                    <div class="mb-5 flex items-start justify-between">
                        <div class="flex h-11 w-11 items-center justify-center rounded-xl" :class="card.iconBg">
                            <component :is="card.icon" class="h-5 w-5" :class="card.iconColor" />
                        </div>
                        <span v-if="card.badge" class="rounded-lg px-2.5 py-1 text-xs font-bold"
                            :class="card.badgeClass">
                            {{ card.badge }}
                        </span>
                    </div>
                    <p class="text-xs font-bold uppercase tracking-widest text-slate-500">{{ card.label }}</p>
                    <div class="mt-2 flex items-baseline gap-1.5">
                        <strong class="text-[2.4rem] font-black leading-none tracking-tight text-white">{{ card.value
                            }}</strong>
                        <span v-if="card.suffix" class="text-base font-semibold text-slate-500">{{ card.suffix }}</span>
                    </div>
                </article>
            </section>

            <!-- Main Content -->
            <section class="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">

                <!-- Chart -->
                <article class="content-card rounded-[28px] p-6 sm:p-8">
                    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 class="text-xl font-black text-white">Hoạt động phỏng vấn</h2>
                            <p class="mt-1 text-sm text-slate-500">Xu hướng số lượng phỏng vấn theo thời gian</p>
                        </div>
                        <div class="inline-flex shrink-0 rounded-xl bg-white/[0.04] p-1">
                            <button v-for="option in rangeOptions" :key="option.value" type="button"
                                class="rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-150" :class="activityRange === option.value
                                    ? 'bg-violet-500/25 text-violet-200 shadow-inner'
                                    : 'text-slate-500 hover:text-slate-300'" @click="setActivityRange(option.value)">
                                {{ option.label }}
                            </button>
                        </div>
                    </div>

                    <div class="relative min-h-[360px]">
                        <div v-show="!loading && hasActivityData" ref="chartRef" class="h-[360px] w-full"></div>
                        <div v-if="loading"
                            class="absolute inset-0 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                            <Loader2 class="h-4 w-4 animate-spin" />
                            Đang tải dữ liệu...
                        </div>
                        <div v-else-if="!hasActivityData"
                            class="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/8">
                            <BarChart3 class="h-8 w-8 text-slate-600" />
                            <p class="text-sm font-semibold text-slate-500">Chưa có dữ liệu cho khoảng thời gian này</p>
                        </div>
                    </div>
                </article>

                <!-- Top Users -->
                <aside class="content-card rounded-[28px] p-6">
                    <div class="mb-6 flex items-center justify-between">
                        <div>
                            <h2 class="text-xl font-black text-white">Top Activity</h2>
                            <p class="mt-0.5 text-sm text-slate-500">Người dùng nổi bật</p>
                        </div>
                        <button type="button"
                            class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            title="Tải lại" @click="fetchOverview">
                            <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
                        </button>
                    </div>

                    <div v-if="topUsers.length" class="space-y-1">
                        <div v-for="(user, index) in topUsers" :key="user.id"
                            class="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-white/[0.04]">
                            <div class="relative flex-shrink-0">
                                <img v-if="user.avatar" :src="user.avatar" :alt="user.name"
                                    class="h-10 w-10 rounded-full border border-white/10 object-cover" />
                                <div v-else
                                    class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 text-xs font-black text-violet-200">
                                    {{ getInitials(user.name) }}
                                </div>
                                <span v-if="index === 0"
                                    class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-amber-900">
                                    1
                                </span>
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-sm font-bold text-white">{{ user.name }}</p>
                                <p class="truncate text-xs text-slate-500">{{ user.email }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-black text-violet-300">{{ formatNumber(user.sessions) }}</p>
                                <p class="text-xs text-slate-600">sessions</p>
                            </div>
                        </div>
                    </div>
                    <div v-else
                        class="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/8 px-4 py-10 text-center">
                        <Users class="h-7 w-7 text-slate-600" />
                        <p class="text-sm font-semibold text-slate-500">Chưa có dữ liệu người dùng</p>
                    </div>

                    <div class="mt-6 border-t border-white/6 pt-5">
                        <div class="flex items-center gap-3">
                            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                                <div class="h-full rounded-full transition-all duration-700"
                                    :class="utilizationBarColor" :style="{ width: utilizationWidth }">
                                </div>
                            </div>
                            <span class="text-xs font-bold" :class="utilizationColor">{{ utilizationLabel }}</span>
                        </div>
                        <p class="mt-2 text-xs text-slate-600">System utilization</p>
                    </div>
                </aside>
            </section>
        </div>
    </LayoutDefaultAdmin>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import {
    AlertCircle,
    BarChart3,
    CheckCircle2,
    Info,
    Loader2,
    Radio,
    RefreshCw,
    Star,
    Users,
    UsersRound,
} from 'lucide-vue-next'
import LayoutDefaultAdmin from '../layouts/LayoutDefaultAdmin.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const chartRef = ref(null)
const loading = ref(false)
const error = ref('')
const activityRange = ref('month')
const activity = ref([])
const topUsers = ref([])
const stats = ref({
    totalInterviews: 0,
    totalGrowth: 0,
    liveSessions: 0,
    liveLabel: 'Live',
    successRate: 0,
    successLabel: 'Stable',
    averageScore: 0,
    scoreDenominator: 100,
})

let chartInstance = null

const rangeOptions = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
]

const statCards = computed(() => [
    {
        label: 'Tổng người dùng',
        value: formatNumber(stats.value.totalInterviews),
        badge: formatGrowth(stats.value.totalGrowth),
        badgeClass: 'bg-emerald-500/12 text-emerald-400',
        icon: UsersRound,
        iconBg: 'bg-violet-500/15',
        iconColor: 'text-violet-300',
    },
    {
        label: 'Tổng phiên',
        value: formatNumber(stats.value.liveSessions),
        badge: stats.value.liveLabel || 'Live',
        badgeClass: 'bg-pink-500/12 text-pink-400',
        icon: Radio,
        iconBg: 'bg-pink-500/15',
        iconColor: 'text-pink-300',
    },
    {
        label: 'Tỷ lệ thành công',
        value: formatPercent(stats.value.successRate),
        badge: stats.value.successLabel || 'Stable',
        badgeClass: 'bg-violet-500/12 text-violet-400',
        icon: CheckCircle2,
        iconBg: 'bg-violet-500/15',
        iconColor: 'text-violet-300',
    },
    {
        label: 'Điểm trung bình',
        value: formatNumber(stats.value.averageScore),
        suffix: `/${stats.value.scoreDenominator || 100}`,
        icon: Star,
        iconBg: 'bg-indigo-500/15',
        iconColor: 'text-indigo-300',
    },
])

const hasActivityData = computed(() => {
    return activity.value.some((item) => item.total > 0 || item.completed > 0)
})

const utilizationLabel = computed(() => {
    if (stats.value.liveSessions >= 10) return 'High'
    if (stats.value.liveSessions >= 4) return 'Moderate'
    return 'Normal'
})

const utilizationColor = computed(() => {
    if (stats.value.liveSessions >= 10) return 'text-rose-400'
    if (stats.value.liveSessions >= 4) return 'text-amber-400'
    return 'text-emerald-400'
})

const utilizationBarColor = computed(() => {
    if (stats.value.liveSessions >= 10) return 'bg-rose-500'
    if (stats.value.liveSessions >= 4) return 'bg-amber-400'
    return 'bg-emerald-500'
})

const utilizationWidth = computed(() => {
    if (stats.value.liveSessions >= 10) return '88%'
    if (stats.value.liveSessions >= 4) return '48%'
    return '18%'
})

function toNumber(value, fallback = 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

function unwrapPayload(response) {
    return response?.data ?? response ?? {}
}

function normalizeStats(source = {}) {
    return {
        totalInterviews: toNumber(source.total_interviews),
        totalGrowth: toNumber(source.total_interviews_growth_percent),
        liveSessions: toNumber(source.live_sessions),
        liveLabel: source.live_sessions_label || 'Live',
        successRate: toNumber(source.success_rate),
        successLabel: source.success_rate_label || 'Stable',
        averageScore: Math.round(toNumber(source.average_score)),
        scoreDenominator: toNumber(source.average_score_denominator, 100),
    }
}

function normalizeActivity(items = []) {
    if (!Array.isArray(items)) return []
    return items.map((item) => ({
        label: item.label || item.date || '',
        date: item.date || '',
        total: toNumber(item.total_interviews),
        completed: toNumber(item.completed_interviews),
    }))
}

function normalizeTopUsers(items = []) {
    if (!Array.isArray(items)) return []
    return items.map((item) => ({
        id: item.user_id ?? item.id ?? item.email,
        name: item.full_name || item.username || 'Chưa cập nhật',
        email: item.email || 'Không có email',
        avatar: item.avatar_url || '',
        sessions: toNumber(item.session_count),
    }))
}

function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(toNumber(value))
}

function formatPercent(value) {
    return `${Math.round(toNumber(value))}%`
}

function formatGrowth(value) {
    const rounded = Math.round(toNumber(value) * 10) / 10
    if (rounded === 0) return '0%'
    return `${rounded > 0 ? '+' : ''}${rounded}%`
}

function getInitials(name = '') {
    return String(name)
        .trim()
        .split(/\s+/)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U'
}

function setActivityRange(nextRange) {
    if (nextRange === activityRange.value || loading.value) return
    activityRange.value = nextRange
    fetchOverview()
}

async function fetchOverview() {
    loading.value = true
    error.value = ''

    try {
        const response = await authStore.authorizedRequest(
            `/api/v1/admin/dashboard/overview?activity_range=${activityRange.value}`,
        )
        const payload = unwrapPayload(response)

        stats.value = normalizeStats(payload.stats)
        activityRange.value = payload.interview_activity_range || activityRange.value
        activity.value = normalizeActivity(payload.interview_activity)
        topUsers.value = normalizeTopUsers(payload.top_interview_activity)

        await nextTick()
        renderChart()
    } catch (err) {
        error.value = err?.response?.data?.message || err?.message || 'Không thể tải dữ liệu dashboard.'
    } finally {
        loading.value = false
    }
}

function renderChart() {
    if (!chartRef.value) return
    if (!chartInstance) {
        chartInstance = echarts.init(chartRef.value)
    }

    const labels = activity.value.map((item) => item.label)
    const totals = activity.value.map((item) => item.total)
    const completed = activity.value.map((item) => item.completed)

    chartInstance.setOption({
        color: ['#8b5cf6', '#38bdf8'],
        grid: { left: 12, right: 18, top: 40, bottom: 28, containLabel: true },
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#0e1120',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            borderRadius: 12,
            padding: [10, 14],
            textStyle: {
                color: '#cbd5e1',
                fontFamily: 'inherit',
                fontSize: 13,
            },
        },
        legend: {
            top: 0,
            right: 0,
            textStyle: { color: '#64748b', fontWeight: 700, fontSize: 12 },
            itemWidth: 10,
            itemHeight: 6,
            borderRadius: 4,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: labels,
            axisTick: { show: false },
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
            axisLabel: {
                color: '#475569',
                fontWeight: 700,
                fontSize: 11,
                hideOverlap: true,
                interval: activityRange.value === 'month' ? 4 : 0,
            },
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)', type: 'dashed' } },
            axisLabel: { color: '#334155', fontWeight: 700, fontSize: 11 },
        },
        series: [
            {
                name: 'Tổng phỏng vấn',
                type: 'line',
                smooth: 0.4,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2.5 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(139,92,246,0.22)' },
                        { offset: 1, color: 'rgba(139,92,246,0.01)' },
                    ]),
                },
                data: totals,
            },
            {
                name: 'Hoàn thành',
                type: 'line',
                smooth: 0.4,
                symbol: 'circle',
                symbolSize: 5,
                lineStyle: { width: 2 },
                data: completed,
            },
        ],
    })

    chartInstance.resize()
    setTimeout(() => chartInstance?.resize(), 0)
}

function resizeChart() {
    chartInstance?.resize()
}

onMounted(() => {
    fetchOverview()
    window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart)
    chartInstance?.dispose()
    chartInstance = null
})

watch(activity, () => {
    nextTick(() => renderChart())
})
</script>

<style scoped>
.dashboard-hero {
    position: relative;
    min-height: 160px;
    background:
        linear-gradient(135deg, rgba(6, 8, 15, 0.05) 0%, rgba(6, 8, 15, 0.88) 100%),
        radial-gradient(ellipse at 18% 55%, rgba(139, 92, 246, 0.32) 0%, transparent 52%),
        radial-gradient(ellipse at 78% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 46%),
        #0d0f1e;
    border: 1px solid rgba(139, 92, 246, 0.1);
}

.stat-card {
    background: #0e1120;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: border-color 0.2s ease, transform 0.2s ease;
}

.stat-card:hover {
    border-color: rgba(139, 92, 246, 0.18);
    transform: translateY(-2px);
}

.content-card {
    background: #0e1120;
    border: 1px solid rgba(255, 255, 255, 0.05);
}
</style>