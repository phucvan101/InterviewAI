<template>
    <section class="history-page">
        <header class="page-header">
            <div>
                <p class="eyebrow">Lịch sử luyện phỏng vấn</p>
                <h1>Phiên phỏng vấn</h1>
            </div>
            <button class="icon-button" title="Tải lại lịch sử" @click="$emit('refresh')">
                <RefreshCw :size="18" />
            </button>
        </header>

        <div class="history-filters">
            <input class="field" v-model="searchQuery" placeholder="Tìm kiếm theo vị trí"
                @keyup.enter="$emit('update:search', searchQuery); $emit('reset')"></input>

            <select v-model="localStatus" class="field" @change="$emit('update:status', localStatus); $emit('reset')">
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang phỏng vấn</option>
                <option value="completed">Đã kết thúc</option>
            </select>
            <select v-model.number="localPageSize" class="field"
                @change="$emit('update:pageSize', localPageSize); $emit('reset')">
                <option :value="10">10 phiên</option>
                <option :value="20">20 phiên</option>
                <option :value="50">50 phiên</option>
            </select>
        </div>

        <div v-if="isLoading" class="empty-state">
            <Brain :size="28" />
            <span>Đang tải lịch sử...</span>
        </div>

        <div v-else-if="items.length === 0" class="empty-state">
            <History :size="28" />
            <span>Chưa có phiên phỏng vấn nào.</span>
        </div>

        <div v-else class="history-list">
            <Motion v-for="item in items" :key="getSessionId(item)" :initial="{ opacity: 0, y: 12 }"
                :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.22 }">
                <div class="history-row" @click="$emit('open', item)">
                    <div>
                        <div class="flex items-center gap-2">
                            <div class="font-bold text-[oklch(58.5%_0.233_277.117)]">{{ item?.job_position }}</div>
                            <div v-if="item.company_name"> - {{ item?.company_name }}</div>
                        </div>
                        <span>{{ formatDate(item.created_at) }}</span>
                        <span>{{ item.message_count ?? item.total_messages ?? 0 }} tin nhắn</span>
                    </div>
                    <div class="history-meta">
                        <span class="status-pill" :class="normalizeStatus(item.status)">
                            {{ labelStatus(item.status) }}
                        </span>
                        <div class="score" :class="{
                            'score-high': item?.score > 85,
                            'score-medium': item?.score > 50 && item?.score <= 85,
                            'score-low': item?.score <= 50
                        }">
                            {{ item?.score ?? '--' }}
                        </div>
                    </div>

                    <button class="delete-button" title="Xóa phiên" @click.stop="handleDeleteClick(item, $event)">
                        <Trash2 :size="15" />
                    </button>

                    <!-- <ChevronRight :size="18" /> -->
                </div>
            </Motion>
        </div>

        <Teleport to="body">
            <Transition name="fade">
                <div v-if="showDeleteDialog" class="delete-overlay" @click.self="showDeleteDialog = false">
                    <div class="delete-dialog">
                        <div class="delete-dialog-icon">
                            <Trash2 :size="22" />
                        </div>
                        <h3>Xóa phiên phỏng vấn?</h3>
                        <p>Bạn sắp xóa phiên cho vị trí</p>
                        <strong>{{ deleteTarget?.job_position }}{{ deleteTarget?.company_name ? ` tại
                            ${deleteTarget.company_name}` : '' }}</strong>
                        <div class="delete-warn" v-if="normalizeStatus(deleteTarget?.status) === 'completed'">
                            <AlertTriangle :size="14" />
                            Báo cáo phân tích và toàn bộ tin nhắn cũng sẽ bị xóa vĩnh viễn.
                        </div>
                        <div class="delete-actions">
                            <button class="btn-cancel" @click="showDeleteDialog = false">Hủy</button>
                            <button class="btn-confirm" @click="confirmDelete">
                                <Trash2 :size="14" /> Xóa vĩnh viễn
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <footer v-if="total > 0" class="history-pagination">
            <div class="pagination-summary">
                Hiển thị {{ startItem }}-{{ endItem }} / {{ total }} phiên
            </div>
            <div class="pagination-controls">
                <button class="page-button" :disabled="page <= 1 || isLoading" @click="$emit('goto', page - 1)">
                    <ChevronLeft :size="16" />
                </button>
                <button v-for="pageNumber in visiblePages" :key="pageNumber" class="page-button"
                    :class="{ active: pageNumber === page }" :disabled="isLoading" @click="$emit('goto', pageNumber)">
                    {{ pageNumber }}
                </button>
                <button class="page-button" :disabled="page >= totalPages || isLoading"
                    @click="$emit('goto', page + 1)">
                    <ChevronRight :size="16" />
                </button>
            </div>
        </footer>
    </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Motion } from 'motion-v'
import { Brain, ChevronLeft, ChevronRight, History, RefreshCw, Trash2 } from 'lucide-vue-next'

// ─── Props ───────────────────────────────────────────────────────────────────
const props = defineProps({
    items: { type: Array, default: () => [] },
    isLoading: { type: Boolean, default: false },
    page: { type: Number, default: 1 },
    pageSize: { type: Number, default: 10 },
    total: { type: Number, default: 0 },
    totalPages: { type: Number, default: 1 },
    status: { type: String, default: '' },
    searchQuery: { type: String, default: '' }
})

// ─── Emits ────────────────────────────────────────────────────────────────────
const emit = defineEmits(['refresh', 'open', 'goto', 'reset', 'update:status', 'update:pageSize', 'update:search', 'delete'])

