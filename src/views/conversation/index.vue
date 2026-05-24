<template>
    <LayoutInterview>
        <div class="interview-shell">
            <section v-if="isHistoryMode" class="history-page">
                <header class="page-header">
                    <div>
                        <p class="eyebrow">Lịch sử luyện phỏng vấn</p>
                        <h1>Phiên phỏng vấn</h1>
                    </div>
                    <button class="icon-button" title="Tải lại lịch sử" @click="fetchHistory">
                        <RefreshCw :size="18" />
                    </button>
                </header>

                <div class="history-filters">
                    <select v-model="historyStatus" class="field" @change="resetHistoryPage">
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang phỏng vấn</option>
                        <option value="completed">Đã kết thúc</option>
                        <option value="ended">Đã kết thúc</option>
                    </select>
                    <select v-model.number="pageSize" class="field" @change="resetHistoryPage">
                        <option :value="10">10 phiên</option>
                        <option :value="20">20 phiên</option>
                        <option :value="50">50 phiên</option>
                    </select>
                </div>

                <div v-if="isHistoryLoading" class="empty-state">
                    <Brain :size="28" />
                    <span>Đang tải lịch sử...</span>
                </div>

                <div v-else-if="historyItems.length === 0" class="empty-state">
                    <History :size="28" />
                    <span>Chưa có phiên phỏng vấn nào.</span>
                </div>

                <div v-else class="history-list">
                    <Motion v-for="item in historyItems" :key="getSessionId(item)" :initial="{ opacity: 0, y: 12 }"
                        :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.22 }">
                        <button class="history-row" @click="openSession(item)">
                            <div>
                                <strong>{{ formatDate(item.created_at) }}</strong>
                                <span>{{ item.message_count ?? item.total_messages ?? 0 }} tin nhắn</span>
                            </div>
                            <div class="history-meta">
                                <span class="status-pill" :class="normalizeStatus(item.status)">
                                    {{ labelStatus(item.status) }}
                                </span>
                                <span class="score">{{ item.score ?? '--' }}</span>
                            </div>
                            <ChevronRight :size="18" />
                        </button>
                    </Motion>
                </div>

                <footer v-if="historyTotal > 0" class="history-pagination">
                    <div class="pagination-summary">
                        Hiển thị {{ historyStartItem }}-{{ historyEndItem }} / {{ historyTotal }} phiên
                    </div>
                    <div class="pagination-controls">
                        <button class="page-button" :disabled="page <= 1 || isHistoryLoading"
                            @click="goToHistoryPage(page - 1)">
                            <ChevronLeft :size="16" />
                        </button>
                        <button v-for="pageNumber in visibleHistoryPages" :key="pageNumber" class="page-button"
                            :class="{ active: pageNumber === page }" :disabled="isHistoryLoading"
                            @click="goToHistoryPage(pageNumber)">
                            {{ pageNumber }}
                        </button>
                        <button class="page-button" :disabled="page >= historyTotalPages || isHistoryLoading"
                            @click="goToHistoryPage(page + 1)">
                            <ChevronRight :size="16" />
                        </button>
                    </div>
                </footer>
            </section>

            <section v-else class="chat-page">
                <header class="call-header">
                    <button class="ghost-button" title="Quay lại lịch sử" @click="router.push('/conversation')">
                        <ArrowLeft :size="20" />
                    </button>
                    <div class="call-title">
                        <p>Phỏng vấn cho vị trí</p>
                        <h1>{{ conversationTitle }}</h1>
                    </div>
                    <div class="live-pill">
                        <span />
                        Trực tiếp {{ elapsedTime }}
                    </div>
                    <button class="ghost-button settings" title="Cài đặt">
                        <Settings :size="20" />
                    </button>
                    <button class="end-button" :disabled="isEnded || isEnding" @click="endInterview">
                        {{ isEnding ? 'Đang kết thúc...' : 'Kết thúc' }}
                    </button>
                </header>

                <div v-if="isLoadingSession" class="center-stage">
                    <Brain :size="42" />
                    <p>Đang mở phiên phỏng vấn...</p>
                </div>

                <template v-else>
                    <main ref="chatScrollRef" class="chat-scroll">
                        <section v-if="isAiLoading" class="ai-stage">
                            <AudioLines :size="34" />
                            <div ref="waveformRef" class="waveform" />
                            <p>AI đang phân tích và chuẩn bị câu hỏi...</p>
                        </section>

                        <div class="messages">
                            <Motion v-for="message in normalizedMessages" :key="message.localId"
                                :initial="{ opacity: 0, y: 14, scale: 0.98 }" :animate="{ opacity: 1, y: 0, scale: 1 }"
                                :transition="{ duration: 0.22 }">
                                <article class="message-row" :class="message.role">
                                    <div v-if="message.role === 'interviewer'" class="avatar ai-avatar">
                                        <Bot :size="20" />
                                    </div>
                                    <div class="bubble-wrap">
                                        <div class="message-meta">
                                            {{ message.role === 'interviewer' ? 'AI Phỏng vấn' : 'Bạn' }}
                                            <span>{{ formatTime(message.created_at) }}</span>
                                        </div>
                                        <p class="chat-bubble">{{ message.content }}</p>
                                    </div>
                                    <div v-if="message.role === 'candidate'" class="avatar user-avatar">
                                        <User :size="18" />
                                    </div>
                                </article>
                            </Motion>

                            <article v-if="isAiTyping" class="message-row interviewer">
                                <div class="avatar ai-avatar">
                                    <Bot :size="20" />
                                </div>
                                <div class="bubble-wrap">
                                    <div class="message-meta">AI Phỏng vấn</div>
                                    <div class="typing-bubble">
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                </div>
                            </article>
                        </div>

                        <section v-if="result" class="result-panel">
                            <div>
                                <p class="eyebrow">Kết quả</p>
                                <h2>{{ result.score ?? score ?? '--' }} điểm</h2>
                                <p>{{ 'Buổi phỏng vấn đã hoàn tất.' }}</p>
                                <p>{{ result.result?.comments }}</p>
                            </div>
                            <div class="result-grid">
                                <div>
                                    <strong>Điểm mạnh</strong>
                                    <span>{{ listResult(result.result?.strengths) }}</span>
                                </div>
                                <div>
                                    <strong>Cần cải thiện</strong>
                                    <span class="whitespace-pre-line">{{ listResult(result.result?.weaknesses) }}</span>
                                </div>
                                <div>
                                    <strong>Tổng tin nhắn</strong>
                                    <span>{{ result.total_messages }}</span>
                                </div>
                            </div>
                        </section>
                    </main>

                    <footer class="composer">
                        <div class="composer-actions">
                            <button class="mini-button" :disabled="!canGetQuestion || isAiLoading || isEnded"
                                title="Lấy câu hỏi tiếp theo" @click="getNextQuestion">
                                <Brain :size="18" />
                                <span>Get question</span>
                            </button>
                            <button class="mic-button" :class="{ listening: isListening }"
                                :disabled="isEnded || !speechSupported" title="Nhập bằng giọng nói"
                                @click="toggleListening">
                                <Mic :size="24" />
                            </button>
                            <button class="mini-button" :disabled="isEnded" title="Dừng ghi âm" @click="stopListening">
                                <MicOff :size="18" />
                                <span>Tắt mic</span>
                            </button>
                        </div>

                        <form class="answer-form" @submit.prevent="sendAnswer">
                            <textarea v-model="answerText" :disabled="isEnded || isAiLoading" rows="2"
                                placeholder="Nhập câu trả lời của bạn..." @keydown.enter.exact.prevent="sendAnswer" />
                            <button type="submit" class="send-button" :disabled="!canSendAnswer">
                                <Send :size="18" />
                                Gửi
                            </button>
                        </form>
                    </footer>
                </template>
            </section>
        </div>
    </LayoutInterview>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScroll, useSpeechRecognition } from '@vueuse/core'
