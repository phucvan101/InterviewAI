<template>
    <LayoutInterview>
        <div class="interview-shell">
            <!-- ── History mode ─────────────────────────────────────────── -->
            <InterviewHistory v-if="isHistoryMode" :items="historyItems" :is-loading="isHistoryLoading" :page="page"
                :page-size="pageSize" :total="historyTotal" :total-pages="historyTotalPages" :status="historyStatus"
                @refresh="fetchHistory" @open="openSession" @goto="goToHistoryPage" @delete="deleteSession"
                @reset="resetHistoryPage" @update:status="historyStatus = $event" @update:page-size="pageSize = $event"
                @update:search="searchQuery = $event" />

            <!-- ── Chat / live interview mode ────────────────────────────── -->
            <InterviewChat v-else :title="conversationTitle" :messages="normalizedMessages" :result="result"
                :is-loading-session="isLoadingSession" :is-ai-loading="isAiLoading" :is-ai-typing="isAiTyping"
                :is-ending="isEnding" :is-ended="isEnded" :is-listening="isListening"
                :speech-supported="speechSupported" :can-get-question="canGetQuestion" :elapsed-time="elapsedTime"
                :speech-text-buffer="speechTextBuffer" @back="router.push('/conversation')" @end="endInterview"
                @get-question="getNextQuestion" @send="sendAnswer" @toggle-mic="toggleListening"
                @stop-mic="stopListening" />
        </div>
    </LayoutInterview>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScroll, useSpeechRecognition } from '@vueuse/core'
import { ElMessage, ElNotification } from 'element-plus'

import LayoutInterview from '../layouts/LayoutInterview.vue'
import InterviewHistory from './InterviewHistory.vue'
import InterviewChat from './InterviewChat.vue'

import { useAuthStore } from '@/stores/auth'
import { useSpeechSynthesis } from '@/composables/useSpeech'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// ─── Session state ────────────────────────────────────────────────────────────
const session = ref(null)
const messages = ref([])
const result = ref(null)
const score = ref(null)
const status = ref('')
const isLoadingSession = ref(false)
const isAiLoading = ref(false)
const isAiTyping = ref(false)
const isEnding = ref(false)
const startedAt = ref(Date.now())
const now = ref(Date.now())

// ─── History state ────────────────────────────────────────────────────────────
const historyItems = ref([])
const historyStatus = ref('')
const searchQuery = ref('')
const isHistoryLoading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const historyTotal = ref(0)
const historyTotalPages = ref(1)

// ─── Speech ───────────────────────────────────────────────────────────────────
const { speak } = useSpeechSynthesis()
const {
    isSupported: speechSupported,
    isListening,
    result: speechResult,
    start: startListening,
    stop: stopListening,
} = useSpeechRecognition({ lang: 'vi-VN', continuous: true, interimResults: true })

// ─── Computed ─────────────────────────────────────────────────────────────────
const isHistoryMode = computed(() => !route.params.sessionId)
const sessionId = computed(() => route.params.sessionId)
const conversationTitle = computed(() =>
    session.value?.title || session.value?.job_title || 'Phiên phỏng vấn'
)
const isEnded = computed(() =>
    ['completed', 'ended', 'finished'].includes(normalizeStatus(status.value))
)
const lastMessageRole = computed(() => normalizedMessages.value.at(-1)?.role || '')
const canGetQuestion = computed(() => lastMessageRole.value !== 'interviewer')

const elapsedTime = computed(() => {
    const diff = Math.max(0, Math.floor((now.value - startedAt.value) / 1000))
    const mm = String(Math.floor(diff / 60)).padStart(2, '0')
    const ss = String(diff % 60).padStart(2, '0')
    return `${mm}:${ss}`
})

const normalizedMessages = computed(() =>
    messages.value.map((msg, index) => {
        const role = normalizeRole(msg.role || msg.sender)
        return {
            ...msg,
            role,
            content: msg.content || msg.message || msg.question || msg.answer || '',
            localId: msg.id || msg.message_id || `${role}-${index}`,
        }
    })
)

// ─── Lifecycle ────────────────────────────────────────────────────────────────
let clock = null

