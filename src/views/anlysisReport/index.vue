<template>
    <LayoutInterview>
        <main class="reports-page">
            <section class="reports-toolbar">
                <div class="filter-group">
                    <button class="filter-pill" type="button">
                        <SlidersHorizontal :size="18" />
                        <select v-model="statusFilter" aria-label="Lọc trạng thái" @change="resetAndFetch">
                            <option value="">Tất cả trạng thái</option>
                            <option value="completed">Đã hoàn thành</option>
                            <option value="active">Đang phỏng vấn</option>
                        </select>
                    </button>

                    <button class="filter-pill" type="button">
                        <select v-model="sortBy" aria-label="Sắp xếp báo cáo">
                            <option value="newest">Mới nhất</option>
                            <option value="score-desc">Điểm cao nhất</option>
                            <option value="score-asc">Điểm thấp nhất</option>
                        </select>
                        <ChevronDown :size="18" />
                    </button>
                </div>

                <div class="report-count">
                    Hiển thị: <strong>{{ total }}</strong> báo cáo
                </div>
            </section>

            <section v-if="isLoading" class="state-panel">
                <LoaderCircle :size="30" class="spin" />
                <span>Đang tải báo cáo phân tích...</span>
            </section>

            <section v-else-if="reports.length === 0" class="state-panel">
                <FileSearch :size="30" />
                <span>Chưa có báo cáo phân tích nào.</span>
            </section>

            <section v-else class="report-grid">
                <Motion v-for="report in sortedReports" :key="report.id || report.session_id"
                    :initial="{ opacity: 0, y: 14 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.22 }">
                    <article class="report-card">
                        <div class="card-top">
                            <div class="report-avatar" :class="scoreTone(report.overall_score)">
                                <component :is="iconForReport(report)" :size="24" />
                            </div>

                            <div class="final-score">
                                <span>FINAL SCORE</span>
                                <strong>{{ displayScore(report.overall_score) }}/100</strong>
                            </div>
                        </div>

                        <div class="report-body">
                            <h2 :title="report.job_position || 'Vị trí phỏng vấn'">
                                {{ report.job_position || 'Vị trí phỏng vấn' }}
                            </h2>
                            <p>
                                {{ report.company_name || 'Chưa cập nhật công ty' }}
                                <span v-if="report.level">• {{ report.level }}</span>
                            </p>
                        </div>

                        <div class="report-meta">
                            <span>
                                <CalendarDays :size="19" />
                                {{ formatDate(report.created_at || report.ended_at || report.started_at) }}
                            </span>
                            <span>
                                <Clock3 :size="19" />
                                {{ formatDuration(report.interview_duration_seconds) }}
                            </span>
                        </div>

                        <div class="tag-row" v-if="report.tags?.length">
                            <span v-for="tag in report.tags.slice(0, 2)" :key="tag">{{ tag }}</span>
                        </div>

                        <button class="detail-link" type="button" @click="openReport(report)">
                            Xem chi tiết
                            <ArrowRight :size="20" />
                        </button>
                    </article>
                </Motion>
            </section>

            <footer v-if="totalPages > 1 && !isLoading" class="pagination">
                <button class="page-button" :disabled="page <= 1" type="button" @click="goToPage(page - 1)">
                    <ChevronLeft :size="18" />
                </button>

                <button v-for="item in paginationItems" :key="item.key" class="page-button"
                    :class="{ active: item.value === page, dots: item.type === 'dots' }"
                    :disabled="item.type === 'dots'" type="button"
                    @click="item.type === 'page' && goToPage(item.value)">
                    {{ item.label }}
                </button>

                <button class="page-button" :disabled="page >= totalPages" type="button" @click="goToPage(page + 1)">
                    <ChevronRight :size="18" />
                </button>
            </footer>
        </main>
    </LayoutInterview>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Motion } from 'motion-v'
import {
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Code2,
    FileSearch,
    LoaderCircle,
    SlidersHorizontal,
} from 'lucide-vue-next'

import LayoutInterview from '../layouts/LayoutInterview.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const reports = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isLoading = ref(false)
const statusFilter = ref('')
const sortBy = ref('newest')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const sortedReports = computed(() => {
    const list = [...reports.value]
    if (sortBy.value === 'score-desc') {
        return list.sort((a, b) => toNumber(b.overall_score) - toNumber(a.overall_score))
    }
    if (sortBy.value === 'score-asc') {
        return list.sort((a, b) => toNumber(a.overall_score) - toNumber(b.overall_score))
    }
    return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
})

