<template>
    <section class="chat-page">
        <header class="call-header">
            <button class="ghost-button" title="Quay lại lịch sử" @click="$emit('back')">
                <ArrowLeft :size="20" />
            </button>
            <div class="call-title">
                <p>Phỏng vấn cho vị trí</p>
                <h1>{{ title }}</h1>
            </div>
            <div class="live-pill">
                <span />
                Trực tiếp {{ elapsedTime }}
            </div>
            <button class="ghost-button settings" title="Cài đặt">
                <Settings :size="20" />
            </button>
            <button class="end-button" :disabled="isEnded || isEnding" @click="$emit('end')">
                {{ isEnding ? 'Đang kết thúc...' : 'Kết thúc' }}
            </button>
        </header>

        <!-- Loading session -->
        <div v-if="isLoadingSession" class="center-stage">
            <Brain :size="42" />
            <p>Đang mở phiên phỏng vấn...</p>
        </div>

        <template v-else>
            <main ref="chatScrollRef" class="chat-scroll">
                <!-- AI thinking state -->
                <section v-if="isAiLoading" class="ai-stage">
                    <AudioLines :size="34" />
                    <div ref="waveformRef" class="waveform" />
                    <p>AI đang phân tích và chuẩn bị câu hỏi...</p>
                </section>

                <!-- Messages -->
                <div class="messages">
                    <Motion v-for="message in messages" :key="message.localId"
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

                    <!-- Typing indicator -->
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

                <!-- Result panel -->
                <section v-if="result" class="result-panel">
                    <div class="result-header">
                        <div class="result-score-block">
                            <p class="eyebrow">Kết quả phỏng vấn</p>
                            <div class="result-score-row">
                                <h2>{{ result.score ?? '--' }}</h2>
                                <span class="score-unit">/ 100 điểm</span>
                            </div>
                            <p class="result-sub">Buổi phỏng vấn đã hoàn tất.</p>
                            <p v-if="result.result?.comments" class="result-comment">
                                {{ result.result.comments }}
                            </p>
                        </div>

                        <RouterLink :to="`/analysis-reports/${result.session_id}`" class="report-link">
                            <span>Xem báo cáo chi tiết</span>
                            <i class="ti ti-arrow-right" />
                        </RouterLink>
                    </div>
                </section>
            </main>

            <!-- Composer -->
            <footer class="composer">
                <div class="composer-actions">
                    <button class="mini-button" :disabled="!canGetQuestion || isAiLoading || isEnded"
                        title="Lấy câu hỏi tiếp theo" @click="$emit('get-question')">
                        <Brain :size="18" />
                        <span>Get question</span>
                    </button>
                    <button v-if="isSpeaking" class="mini-button skip-button" title="Bỏ qua giọng đọc AI"
                        @click="$emit('skip-tts')">
                        <SkipForward :size="18" />
                        <span>Skip</span>
                    </button>
                    <button class="mic-button" :class="{ listening: isListening }"
                        :disabled="isEnded || !speechSupported" title="Nhập bằng giọng nói"
                        @click="$emit('toggle-mic')">
                        <Mic :size="24" />
                    </button>
                    <button class="mini-button" :disabled="isEnded" title="Dừng ghi âm" @click="$emit('stop-mic')">
                        <MicOff :size="18" />
                        <span>Tắt mic</span>
                    </button>
                </div>

                <form class="answer-form" @submit.prevent="$emit('send', answerText); answerText = ''">
                    <textarea v-model="answerText" :disabled="isEnded || isAiLoading" rows="2"
                        placeholder="Nhập câu trả lời của bạn..."
                        @keydown.enter.exact.prevent="$emit('send', answerText); answerText = ''" />
                    <button type="submit" class="send-button" :disabled="!canSend">
                        <Send :size="18" />
                        Gửi
                    </button>
                </form>
            </footer>
        </template>
    </section>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Motion } from 'motion-v'
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
import {
    ArrowLeft, AudioLines, Bot, Brain,
    Mic, MicOff, Send, Settings, SkipForward, User,
} from 'lucide-vue-next'