import { Motion } from 'motion-v'
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
import {
    ArrowLeft,
    AudioLines,
    Bot,
    Brain,
    ChevronLeft,
    ChevronRight,
    History,
    Mic,
    MicOff,
    RefreshCw,
    Send,
    Settings,
    User,
} from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import LayoutInterview from '../layouts/LayoutInterview.vue'
import { useAuthStore } from '@/stores/auth'
import { useSpeechSynthesis } from '@/composables/useSpeech'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const session = ref(null)
const messages = ref([])
const result = ref(null)
const score = ref(null)
const status = ref('')
const answerText = ref('')
const isLoadingSession = ref(false)
const isAiLoading = ref(false)
const isAiTyping = ref(false)
const isEnding = ref(false)
const startedAt = ref(Date.now())
const now = ref(Date.now())
const historyItems = ref([])
const historyStatus = ref('')
const isHistoryLoading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const historyTotal = ref(0)
const historyTotalPages = ref(1)
const chatScrollRef = ref(null)
const waveformRef = ref(null)
const waveSurfer = ref(null)
const recordPlugin = ref(null)

const isHistoryMode = computed(() => !route.params.sessionId)
const sessionId = computed(() => route.params.sessionId)
const conversationTitle = computed(() => session.value?.title || session.value?.job_title || 'Phiên phỏng vấn')
const isEnded = computed(() => ['completed', 'ended', 'finished'].includes(normalizeStatus(status.value)))
const lastMessageRole = computed(() => normalizedMessages.value.at(-1)?.role || '')
const canGetQuestion = computed(() => lastMessageRole.value !== 'interviewer')
const canSendAnswer = computed(() => answerText.value.trim() && !isAiLoading.value && !isEnded.value)
const historyStartItem = computed(() => {
    if (!historyItems.value.length) return 0
    return (page.value - 1) * pageSize.value + 1
})
const historyEndItem = computed(() => {
    return Math.min(historyStartItem.value + historyItems.value.length - 1, historyTotal.value)
})
const visibleHistoryPages = computed(() => {
    const total = historyTotalPages.value
    const current = page.value
    const start = Math.max(1, current - 2)
    const end = Math.min(total, start + 4)
    const adjustedStart = Math.max(1, end - 4)

    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index)
})