onMounted(async () => {
    // ✅ Khởi động clock tạm thời, fetchSession sẽ clear nếu cần
    clock = window.setInterval(() => { now.value = Date.now() }, 1000)
    await nextTick()

    const token = localStorage.getItem('access_token')
        || localStorage.getItem('token')
        || authStore.token

    if (!token) {
        ElNotification.error({
            title: 'Phiên đăng nhập hết hạn',
            message: 'Vui lòng đăng nhập lại',
            duration: 3000,
        })
        router.push('/login')
        return
    }

    if (isHistoryMode.value) fetchHistory()
    else await fetchSession() // ✅ await để fetchSession có cơ hội clear clock trước khi mounted xong
})

onBeforeUnmount(() => {
    if (clock) window.clearInterval(clock)
    stopListening()
})

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(() => route.params.sessionId, () => {
    result.value = null
    if (isHistoryMode.value) fetchHistory()
    else fetchSession()
})

watch(speechResult, (value) => {
    if (value && isListening.value) {
        speechTextBuffer.value += (speechTextBuffer.value ? ' ' : '') + value
    }
})

// Buffer used to pass recognised speech down to the chat form.
const speechTextBuffer = ref('')

// ─── API helper ───────────────────────────────────────────────────────────────
async function apiRequest(path, options = {}) {
    return authStore.authorizedRequest(path, options)
}

// ─── History ──────────────────────────────────────────────────────────────────
async function fetchHistory() {
    isHistoryLoading.value = true
    try {
        const params = new URLSearchParams({
            page: String(page.value),
            page_size: String(pageSize.value),
        })
        if (historyStatus.value) params.set('status', historyStatus.value)
        if (searchQuery.value) params.set('job_position', searchQuery.value)

        const response = await apiRequest(`/api/v1/conversations/?${params.toString()}`)
        const payload = extractListPayload(response)
        historyItems.value = payload.items

        const pagination = parseHistoryPagination(payload.meta, {
            page: page.value,
            pageSize: pageSize.value,
            total: payload.items.length,
        })
        page.value = pagination.page
        pageSize.value = pagination.pageSize
        historyTotal.value = pagination.total
        historyTotalPages.value = pagination.totalPages
    } catch (err) {
        ElMessage.error(err.message || 'Không thể tải lịch sử phỏng vấn')
    } finally {
        isHistoryLoading.value = false
    }
}

const deleteSession = async (item) => {
    const id = item.id
    if (!id) return
    try {
        await apiRequest(`/api/v1/conversations/${id}`, { method: 'DELETE' })
        ElNotification.success({ title: `Đã xóa phiên phỏng vấn thành công vị trí ${item.job_position}` })
        window.dispatchEvent(new CustomEvent('conversations:updated'))
        fetchHistory()
    } catch (err) {
        ElMessage.error(err.message || 'Không thể xóa phiên phỏng vấn')
    }
}

function resetHistoryPage() {
    page.value = 1
    fetchHistory()
}

function goToHistoryPage(nextPage) {
    const target = Math.min(Math.max(Number(nextPage) || 1, 1), historyTotalPages.value)
    if (target === page.value || isHistoryLoading.value) return
    page.value = target
    fetchHistory()
}

function openSession(item) {
    const id = item.session_id || item.id || item.conversation_id
    if (id) router.push(`/interview/${id}`)
}

// ─── Session ──────────────────────────────────────────────────────────────────
async function fetchSession() {
    if (!sessionId.value) return
    isLoadingSession.value = true
    try {
        const response = await apiRequest(`/api/v1/conversations/${sessionId.value}`)
        const payload = response?.data || response || {}
        session.value = payload
        status.value = payload.status || ''
        score.value = payload.score
        messages.value = payload.messages || []
        startedAt.value = payload.created_at
            ? new Date(payload.created_at).getTime()
            : Date.now()

        if (isEnded.value) {
            // ✅ Freeze đồng hồ tại thời điểm session kết thúc
            if (payload.ended_at) {
                now.value = new Date(payload.ended_at).getTime()
            }
            // ✅ Stop clock, không để nó tick nữa
            if (clock) {
                window.clearInterval(clock)
                clock = null
            }
            result.value = payload
        }
    } catch (err) {
        ElMessage.error(err.message || 'Không thể mở phiên phỏng vấn')
    } finally {
        isLoadingSession.value = false
    }
}

// ─── Interview actions ────────────────────────────────────────────────────────
async function getNextQuestion() {
    if (!canGetQuestion.value) {
        ElMessage.warning('Chờ ứng viên trả lời trước khi lấy câu hỏi mới.')
        return
    }
    await withAiLoading(async () => {
        const response = await apiRequest(
            `/api/v1/conversations/${sessionId.value}/next-question`,
            { method: 'POST' }
        )
        appendInterviewerQuestion(response)
    })
}