// ─── Props ───────────────────────────────────────────────────────────────────
const props = defineProps({
    title: { type: String, default: 'Phiên phỏng vấn' },
    messages: { type: Array, default: () => [] },
    result: { type: Object, default: null },
    isLoadingSession: { type: Boolean, default: false },
    isAiLoading: { type: Boolean, default: false },
    isAiTyping: { type: Boolean, default: false },
    isEnding: { type: Boolean, default: false },
    isEnded: { type: Boolean, default: false },
    isListening: { type: Boolean, default: false },
    isSpeaking: { type: Boolean, default: false },
    speechSupported: { type: Boolean, default: false },
    canGetQuestion: { type: Boolean, default: false },
    elapsedTime: { type: String, default: '00:00' },
    speechTextBuffer: { type: String, default: '' },
})

// ─── Emits ────────────────────────────────────────────────────────────────────
defineEmits(['back', 'end', 'get-question', 'send', 'toggle-mic', 'stop-mic', 'skip-tts'])

// ─── Local state ──────────────────────────────────────────────────────────────
const answerText = ref('')
const chatScrollRef = ref(null)
const waveformRef = ref(null)
const waveSurfer = ref(null)
const recordPlugin = ref(null)

const canSend = computed(() =>
    answerText.value.trim() && !props.isAiLoading && !props.isEnded
)

// ─── Scroll to bottom on new messages ────────────────────────────────────────
watch([() => props.messages, () => props.isAiTyping, () => props.result], () => {
    scrollToBottom()
}, { deep: true })

// ─── Waveform (exposed so parent can control via isAiLoading watcher) ─────────
watch(() => props.isAiLoading, (loading) => {
    if (loading) {
        nextTick(() => initWaveform())
    } else {
        destroyWaveform()
    }
})

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

function formatTime(value) {
    if (!value) return ''
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
}

function listResult(value) {
    if (Array.isArray(value)) return value.map(item => `• ${item}`).join('\n')
    return value || 'Chưa có dữ liệu'
}

watch(() => props.speechTextBuffer, (newText) => {
    if (newText) {
        answerText.value = newText
    }
})
</script>

<style scoped>
.chat-page {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

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

.call-title {
    flex: 1;
    min-width: 0;
}

.call-title p {
    margin: 0 0 3px;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.call-title h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
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

.ghost-button {
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
.ai-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #94a3b8;
    font-weight: 800;
}

.center-stage {
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
    font-size: 14px;
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

.skip-button {
    color: #fef3c7;
    border-color: rgba(245, 158, 11, 0.34);
    background: rgba(245, 158, 11, 0.12);
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

.answer-form textarea {
    width: 100%;
    min-height: 58px;
    resize: none;
    padding: 14px 16px;
    font-weight: 700;
    line-height: 1.45;
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 14px;
    outline: none;
    background: #111827;
    color: #fff;
}

.send-button {
    min-width: 112px;
    border-radius: 14px;
    background: #4f46e5;
    color: #fff;
    font-weight: 900;
}

.result-panel {
    margin-top: 28px;
    padding: 24px 28px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.92));
    border: 1px solid rgba(96, 165, 250, 0.18);
}

.result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
}

.result-score-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.result-score-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.result-panel h2 {
    margin: 0;
    font-size: 48px;
    font-weight: 900;
    color: #93c5fd;
    line-height: 1;
}

.score-unit {
    font-size: 15px;
    font-weight: 600;
    color: #64748b;
}

.result-sub {
    margin: 0;
    color: #94a3b8;
    font-size: 13px;
}

.result-comment {
    margin: 0;
    color: #cbd5e1;
    font-size: 14px;
    line-height: 1.6;
    max-width: 480px;
}

.report-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 12px;
    background: rgba(99, 102, 241, 0.12);
    border: 1px solid rgba(99, 102, 241, 0.35);
    color: #a5b4fc;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    transition: 150ms ease;
    flex-shrink: 0;
}

.report-link:hover {
    background: rgba(99, 102, 241, 0.22);
    border-color: rgba(99, 102, 241, 0.6);
    color: #c7d2fe;
    transform: translateX(2px);
}

.report-link .ti {
    font-size: 16px;
    transition: transform 150ms ease;
}

.report-link:hover .ti {
    transform: translateX(3px);
}

.eyebrow {
    margin: 0 0 6px;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
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
}
</style>