const { speak, isSpeaking } = useSpeechSynthesis()

const {
    isSupported: speechSupported,
    isListening,
    result: speechResult,
    start: startListening,
    stop: stopListening,
} = useSpeechRecognition({
    lang: 'vi-VN',
    continuous: true,
    interimResults: true,
})

useScroll(chatScrollRef)

const normalizedMessages = computed(() => {
    return messages.value.map((message, index) => {
        const role = normalizeRole(message.role || message.sender)
        return {
            ...message,
            role,
            content: message.content || message.message || message.question || message.answer || '',
            localId: message.id || message.message_id || `${role}-${index}`,
        }
    })
})

const elapsedTime = computed(() => {
    const diff = Math.max(0, Math.floor((now.value - startedAt.value) / 1000))
    const minutes = String(Math.floor(diff / 60)).padStart(2, '0')
    const seconds = String(diff % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
})

let clock = null

onMounted(async () => {
    clock = window.setInterval(() => { now.value = Date.now() }, 1000)

    // Chờ auth store hydrate xong nếu cần
    await nextTick()

    // Kiểm tra token trước khi gọi API
    const token = localStorage.getItem('access_token')
        || localStorage.getItem('token')
        || authStore.token

    if (!token) {
        ElMessage.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại')
        router.push('/login')
        return
    }

    if (isHistoryMode.value) fetchHistory()
    else fetchSession()
})

onBeforeUnmount(() => {
    if (clock) window.clearInterval(clock)
    destroyWaveform()
    stopListening()
})

watch(() => route.params.sessionId, () => {
    result.value = null
    if (isHistoryMode.value) fetchHistory()
    else fetchSession()
})

watch(speechResult, (value) => {
    if (value && isListening.value) answerText.value = value
})

watch([messages, isAiTyping, result], () => {
    scrollToBottom()
}, { deep: true })

async function apiRequest(path, options = {}) {
    return authStore.authorizedRequest(path, options)
}

async function fetchHistory() {
    isHistoryLoading.value = true
    try {
        const params = new URLSearchParams({
            page: String(page.value),
            page_size: String(pageSize.value),
        })
        if (historyStatus.value) params.set('status', historyStatus.value)

        const url = `/api/v1/conversations/?${params.toString()}`
        console.log('Fetching URL:', url)

        const response = await apiRequest(url)
        console.log('Response:', response)

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
        console.log('Error status:', err.status)
        console.log('Error message:', err.message)
        console.log('Error data:', err.data)  // payload BE trả về
        ElMessage.error(err.message || 'Không thể tải lịch sử phỏng vấn')
    } finally {
        isHistoryLoading.value = false
    }
}

function resetHistoryPage() {
    page.value = 1
    fetchHistory()
}

function goToHistoryPage(nextPage) {
    const targetPage = Math.min(Math.max(Number(nextPage) || 1, 1), historyTotalPages.value)
    if (targetPage === page.value || isHistoryLoading.value) return
    page.value = targetPage
    fetchHistory()
}

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
        startedAt.value = payload.created_at ? new Date(payload.created_at).getTime() : Date.now()
        if (isEnded.value) {
            result.value = payload.result || {
                score: payload.score,
                total_messages: messages.value.length,
                status: payload.status,
            }
        }
    } catch (err) {
        ElMessage.error(err.message || 'Không thể mở phiên phỏng vấn')
    } finally {
        isLoadingSession.value = false
        scrollToBottom()
    }
}