const paginationItems = computed(() => {
    const pages = []
    const totalPageCount = totalPages.value
    const current = page.value

    if (totalPageCount <= 5) {
        return Array.from({ length: totalPageCount }, (_, index) => ({
            type: 'page',
            value: index + 1,
            label: index + 1,
            key: `page-${index + 1}`,
        }))
    }

    const pageSet = new Set([1, current - 1, current, current + 1, totalPageCount])
    let previous = 0

    Array.from(pageSet)
        .filter((value) => value >= 1 && value <= totalPageCount)
        .sort((a, b) => a - b)
        .forEach((value) => {
            if (previous && value - previous > 1) {
                pages.push({ type: 'dots', label: '...', key: `dots-${previous}-${value}` })
            }
            pages.push({ type: 'page', value, label: value, key: `page-${value}` })
            previous = value
        })

    return pages
})

onMounted(() => {
    fetchReports()
})

async function fetchReports() {
    isLoading.value = true
    try {
        const params = new URLSearchParams({
            page: String(page.value),
            page_size: String(pageSize.value),
        })
        if (statusFilter.value) params.set('status', statusFilter.value)

        const response = await authStore.authorizedRequest(
            `/api/v1/conversations/analysis-reports?${params.toString()}`
        )
        const payload = extractListPayload(response)

        reports.value = payload.items
        total.value = toNumber(
            payload.meta.total ?? payload.meta.total_items ?? payload.meta.count,
            reports.value.length,
        )
        page.value = Math.max(1, toNumber(payload.meta.page ?? payload.meta.current_page, page.value))
        pageSize.value = Math.max(1, toNumber(payload.meta.page_size ?? payload.meta.limit, pageSize.value))
    } catch (err) {
        reports.value = []
        total.value = 0
        ElMessage.error(err.message || 'Không thể tải danh sách báo cáo phân tích')
    } finally {
        isLoading.value = false
    }
}

function resetAndFetch() {
    page.value = 1
    fetchReports()
}

function goToPage(nextPage) {
    const target = Math.min(Math.max(Number(nextPage) || 1, 1), totalPages.value)
    if (target === page.value) return
    page.value = target
    fetchReports()
}

function openReport(report) {
    const id = report.session_id || report.conversation_id || report.id
    if (!id) return
    router.push(`/analysis-reports/${id}`)
}

function iconForReport(report) {
    const position = String(report.job_position || '').toLowerCase()
    if (position.includes('dev') || position.includes('engineer') || position.includes('frontend')) return Code2
    if (report.company_name) return Building2
    return BriefcaseBusiness
}

function scoreTone(score) {
    const value = toNumber(score)
    if (value >= 85) return 'high'
    if (value >= 60) return 'medium'
    return 'low'
}

function displayScore(score) {
    const value = toNumber(score, null)
    return value === null ? '--' : Math.round(value)
}

function formatDate(value) {
    if (!value) return 'Chưa rõ'
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value))
}

function formatDuration(seconds) {
    const value = toNumber(seconds)
    if (!value) return '-- phút'
    const minutes = Math.max(1, Math.round(value / 60))
    if (minutes < 60) return `${minutes} phút`
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest ? `${hours}h ${rest}p` : `${hours}h`
}

function extractListPayload(response) {
    const payload = response?.data ?? response ?? {}
    if (Array.isArray(payload)) return { items: payload, meta: {} }

    const items = payload.items || payload.results || payload.rows || payload.data || []
    return {
        items: Array.isArray(items) ? items : [],
        meta: payload,
    }
}

function toNumber(value, fallback = 0) {
    const number = Number(value)
    return Number.isFinite(number) ? number : fallback
}
</script>

<style scoped>
.reports-page {
    flex: 1;
    min-width: 0;
    min-height: 100vh;
    overflow-y: auto;
    padding: 28px 28px 34px;
    background:
        radial-gradient(circle at 48% 28%, rgba(79, 70, 229, 0.1), transparent 35%),
        #090b13;
    color: #f8fafc;
}

.reports-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 30px;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
}

.filter-pill {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 999px;
    padding: 0 16px;
    color: #a5b4fc;
    background: #11162a;
    transition: 160ms ease;
}

.filter-pill:hover,
.filter-pill:focus-within {
    border-color: rgba(129, 140, 248, 0.36);
    background: #151b32;
}