async function sendAnswer(answer) {
    const text = (answer || '').trim()
    if (!text || isAiLoading.value || isEnded.value) return

    stopListening()
    messages.value.push({
        role: 'candidate',
        content: text,
        created_at: new Date().toISOString(),
        id: `candidate-${Date.now()}`,
    })

    await withAiLoading(async () => {
        const response = await apiRequest(
            `/api/v1/conversations/${sessionId.value}/answer`,
            { method: 'POST', body: { answer: text } }
        )
        appendInterviewerQuestion(response)
    })
}

async function endInterview() {
    if (isEnded.value) return

    isEnding.value = true
    try {
        const response = await apiRequest(`/api/v1/conversations/${sessionId.value}/analysis-report`, {
            method: 'POST',
        })
        const payload = response?.data || response || {}
        result.value = payload
        score.value = payload.score
        status.value = payload.status || 'completed'

        // ✅ Dừng đồng hồ
        if (clock) {
            window.clearInterval(clock)
            clock = null
        }

        ElNotification.success({
            title: 'Kết quả phỏng vấn',
        })

        router.push(`/analysis-reports/${sessionId.value}`)

    } catch (err) {
        ElNotification.error({
            title: 'Lỗi',
            message: err.message || 'Không thể kết thúc phỏng vấn',
            duration: 3000,
        })
    } finally {
        isEnding.value = false
    }
}

async function withAiLoading(task) {
    isAiLoading.value = true
    isAiTyping.value = true
    try {
        await task()
    } catch (err) {
        if (err.status === 400) {
            ElMessage.warning(err.message || 'Chờ ứng viên trả lời trước khi lấy câu hỏi mới.')
        } else {
            ElMessage.error(err.message || 'AI chưa trả về câu hỏi.')
        }
    } finally {
        isAiLoading.value = false
        isAiTyping.value = false
    }
}

function appendInterviewerQuestion(response) {
    const payload = response?.data || response || {}
    const question = payload.question || payload.content || payload.message
    if (!question) return
    messages.value.push({
        role: 'interviewer',
        content: question,
        message_id: payload.message_id,
        created_at: new Date().toISOString(),
    })
    // speak(question)
}

function toggleListening() {
    if (isListening.value) stopListening()
    else startListening()
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────
function normalizeRole(role) {
    return (role === 'candidate' || role === 'user') ? 'candidate' : 'interviewer'
}

function normalizeStatus(value = '') {
    const v = String(value).toLowerCase()
    if (['completed', 'ended', 'finished'].includes(v)) return 'completed'
    if (['active', 'in_progress', 'live'].includes(v)) return 'active'
    return v || 'active'
}

function extractListPayload(response) {
    const payload = response?.data ?? response
    if (Array.isArray(payload)) return { items: payload, meta: {} }
    const items = payload?.items || payload?.results || payload?.rows || payload?.data || []
    return { items: Array.isArray(items) ? items : [], meta: payload || {} }
}

function toNumber(value, fallback = 0) {
    const n = Number(value)
    return Number.isFinite(n) ? n : fallback
}

function parseHistoryPagination(meta = {}, fallback = {}) {
    const p = meta.pagination || meta.meta || {}
    const currentPage = Math.max(1, toNumber(
        meta.page ?? meta.current_page ?? p.page ?? p.current_page,
        fallback.page || 1,
    ))
    const currentPageSize = Math.max(1, toNumber(
        meta.page_size ?? meta.limit ?? p.page_size ?? p.limit,
        fallback.pageSize || 10,
    ))
    const total = Math.max(0, toNumber(
        meta.total ?? meta.total_items ?? meta.count ?? p.total ?? p.total_items ?? p.count,
        fallback.total || 0,
    ))
    const totalPages = Math.max(1, toNumber(
        meta.total_pages ?? p.total_pages,
        Math.ceil(total / currentPageSize) || 1,
    ))
    return { page: Math.min(currentPage, totalPages), pageSize: currentPageSize, total, totalPages }
}
</script>

<style scoped>
.interview-shell {
    flex: 1;
    min-width: 0;
    display: flex;
    background:
        radial-gradient(circle at 52% 30%, rgba(79, 70, 229, 0.12), transparent 34%),
        #090b13;
    color: #fff;
}
</style>