async function getNextQuestion() {
    if (!canGetQuestion.value) {
        ElMessage.warning('Chờ ứng viên trả lời trước khi lấy câu hỏi mới.')
        return
    }

    await withAiLoading(async () => {
        const response = await apiRequest(`/api/v1/conversations/${sessionId.value}/next-question`, {
            method: 'POST',
        })
        appendInterviewerQuestion(response)
    })
}

async function sendAnswer() {
    const answer = answerText.value.trim()
    if (!answer || isAiLoading.value || isEnded.value) return

    answerText.value = ''
    stopListening()

    messages.value.push({
        role: 'candidate',
        content: answer,
        created_at: new Date().toISOString(),
        id: `candidate-${Date.now()}`,
    })

    await withAiLoading(async () => {
        const response = await apiRequest(`/api/v1/conversations/${sessionId.value}/answer`, {
            method: 'POST',
            body: { answer },
        })
        appendInterviewerQuestion(response)
    })
}

async function endInterview() {
    if (isEnded.value) return

    isEnding.value = true
    try {
        const response = await apiRequest(`/api/v1/conversations/${sessionId.value}/end`, {
            method: 'POST',
        })
        const payload = response?.data || response || {}
        result.value = payload
        score.value = payload.score
        status.value = payload.status || 'completed'

        if (clock) {
            window.clearInterval(clock)
            clock = null
        }

        ElMessage.success('Đã kết thúc phỏng vấn')
    } catch (err) {
        ElMessage.error(err.message || 'Không thể kết thúc phỏng vấn')
    } finally {
        isEnding.value = false
    }
}