// ─── Local mirrors for v-model selects ───────────────────────────────────────
const localStatus = ref(props.status)
const localPageSize = ref(props.pageSize)
const searchQuery = ref(props.searchQuery)

watch(() => props.status, (v) => { localStatus.value = v })
watch(() => props.pageSize, (v) => { localPageSize.value = v })

// ─── Computed ─────────────────────────────────────────────────────────────────
const startItem = computed(() => {
    if (!props.items.length) return 0
    return (props.page - 1) * props.pageSize + 1
})

const endItem = computed(() =>
    Math.min(startItem.value + props.items.length - 1, props.total)
)

const visiblePages = computed(() => {
    const total = props.totalPages
    const current = props.page
    const start = Math.max(1, current - 2)
    const end = Math.min(total, start + 4)
    const adjustedStart = Math.max(1, end - 4)
    return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i)
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSessionId(item) {
    return item.session_id || item.id || item.conversation_id
}

function normalizeStatus(value = '') {
    const v = String(value).toLowerCase()
    if (['completed', 'ended', 'finished'].includes(v)) return 'completed'
    if (['active', 'in_progress', 'live'].includes(v)) return 'active'
    return v || 'active'
}

function labelStatus(value) {
    const v = normalizeStatus(value)
    if (v === 'completed') return 'Đã kết thúc'
    if (v === 'active') return 'Đang phỏng vấn'
    return value || 'Đang phỏng vấn'
}

function formatDate(value) {
    if (!value) return 'Không rõ thời gian'
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

const deleteTarget = ref(null) // item đang chờ xóa
const showDeleteDialog = ref(false)

function handleDeleteClick(item, event) {
    event.stopPropagation() // tránh trigger @click của row
    deleteTarget.value = item
    showDeleteDialog.value = true
}

function confirmDelete() {
    if (!deleteTarget.value) return
    console.log('deleteTarget:', deleteTarget.value)
    emit('delete', deleteTarget.value)
    showDeleteDialog.value = false
    deleteTarget.value = null
}
</script>

<style scoped>
.history-page {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.page-header {
    min-height: 84px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 18px 28px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(15, 18, 37, 0.78);
    backdrop-filter: blur(18px);
}

.eyebrow {
    margin: 0 0 3px;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

h1 {
    margin: 0;
    font-weight: 900;
}

.icon-button {
    width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #dbeafe;
    background: rgba(255, 255, 255, 0.04);
    transition: 160ms ease;
}

button:not(:disabled):hover {
    transform: translateY(-1px);
    border-color: rgba(99, 102, 241, 0.48);
}

.history-filters {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 22px 28px 0;
}

.field {
    max-width: 220px;
    padding: 11px 12px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 14px;
    outline: none;
    background: #111827;
    color: #fff;
}

.empty-state {
    flex: 1;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #94a3b8;
    font-weight: 800;
}

.history-list {
    flex: 1;
    overflow-y: auto;
    display: grid;
    align-content: start;
    gap: 12px;
    padding: 22px 28px;
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
    transition: 160ms ease;
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
    font-size: 18px;
    font-weight: 950;
    text-align: right;
}

.score-high {
    color: #22c55e;
    text-shadow: 0 0 8px rgba(34, 197, 94, 0.35);
}

.score-medium {
    color: #f59e0b;
    text-shadow: 0 0 8px rgba(245, 158, 11, 0.35);
}

.score-low {
    color: #ef4444;
    text-shadow: 0 0 8px rgba(239, 68, 68, 0.35);
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
    transition: 160ms ease;
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

.delete-button {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    border: 1px solid rgba(239, 68, 68, 0.15);
    background: rgba(239, 68, 68, 0.06);
    color: #f87171;
    transition: 140ms ease;
    flex-shrink: 0;
}

.delete-button:hover {
    border-color: rgba(239, 68, 68, 0.5);
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    transform: scale(1.05);
}

.delete-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.delete-dialog {
    background: #111827;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 28px;
    width: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

/* ... thêm style cho icon, warn, actions tương tự preview */

.fade-enter-active,
.fade-leave-active {
    transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 900px) {
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

<style>
/* Không scoped — global */
.delete-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.delete-dialog {
    background: #111827;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 28px 24px;
    width: 380px;
    max-width: 90vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    text-align: center;
}

.delete-dialog-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f87171;
    margin-bottom: 16px;
}

.delete-dialog h3 {
    color: #fff;
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 8px;
}

.delete-dialog p {
    color: #64748b;
    font-size: 13px;
    margin-bottom: 4px;
}

.delete-dialog strong {
    color: #818cf8;
    font-size: 14px;
    font-weight: 700;
    display: block;
    margin-bottom: 16px;
}

.delete-warn {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 14px;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.15);
    border-radius: 10px;
    color: #fca5a5;
    font-size: 12px;
    text-align: left;
    line-height: 1.5;
    width: 100%;
    margin-bottom: 24px;
}

.delete-actions {
    display: flex;
    gap: 10px;
    width: 100%;
}

.delete-actions .btn-cancel {
    flex: 1;
    height: 42px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    color: #94a3b8;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: 140ms;
}

.delete-actions .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
}

.delete-actions .btn-confirm {
    flex: 1;
    height: 42px;
    border-radius: 12px;
    border: none;
    background: #dc2626;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: 140ms;
}

.delete-actions .btn-confirm:hover {
    background: #ef4444;
    transform: translateY(-1px);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>