<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import LayoutDefaultAdmin from '../layouts/LayoutDefaultAdmin.vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
    id: number
    role: 'interviewer' | 'candidate'
    content: string
    question: string | null
    answer: string | null
    created_at: string
}

interface ScoreDetail {
    score: number
    evidence: string
}

interface AnalysisReport {
    id: number
    status: string
    overall_score: number
    overall_grade: string
    level: string
    summary: string
    tags: string[]
    scores: Record<string, ScoreDetail>
    strengths: string[]
    weaknesses: string[]
    created_at: string
    updated_at: string
}

interface SessionDetail {
    id: number
    session_id: string
    user_id: number
    candidate: { id: number; email: string; username: string } | null
    job_position: string
    company_name: string | null
    status: string
    score: number
    started_at: string
    ended_at: string
    interview_duration_seconds: number
    message_count: number
    created_at: string
    updated_at: string
    job_description: string
    cv_profile: string
    result: string
    messages: Message[]
    analysis_report: AnalysisReport
}

// ─── State ────────────────────────────────────────────────────────────────────
const route = useRoute()
const session = ref({})
const loading = ref(true)
const error = ref<string | null>(null)
const expandedEvidence = ref<string | null>(null)

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchSession() {
    try {
        loading.value = true
        error.value = null
        const sessionId = route.params.id
        const res = await authStore.authorizedRequest(`/api/v1/admin/sessions/${sessionId}`)

        session.value = res;
        console.log('Session fetched:', session.value)
    } catch (e: any) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

onMounted(fetchSession)

// ─── Computed ─────────────────────────────────────────────────────────────────

/** Lấy tên ứng viên từ candidate hoặc cv_profile */
const candidateName = computed(() => {
    if (session.value?.candidate?.username) return session.value.candidate.username
    const cv = session.value?.cv_profile ?? ''
    // dòng đầu tiên của CV thường là tên
    return cv.split('\n')[0]?.trim() ?? '—'
})

/** Parse result JSON string */
const parsedResult = computed(() => {
    try {
        return JSON.parse(session.value?.result ?? '{}')
    } catch {
        return {}
    }
})

const scoreColor = computed(() => {
    const s = session.value?.score ?? 0
    if (s >= 85) return '#a78bfa'
    if (s >= 70) return '#34d399'
    if (s >= 50) return '#fbbf24'
    return '#f87171'
})

/** Chuyển scores object thành array có thứ tự để vẽ radar */
const SCORE_LABELS: Record<string, string> = {
    technical: 'TECHNICAL',
    communication: 'COMMUNICATION',
    soft_skills: 'SOFT SKILLS',
    company_knowledge: 'COMPANY',
    confidence: 'CONFIDENCE',
}

const radarItems = computed(() => {
    const scores = session.value?.analysis_report?.scores ?? {}
    return Object.entries(SCORE_LABELS).map(([key, label]) => ({
        key,
        label,
        value: scores[key]?.score ?? 0,
        evidence: scores[key]?.evidence ?? '',
    }))
})

// ─── Radar SVG helpers ────────────────────────────────────────────────────────
const CX = 120, CY = 120, R = 80

function polar(index: number, total: number, radius: number) {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2
    return {
        x: CX + radius * Math.cos(angle),
        y: CY + radius * Math.sin(angle),
    }
}

const radarPath = computed(() => {
    const items = radarItems.value
    return items.map((item, i) => {
        const p = polar(i, items.length, R * (item.value / 100))
        return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
    }).join(' ') + ' Z'
})

const radarGridPaths = computed(() => {
    const n = radarItems.value.length
    return [0.25, 0.5, 0.75, 1].map(ratio =>
        radarItems.value.map((_, i) => {
            const p = polar(i, n, R * ratio)
            return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
        }).join(' ') + ' Z'
    )
})

const radarAxisLines = computed(() =>
    radarItems.value.map((_, i) => {
        const p = polar(i, radarItems.value.length, R)
        return { x2: p.x, y2: p.y }
    })
)

const radarLabelPoints = computed(() =>
    radarItems.value.map((item, i) => {
        const p = polar(i, radarItems.value.length, R + 22)
        return { ...p, label: item.label, value: item.value }
    })
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
    if (!iso) return '—'
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}

function formatDuration(seconds: number) {
    if (!seconds) return '—'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}g ${m}p`
    return `${m} phút`
}

function formatTime(iso: string) {
    if (!iso) return ''
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const TAG_COLORS = ['#a78bfa', '#34d399', '#f472b6', '#60a5fa', '#fbbf24', '#fb923c', '#38bdf8']

function tagColor(i: number) {
    return TAG_COLORS[i % TAG_COLORS.length]
}

function scoreLabel(score: number) {
    if (score >= 90) return 'Xuất sắc'
    if (score >= 80) return 'Tốt'
    if (score >= 65) return 'Khá'
    return 'Cần cải thiện'
}

function scoreBgColor(score: number) {
    if (score >= 90) return { bar: '#a78bfa', bg: '#1e1b4b' }
    if (score >= 80) return { bar: '#34d399', bg: '#064e3b' }
    if (score >= 65) return { bar: '#fbbf24', bg: '#78350f' }
    return { bar: '#f87171', bg: '#450a0a' }
}

function toggleEvidence(key: string) {
    expandedEvidence.value = expandedEvidence.value === key ? null : key
}
</script>

<template>
    <LayoutDefaultAdmin>
        <div class="sp bg-[#0d0f1e]">

            <!-- ── Loading ──────────────────────────────────────────── -->
            <div v-if="loading" class="sp-state">
                <div class="sp-spinner" />
                <span>Đang tải dữ liệu phỏng vấn…</span>
            </div>

            <!-- ── Error ────────────────────────────────────────────── -->
            <!-- <div v-else-if="error" class="sp-state sp-state--error">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#f87171" stroke-width="1.5" />
                    <path d="M12 8v4M12 16h.01" stroke="#f87171" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                <span>{{ error }}</span>
                <button class="sp-btn-retry" @click="fetchSession">Thử lại</button>
            </div> -->

            <template v-else-if="session">

                <!-- ════════════════════════════════════════════════════ -->
                <!-- HEADER                                               -->
                <!-- ════════════════════════════════════════════════════ -->
                <div class="sp-header">
                    <div class="sp-header__left">
                        <!-- Avatar -->
                        <div class="sp-avatar">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="8" r="4" stroke="#6366f1" stroke-width="1.5" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#6366f1" stroke-width="1.5"
                                    stroke-linecap="round" />
                            </svg>
                            <div class="sp-avatar__badge">
                                <svg width="10" height="10" viewBox="0 0 10 10">
                                    <circle cx="5" cy="5" r="5" fill="#6366f1" />
                                    <path d="M3 5l1.5 1.5L7 3.5" stroke="#fff" stroke-width="1.2" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                            </div>
                        </div>

                        <!-- Info -->
                        <div class="sp-header__info">
                            <h1 class="sp-header__name">{{ candidateName }}</h1>
                            <p class="sp-header__pos">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="7" width="18" height="14" rx="2" stroke="#6366f1"
                                        stroke-width="1.5" />
                                    <path d="M8 7V5a4 4 0 0 1 8 0v2" stroke="#6366f1" stroke-width="1.5" />
                                </svg>
                                {{ session.job_position }}
                                <span v-if="session.company_name" class="sp-header__company">@ {{ session.company_name
                                }}</span>
                            </p>
                            <div class="sp-chips">
                                <span class="sp-chip">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor"
                                            stroke-width="1.5" />
                                        <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" stroke-width="1.5" />
                                    </svg>
                                    {{ formatDate(session.started_at) }}
                                </span>
                                <span class="sp-chip">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
                                        <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" />
                                    </svg>
                                    {{ formatDuration(session.interview_duration_seconds) }}
                                </span>
                                <span class="sp-chip">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                                            stroke="currentColor" stroke-width="1.5" />
                                    </svg>
                                    {{ session.message_count }} tin nhắn
                                </span>
                                <span :class="['sp-chip', 'sp-chip--status', `sp-chip--${session.status}`]">
                                    {{ session.status }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Score ring -->
                    <div class="sp-score">
                        <div class="sp-score__ring">
                            <svg width="100" height="100" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e1b4b" stroke-width="7" />
                                <circle cx="50" cy="50" r="42" fill="none" :stroke="scoreColor" stroke-width="7"
                                    stroke-linecap="round" stroke-dasharray="263.9"
                                    :stroke-dashoffset="263.9 - (263.9 * session.score / 100)"
                                    transform="rotate(-90 50 50)" style="transition: stroke-dashoffset 1s ease" />
                            </svg>
                            <div class="sp-score__inner">
                                <span class="sp-score__val" :style="{ color: scoreColor }">{{ session.score }}</span>
                                <span class="sp-score__den">/100</span>
                            </div>
                        </div>
                        <span class="sp-score__lbl">AI MATCH SCORE</span>
                        <span class="sp-score__grade" :style="{ color: scoreColor }">
                            {{ session.analysis_report?.overall_grade }} · {{ session.analysis_report?.level }}
                        </span>
                    </div>
                </div>

                <!-- ════════════════════════════════════════════════════ -->
                <!-- TAGS                                                 -->
                <!-- ════════════════════════════════════════════════════ -->
                <div class="sp-tags">
                    <span v-for="(tag, i) in session.analysis_report?.tags ?? []" :key="i" class="sp-tag"
                        :style="{ borderColor: tagColor(i) + '66', color: tagColor(i), background: tagColor(i) + '14' }">{{
                            tag }}</span>
                </div>

                <!-- ════════════════════════════════════════════════════ -->
                <!-- BODY GRID                                            -->
                <!-- ════════════════════════════════════════════════════ -->
                <div class="sp-grid">

                    <!-- ── Col Left: Transcript ─────────────────────────── -->
                    <div class="sp-col-main">
                        <div class="sp-panel">
                            <div class="sp-panel__hd">
                                <div class="sp-panel__title">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#6366f1"
                                            stroke-width="1.5" />
                                        <path d="M7 8h10M7 12h6M7 16h4" stroke="#6366f1" stroke-width="1.5"
                                            stroke-linecap="round" />
                                    </svg>
                                    Hành trình Phỏng vấn
                                </div>
                                <div class="sp-panel__badges">
                                    <span class="sp-badge sp-badge--gray">AI AUTOMATED</span>
                                    <span class="sp-badge sp-badge--purple">REAL-TIME ANALYSIS</span>
                                </div>
                            </div>

                            <div class="sp-messages">
                                <template v-for="msg in session.messages" :key="msg.id">

                                    <!-- Interviewer (AI) -->
                                    <div class="sp-msg sp-msg--ai">
                                        <div class="sp-msg__avatar sp-msg__avatar--ai">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="#6366f1" stroke-width="1.5" />
                                                <path d="M8 12h8M12 8v8" stroke="#6366f1" stroke-width="1.5"
                                                    stroke-linecap="round" />
                                            </svg>
                                        </div>
                                        <div class="sp-msg__body">
                                            <div class="sp-msg__meta">
                                                <span class="sp-msg__who">NEURAL AI INTERVIEWER</span>
                                                <span class="sp-msg__time">{{ formatTime(msg.created_at) }}</span>
                                            </div>
                                            <div class="sp-msg__bubble sp-msg__bubble--ai">
                                                {{ msg.question ?? msg.content }}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Candidate -->
                                    <div class="sp-msg sp-msg--cand">
                                        <div class="sp-msg__body sp-msg__body--r">
                                            <div class="sp-msg__meta sp-msg__meta--r">
                                                <span class="sp-msg__time">{{ formatTime(msg.created_at) }}</span>
                                                <span class="sp-msg__who">{{ candidateName.toUpperCase() }}</span>
                                            </div>
                                            <div class="sp-msg__bubble sp-msg__bubble--cand">
                                                {{ msg.answer ?? msg.content }}
                                            </div>
                                        </div>
                                        <div class="sp-msg__avatar sp-msg__avatar--cand">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="8" r="4" stroke="#e2e8f0" stroke-width="1.5" />
                                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#e2e8f0"
                                                    stroke-width="1.5" stroke-linecap="round" />
                                            </svg>
                                        </div>
                                    </div>

                                </template>
                                <div v-if="!session.messages?.length" class="sp-empty">Chưa có tin nhắn.</div>
                            </div>
                        </div>
                    </div>

                    <!-- ── Col Right: Analysis ──────────────────────────── -->
                    <div class="sp-col-side">

                        <!-- Summary -->
                        <div class="sp-panel sp-panel--gap">
                            <div class="sp-panel__hd">
                                <div class="sp-panel__title">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" fill="#6366f1" />
                                    </svg>
                                    Tóm tắt Đánh giá
                                </div>
                            </div>
                            <p class="sp-summary">{{ session.analysis_report?.summary }}</p>

                            <!-- Radar -->
                            <div class="sp-radar">
                                <svg :width="CX * 2" :height="CY * 2" :viewBox="`0 0 ${CX * 2} ${CY * 2}`">
                                    <!-- grid -->
                                    <path v-for="(gp, gi) in radarGridPaths" :key="gi" :d="gp" fill="none"
                                        stroke="#2d2b5e" stroke-width="0.8" />
                                    <!-- axes -->
                                    <line v-for="(ax, ai) in radarAxisLines" :key="'ax' + ai" :x1="CX" :y1="CY"
                                        :x2="ax.x2" :y2="ax.y2" stroke="#2d2b5e" stroke-width="0.8" />
                                    <!-- filled -->
                                    <path :d="radarPath" fill="#6366f1" fill-opacity="0.18" stroke="#6366f1"
                                        stroke-width="1.5" />
                                    <!-- dots -->
                                    <circle v-for="(item, i) in radarItems" :key="'dot' + i"
                                        :cx="polar(i, radarItems.length, R * (item.value / 100)).x"
                                        :cy="polar(i, radarItems.length, R * (item.value / 100)).y" r="3"
                                        fill="#6366f1" />
                                    <!-- labels -->
                                    <text v-for="(pt, pi) in radarLabelPoints" :key="'lb' + pi" :x="pt.x" :y="pt.y"
                                        text-anchor="middle" dominant-baseline="middle" fill="#64748b" font-size="7.5"
                                        font-family="'IBM Plex Mono', monospace">
                                        {{ pt.label }}
                                    </text>
                                </svg>
                            </div>
                        </div>

                        <!-- Score breakdown -->
                        <div class="sp-panel sp-panel--gap">
                            <div class="sp-panel__hd">
                                <div class="sp-panel__title">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 20V10M12 20V4M6 20v-6" stroke="#34d399" stroke-width="1.5"
                                            stroke-linecap="round" />
                                    </svg>
                                    Chi tiết Điểm số
                                </div>
                            </div>
                            <div class="sp-scores">
                                <div v-for="item in radarItems" :key="item.key" class="sp-score-row"
                                    @click="toggleEvidence(item.key)">
                                    <div class="sp-score-row__top">
                                        <span class="sp-score-row__label">{{ SCORE_LABELS[item.key] }}</span>
                                        <div class="sp-score-row__right">
                                            <span class="sp-score-row__tag"
                                                :style="{ background: scoreBgColor(item.value).bg, color: scoreBgColor(item.value).bar }">
                                                {{ scoreLabel(item.value) }}
                                            </span>
                                            <span class="sp-score-row__num"
                                                :style="{ color: scoreBgColor(item.value).bar }">
                                                {{ item.value }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="sp-score-row__bar-bg">
                                        <div class="sp-score-row__bar"
                                            :style="{ width: item.value + '%', background: scoreBgColor(item.value).bar }" />
                                    </div>
                                    <!-- Evidence dropdown -->
                                    <div v-if="expandedEvidence === item.key" class="sp-evidence">
                                        {{ item.evidence }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Strengths -->
                        <div class="sp-panel sp-panel--gap">
                            <div class="sp-panel__hd">
                                <div class="sp-panel__title">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 12l2 2 4-4" stroke="#34d399" stroke-width="1.5"
                                            stroke-linecap="round" />
                                        <circle cx="12" cy="12" r="9" stroke="#34d399" stroke-width="1.5" />
                                    </svg>
                                    Điểm mạnh
                                </div>
                            </div>
                            <ul class="sp-list">
                                <li v-for="(s, i) in session.analysis_report?.strengths ?? []" :key="i"
                                    class="sp-list__item sp-list__item--green">
                                    <span class="sp-list__dot sp-list__dot--green" />
                                    {{ s }}
                                </li>
                            </ul>
                        </div>

                        <!-- Weaknesses -->
                        <div class="sp-panel sp-panel--gap">
                            <div class="sp-panel__hd">
                                <div class="sp-panel__title">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="9" stroke="#f472b6" stroke-width="1.5" />
                                        <path d="M12 8v5M12 16h.01" stroke="#f472b6" stroke-width="1.5"
                                            stroke-linecap="round" />
                                    </svg>
                                    Lỗ hổng cần cải thiện
                                </div>
                            </div>
                            <ul class="sp-list">
                                <li v-for="(w, i) in session.analysis_report?.weaknesses ?? []" :key="i"
                                    class="sp-list__item sp-list__item--pink">
                                    <span class="sp-list__dot sp-list__dot--pink" />
                                    {{ w }}
                                </li>
                            </ul>
                        </div>

                        <!-- Stats -->
                        <div class="sp-stats">
                            <div class="sp-stat">
                                <span class="sp-stat__lbl">THỜI LƯỢNG</span>
                                <span class="sp-stat__val">{{ formatDuration(session.interview_duration_seconds)
                                }}</span>
                            </div>
                            <div class="sp-stat">
                                <span class="sp-stat__lbl">TIN NHẮN</span>
                                <span class="sp-stat__val sp-stat__val--purple">{{ session.message_count }}</span>
                            </div>
                        </div>

                        <!-- PDF -->
                        <button class="sp-btn-pdf">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                                    stroke="currentColor" stroke-width="1.5" />
                                <path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" />
                            </svg>
                            Tải Báo cáo PDF Chi tiết
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </LayoutDefaultAdmin>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap');

/* ── Root ──────────────────────────────────────────── */
.sp {
    font-family: 'Be Vietnam Pro', sans-serif;
    background: #0f0e1a;
    min-height: 100vh;
    padding: 24px;
    color: #e2e8f0;
    box-sizing: border-box;
}

/* ── States ────────────────────────────────────────── */
.sp-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 60vh;
    color: #94a3b8;
    font-size: 14px;
}

.sp-state--error {
    color: #f87171;
}

.sp-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #1e1b4b;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.sp-btn-retry {
    padding: 8px 20px;
    background: transparent;
    border: 1px solid #6366f1;
    color: #6366f1;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
}

.sp-btn-retry:hover {
    background: #1e1b4b;
}

/* ── Header ────────────────────────────────────────── */
.sp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    background: linear-gradient(135deg, #13122a 0%, #1a1830 100%);
    border: 1px solid #2d2b5e;
    border-radius: 16px;
    padding: 24px 28px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.sp-header__left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.sp-avatar {
    position: relative;
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #1e1b4b, #2d2b5e);
    border: 2px solid #6366f133;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sp-avatar__badge {
    position: absolute;
    bottom: -4px;
    right: -4px;
    background: #0f0e1a;
    border-radius: 50%;
    padding: 2px;
}

.sp-header__name {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 4px;
    background: linear-gradient(90deg, #e2e8f0, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.sp-header__pos {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #94a3b8;
    font-size: 13px;
    margin: 0 0 10px;
}

.sp-header__company {
    color: #64748b;
}

/* Chips */
.sp-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.sp-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-family: 'IBM Plex Mono', monospace;
    padding: 4px 10px;
    border-radius: 20px;
    background: #1e1b4b;
    color: #94a3b8;
    border: 1px solid #2d2b5e;
}

.sp-chip--status {
    font-weight: 600;
    text-transform: uppercase;
}

.sp-chip--completed {
    background: #064e3b;
    color: #34d399;
    border-color: #059669;
}

.sp-chip--pending {
    background: #78350f;
    color: #fbbf24;
    border-color: #d97706;
}

.sp-chip--active {
    background: #1e3a5f;
    color: #60a5fa;
    border-color: #3b82f6;
}

/* Score ring */
.sp-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.sp-score__ring {
    position: relative;
}

.sp-score__inner {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 33px 0px;
}

.sp-score__val {
    font-size: 26px;
    font-weight: 800;
    font-family: 'IBM Plex Mono', monospace;
}

.sp-score__den {
    font-size: 12px;
    color: #64748b;
    align-self: flex-end;
    margin-bottom: 4px;
}

.sp-score__lbl {
    font-size: 9px;
    letter-spacing: 0.1em;
    color: #64748b;
    font-family: 'IBM Plex Mono', monospace;
}

.sp-score__grade {
    font-size: 12px;
    font-weight: 600;
}

/* Tags bar */
.sp-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.sp-tag {
    font-size: 11px;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 20px;
    border: 1px solid;
}

/* ── Grid ──────────────────────────────────────────── */
.sp-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 20px;
    align-items: start;
}

@media (max-width: 1100px) {
    .sp-grid {
        grid-template-columns: 1fr;
    }
}

/* ── Panel ─────────────────────────────────────────── */
.sp-panel {
    background: linear-gradient(135deg, #13122a 0%, #1a1830 100%);
    border: 1px solid #2d2b5e;
    border-radius: 14px;
    overflow: hidden;
}

.sp-panel--gap {
    margin-bottom: 14px;
}

.sp-panel__hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid #2d2b5e;
    gap: 10px;
    flex-wrap: wrap;
}

.sp-panel__title {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12.5px;
    font-weight: 600;
    color: #e2e8f0;
}

.sp-panel__badges {
    display: flex;
    gap: 8px;
}

.sp-badge {
    font-size: 10px;
    font-family: 'IBM Plex Mono', monospace;
    padding: 3px 9px;
    border-radius: 5px;
    font-weight: 600;
    letter-spacing: 0.04em;
}

.sp-badge--gray {
    background: #1e1b4b;
    color: #94a3b8;
    border: 1px solid #2d2b5e;
}

.sp-badge--purple {
    background: #1e1b4b;
    color: #6366f1;
    border: 1px solid #6366f144;
}

/* ── Messages ──────────────────────────────────────── */
.sp-messages {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    max-height: 1500px;
    overflow-y: auto;
}

.sp-messages::-webkit-scrollbar {
    width: 4px;
}

.sp-messages::-webkit-scrollbar-thumb {
    background: #2d2b5e;
    border-radius: 4px;
}

.sp-msg {
    display: flex;
    gap: 10px;
    align-items: flex-start;
}

.sp-msg--cand {
    justify-content: flex-end;
}

.sp-msg__avatar {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.sp-msg__avatar--ai {
    background: #1e1b4b;
    border: 1px solid #6366f133;
}

.sp-msg__avatar--cand {
    background: #1e2a3a;
    border: 1px solid #3b4a5e;
}

.sp-msg__body {
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-width: 82%;
}

.sp-msg__body--r {
    align-items: flex-end;
}

.sp-msg__meta {
    display: flex;
    align-items: center;
    gap: 8px;
}

.sp-msg__meta--r {
    justify-content: flex-end;
}

.sp-msg__who {
    font-size: 9.5px;
    font-family: 'IBM Plex Mono', monospace;
    color: #64748b;
    letter-spacing: 0.05em;
}

.sp-msg__time {
    font-size: 9.5px;
    font-family: 'IBM Plex Mono', monospace;
    color: #475569;
}

.sp-msg__bubble {
    padding: 12px 15px;
    border-radius: 12px;
    font-size: 13.5px;
    line-height: 1.7;
    color: #cbd5e1;
}

.sp-msg__bubble--ai {
    background: #1a1830;
    border: 1px solid #2d2b5e;
    border-top-left-radius: 4px;
}

.sp-msg__bubble--cand {
    background: linear-gradient(135deg, #1c2038, #1a2035);
    border: 1px solid #2d3a55;
    border-top-right-radius: 4px;
    text-align: left;
}

.sp-empty {
    text-align: center;
    color: #475569;
    font-size: 13px;
    padding: 40px;
}

/* ── Summary ───────────────────────────────────────── */
.sp-summary {
    padding: 14px 18px 0;
    font-size: 13px;
    line-height: 1.75;
    color: #94a3b8;
    margin: 0;
}

.sp-radar {
    display: flex;
    justify-content: center;
    padding: 10px 0 6px;
}

/* ── Score rows ────────────────────────────────────── */
.sp-scores {
    padding: 10px 18px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.sp-score-row {
    cursor: pointer;
}

.sp-score-row__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 5px;
}

.sp-score-row__label {
    font-size: 11px;
    font-family: 'IBM Plex Mono', monospace;
    color: #94a3b8;
    letter-spacing: 0.04em;
}

.sp-score-row__right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.sp-score-row__tag {
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 4px;
    font-weight: 600;
}

.sp-score-row__num {
    font-size: 13px;
    font-weight: 700;
    font-family: 'IBM Plex Mono', monospace;
}

.sp-score-row__bar-bg {
    height: 4px;
    background: #1e1b4b;
    border-radius: 4px;
    overflow: hidden;
}

.sp-score-row__bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.8s ease;
}

.sp-evidence {
    margin-top: 8px;
    padding: 10px 12px;
    background: #0f0e1a;
    border: 1px solid #2d2b5e;
    border-radius: 8px;
    font-size: 12px;
    line-height: 1.65;
    color: #64748b;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ── Lists ─────────────────────────────────────────── */
.sp-list {
    margin: 0;
    padding: 12px 18px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    list-style: none;
}

.sp-list__item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-size: 13px;
    line-height: 1.6;
    color: #94a3b8;
}

.sp-list__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 6px;
}

.sp-list__dot--green {
    background: #34d399;
}

.sp-list__dot--pink {
    background: #f472b6;
}

/* ── Stats ─────────────────────────────────────────── */
.sp-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
}

.sp-stat {
    background: linear-gradient(135deg, #13122a, #1a1830);
    border: 1px solid #2d2b5e;
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.sp-stat__lbl {
    font-size: 9px;
    font-family: 'IBM Plex Mono', monospace;
    letter-spacing: 0.08em;
    color: #64748b;
    font-weight: 600;
}

.sp-stat__val {
    font-size: 24px;
    font-weight: 700;
    color: #e2e8f0;
}

.sp-stat__val--purple {
    color: #6366f1;
}

/* ── PDF btn ───────────────────────────────────────── */
.sp-btn-pdf {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: #13122a;
    border: 1px solid #2d2b5e;
    border-radius: 10px;
    color: #94a3b8;
    font-size: 13px;
    font-family: 'Be Vietnam Pro', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
}

.sp-btn-pdf:hover {
    border-color: #6366f1;
    color: #6366f1;
    background: #1e1b4b;
}
</style>