async function withAiLoading(task) {
    isAiLoading.value = true
    isAiTyping.value = true
    await nextTick()
    initWaveform()

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
        destroyWaveform()
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

function openSession(item) {
    const id = getSessionId(item)
    if (id) router.push(`/interview/${id}`)
}

function toggleListening() {
    if (isListening.value) stopListening()
    else startListening()
}

function initWaveform() {
    destroyWaveform()
    if (!waveformRef.value) return

    waveSurfer.value = WaveSurfer.create({
        container: waveformRef.value,
        waveColor: '#22d3ee',
        progressColor: '#4f46e5',
        cursorWidth: 0,
        height: 72,
        barWidth: 5,
        barGap: 7,
        barRadius: 8,
    })

    recordPlugin.value = waveSurfer.value.registerPlugin(RecordPlugin.create({
        renderRecordedAudio: false,
        scrollingWaveform: true,
    }))
}

function destroyWaveform() {
    recordPlugin.value?.destroy?.()
    waveSurfer.value?.destroy?.()
    recordPlugin.value = null
    waveSurfer.value = null
}

function scrollToBottom() {
    nextTick(() => {
        if (!chatScrollRef.value) return
        chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
    })
}

function normalizeRole(role) {
    if (role === 'candidate' || role === 'user') return 'candidate'
    return 'interviewer'
}

function normalizeStatus(value = '') {
    const normalized = String(value).toLowerCase()
    if (['completed', 'ended', 'finished'].includes(normalized)) return 'completed'
    if (['active', 'in_progress', 'live'].includes(normalized)) return 'active'
    return normalized || 'active'
}

function labelStatus(value) {
    const normalized = normalizeStatus(value)
    if (normalized === 'completed') return 'Đã kết thúc'
    if (normalized === 'active') return 'Đang phỏng vấn'
    return value || 'Đang phỏng vấn'
}

function getSessionId(item) {
    return item.session_id || item.id || item.conversation_id
}

function extractListPayload(response) {
    const payload = response?.data ?? response
    if (Array.isArray(payload)) return { items: payload, meta: {} }

    const items = payload?.items || payload?.results || payload?.rows || payload?.data || []
    return {
        items: Array.isArray(items) ? items : [],
        meta: payload || {},
    }
}

function toNumber(value, fallback = 0) {
    const number = Number(value)
    return Number.isFinite(number) ? number : fallback
}

function parseHistoryPagination(meta = {}, fallback = {}) {
    const pagination = meta.pagination || meta.meta || {}
    const currentPage = Math.max(1, toNumber(
        meta.page ?? meta.current_page ?? pagination.page ?? pagination.current_page,
        fallback.page || 1,
    ))
    const currentPageSize = Math.max(1, toNumber(
        meta.page_size ?? meta.limit ?? pagination.page_size ?? pagination.limit,
        fallback.pageSize || 10,
    ))
    const total = Math.max(0, toNumber(
        meta.total ?? meta.total_items ?? meta.count ?? pagination.total ?? pagination.total_items ?? pagination.count,
        fallback.total || 0,
    ))
    const totalPages = Math.max(1, toNumber(
        meta.total_pages ?? pagination.total_pages,
        Math.ceil(total / currentPageSize) || 1,
    ))

    return {
        page: Math.min(currentPage, totalPages),
        pageSize: currentPageSize,
        total,
        totalPages,
    }
}

function formatDate(value) {
    if (!value) return 'Không rõ thời gian'
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

function formatTime(value) {
    if (!value) return ''
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
}

function listResult(value) {
    if (Array.isArray(value)) {
        return value.map(item => `• ${item}`).join('\n')
    }
    return value || 'Chưa có dữ liệu'
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

.history-page,
.chat-page {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.page-header,
.call-header {
    min-height: 84px;
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 18px 28px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(15, 18, 37, 0.78);
    backdrop-filter: blur(18px);
}

.page-header {
    justify-content: space-between;
}

.eyebrow,
.call-title p {
    margin: 0 0 3px;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

h1,
h2 {
    margin: 0;
    font-weight: 900;
    letter-spacing: 0;
}

.call-title {
    flex: 1;
    min-width: 0;
}

.call-title h1 {
    font-size: 22px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.live-pill {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 10px 18px;
    border-radius: 999px;
    background: rgba(2, 6, 23, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.07);
    color: #f8fafc;
    font-size: 13px;
    font-weight: 900;
    letter-spacing: 0.22em;
    text-transform: uppercase;
}

.live-pill span {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
}

.ghost-button,
.icon-button,
.mini-button,
.mic-button,
.send-button,
.end-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #dbeafe;
    background: rgba(255, 255, 255, 0.04);
    transition: 160ms ease;
}

.ghost-button,
.icon-button {
    width: 42px;
    height: 42px;
    border-radius: 12px;
}

.settings {
    margin-left: auto;
}

.end-button {
    min-height: 46px;
    padding: 0 20px;
    border-radius: 10px;
    color: #fecaca;
    background: rgba(127, 29, 29, 0.42);
    border-color: rgba(248, 113, 113, 0.35);
    font-weight: 900;
}

button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
}

button:not(:disabled):hover {
    transform: translateY(-1px);
    border-color: rgba(99, 102, 241, 0.48);
}

.chat-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 28px 34px 24px;
}

.center-stage,
.ai-stage,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #94a3b8;
    font-weight: 800;
}

.center-stage,
.empty-state {
    flex: 1;
}

.ai-stage {
    min-height: 260px;
    color: #22d3ee;
}

.waveform {
    width: min(520px, 72vw);
    min-height: 88px;
    border-radius: 18px;
    opacity: 0.95;
    background:
        repeating-linear-gradient(90deg,
            transparent 0 13px,
            rgba(34, 211, 238, 0.28) 13px 18px,
            transparent 18px 28px);
    animation: waveformMove 1.2s linear infinite;
}

.messages {
    display: flex;
    flex-direction: column;
    gap: 22px;
}

.message-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    max-width: 100%;
}

.message-row.candidate {
    justify-content: flex-end;
}

.avatar {
    width: 48px;
    height: 48px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.ai-avatar {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
}

.user-avatar {
    background: linear-gradient(135deg, #06b6d4, #2563eb);
}

.bubble-wrap {
    max-width: min(760px, 70%);
}

.message-row.candidate .bubble-wrap {
    text-align: right;
}

.message-meta {
    margin-bottom: 7px;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 800;
}

.message-meta span {
    margin-left: 6px;
    color: #64748b;
}

.chat-bubble {
    margin: 0;
    padding: 18px 22px;
    border-radius: 18px;
    background: #1b1d2e;
    border: 1px solid rgba(255, 255, 255, 0.07);
    color: #f8fafc;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.55;
    text-align: left;
}

.candidate .chat-bubble {
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    box-shadow: 0 14px 34px rgba(37, 99, 235, 0.28);
}

.typing-bubble {
    display: inline-flex;
    gap: 6px;
    padding: 16px 18px;
    border-radius: 18px;
    background: #1b1d2e;
}

.typing-bubble span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #93c5fd;
    animation: typing 900ms infinite ease-in-out;
}

.typing-bubble span:nth-child(2) {
    animation-delay: 140ms;
}

.typing-bubble span:nth-child(3) {
    animation-delay: 280ms;
}

.composer {
    padding: 18px 34px 28px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(9, 11, 19, 0.9);
}

.composer-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 14px;
}

.mini-button {
    min-height: 44px;
    padding: 0 16px;
    border-radius: 14px;
    color: #cbd5e1;
    font-weight: 900;
}

.mic-button {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    box-shadow: 0 0 34px rgba(79, 70, 229, 0.75);
}

.mic-button.listening {
    animation: pulse 1.2s infinite;
}

.answer-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
}