.filter-pill select {
    min-width: 112px;
    border: 0;
    outline: 0;
    color: inherit;
    font-size: 14px;
    font-weight: 800;
    background: transparent;
    appearance: none;
}

.filter-pill option {
    color: #111827;
}

.report-count {
    color: #cbd5e1;
    font-size: 14px;
    font-weight: 700;
}

.report-count strong {
    color: #fff;
}

.report-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 22px;
}

.report-card {
    min-height: 280px;
    display: flex;
    flex-direction: column;
    padding: 22px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: #11162a;
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.16);

    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;
}

.report-card:hover {
    transform: translateY(-8px) scale(1.01);
    border-color: rgba(129, 140, 248, 0.3);
    box-shadow:
        0 30px 70px rgba(0, 0, 0, 0.28),
        0 8px 20px rgba(99, 102, 241, 0.12);
}

.report-card:hover .report-avatar {
    transform: scale(1.08);
}

.report-card:hover .detail-link {
    transform: translateX(4px);
}

.report-avatar,
.detail-link {
    transition: all 0.25s ease;
}

.card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
}

.report-avatar {
    width: 56px;
    height: 56px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: 1px solid rgba(129, 140, 248, 0.18);
    color: #a5b4fc;
    background: linear-gradient(135deg, #20294a, #111827);
}

.report-avatar.high {
    color: #86efac;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.18), #111827);
}

.report-avatar.medium {
    color: #c4b5fd;
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), #111827);
}

.report-avatar.low {
    color: #fca5a5;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.16), #111827);
}

.final-score {
    text-align: right;
}

.final-score span {
    display: block;
    color: #8d96b8;
    font-size: 10px;
    font-weight: 950;
    letter-spacing: 0.14em;
}

.final-score strong {
    display: block;
    margin-top: 4px;
    color: #a9a5ff;
    font-size: 26px;
    font-weight: 950;
    line-height: 1;
}

.report-body {
    margin-top: 24px;
}

.report-body h2 {
    margin: 0;
    overflow: hidden;
    color: #eef2ff;
    font-size: 20px;
    font-weight: 950;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.report-body p {
    margin: 5px 0 0;
    overflow: hidden;
    color: #9ca3af;
    font-size: 14px;
    font-weight: 750;
    line-height: 1.45;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.report-meta {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-top: 24px;
    color: #aab4cc;
    font-size: 13px;
    font-weight: 800;
}

.report-meta span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
}

.tag-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 18px;
    overflow: hidden;
}

.tag-row span {
    max-width: 50%;
    overflow: hidden;
    padding: 5px 9px;
    border: 1px solid rgba(129, 140, 248, 0.2);
    border-radius: 999px;
    color: #c4b5fd;
    background: rgba(99, 102, 241, 0.1);
    font-size: 11px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.detail-link {
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 22px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    color: #a5b4fc;
    font-size: 14px;
    font-weight: 950;
    text-align: left;
    transition: 160ms ease;
}

.detail-link:hover {
    color: #c4b5fd;
    transform: translateX(2px);
}

.state-panel {
    min-height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    color: #94a3b8;
    font-weight: 850;
}

.spin {
    animation: spin 1s linear infinite;
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    margin-top: 44px;
}

.page-button {
    min-width: 38px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: #9ca3af;
    background: #11162a;
    font-weight: 950;
    transition: 160ms ease;
}

.page-button:hover:not(:disabled),
.page-button.active {
    color: #fff;
    border-color: rgba(124, 58, 237, 0.54);
    background: #6d5df6;
    box-shadow: 0 12px 26px rgba(109, 93, 246, 0.24);
}

.page-button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
}

.page-button.dots {
    border-color: transparent;
    background: transparent;
    box-shadow: none;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 1180px) {
    .report-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 820px) {
    .reports-page {
        padding: 20px 16px 28px;
    }

    .reports-toolbar {
        align-items: flex-start;
        flex-direction: column;
    }

    .report-grid {
        grid-template-columns: 1fr;
    }

    .report-card {
        min-height: 260px;
    }
}

@media (max-width: 560px) {

    .filter-group,
    .filter-pill {
        width: 100%;
    }

    .filter-pill {
        justify-content: space-between;
    }

    .filter-pill select {
        width: 100%;
    }

    .report-meta {
        align-items: flex-start;
        flex-direction: column;
        gap: 10px;
    }

    .final-score strong {
        font-size: 22px;
    }
}
</style>