.answer-form textarea,
.field {
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 14px;
    outline: none;
    background: #111827;
    color: #fff;
}

.answer-form textarea {
    min-height: 58px;
    resize: none;
    padding: 14px 16px;
    font-weight: 700;
    line-height: 1.45;
}

.send-button {
    min-width: 112px;
    border-radius: 14px;
    background: #4f46e5;
    color: #fff;
    font-weight: 900;
}

.history-filters {
    display: flex;
    gap: 12px;
    padding: 22px 28px 0;
}

.field {
    max-width: 220px;
    padding: 11px 12px;
}

.history-list {
    display: grid;
    gap: 12px;
    padding: 22px 28px 28px;
}

.history-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0 28px 28px;
    color: #94a3b8;
}

.pagination-summary {
    font-size: 13px;
    font-weight: 700;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.page-button {
    min-width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background: #111827;
    color: #cbd5e1;
    font-weight: 900;
}

.page-button:hover:not(:disabled),
.page-button.active {
    border-color: rgba(99, 102, 241, 0.45);
    background: #4f46e5;
    color: #fff;
}

.page-button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
}

.history-row {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 18px;
    padding: 18px;
    border-radius: 14px;
    background: #111827;
    border: 1px solid rgba(255, 255, 255, 0.07);
    color: #fff;
    text-align: left;
}

.history-row strong,
.history-row span {
    display: block;
}

.history-row span {
    margin-top: 4px;
    color: #94a3b8;
    font-size: 13px;
}

.history-meta {
    display: flex;
    align-items: center;
    gap: 12px;
}

.status-pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    color: #bae6fd;
    background: rgba(14, 165, 233, 0.13);
    border: 1px solid rgba(14, 165, 233, 0.22);
    font-size: 12px;
    font-weight: 900;
}

.status-pill.completed {
    color: #86efac;
    background: rgba(34, 197, 94, 0.13);
    border-color: rgba(34, 197, 94, 0.22);
}

.score {
    min-width: 52px;
    color: #f8fafc;
    font-size: 18px;
    font-weight: 950;
    text-align: right;
}

.result-panel {
    margin-top: 28px;
    padding: 24px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.92));
    border: 1px solid rgba(96, 165, 250, 0.22);
}

.result-panel h2 {
    margin: 4px 0;
    font-size: 44px;
    color: #93c5fd;
}

.result-panel p {
    color: #cbd5e1;
}

.result-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
}

.result-grid div {
    padding: 14px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.04);
}

.result-grid strong,
.result-grid span {
    display: block;
}

.result-grid strong {
    margin-bottom: 8px;
    color: #fff;
}

.result-grid span {
    color: #94a3b8;
    line-height: 1.45;
}

@keyframes typing {

    0%,
    80%,
    100% {
        transform: translateY(0);
        opacity: 0.45;
    }

    40% {
        transform: translateY(-5px);
        opacity: 1;
    }
}

@keyframes pulse {

    0%,
    100% {
        box-shadow: 0 0 28px rgba(79, 70, 229, 0.66);
    }

    50% {
        box-shadow: 0 0 48px rgba(34, 211, 238, 0.85);
    }
}

@keyframes waveformMove {
    from {
        background-position-x: 0;
    }

    to {
        background-position-x: 56px;
    }
}

@media (max-width: 900px) {
    .call-header {
        flex-wrap: wrap;
    }

    .live-pill {
        order: 3;
        width: 100%;
        justify-content: center;
    }

    .bubble-wrap {
        max-width: 84%;
    }

    .answer-form,
    .result-grid {
        grid-template-columns: 1fr;
    }

    .history-row {
        grid-template-columns: 1fr;
    }

    .history-meta {
        justify-content: space-between;
    }

    .history-pagination {
        align-items: stretch;
        flex-direction: column;
    }

    .pagination-controls {
        flex-wrap: wrap;
    }
}
</style>
