<template>
    <LayoutInterview>
        <div class="report-page">
            <div class="bg-grid"></div>
            <div class="bg-glow"></div>

            <!-- Header -->
            <header class="report-header">
                <div class="header-inner">
                    <button class="back-btn" @click="$router.back()">
                        <ChevronLeft :size="18" /><span>Quay lại</span>
                    </button>
                    <div class="header-title">
                        <div class="title-icon">
                            <BarChart2 :size="20" />
                        </div>
                        <div>
                            <h1>Báo cáo phân tích</h1>
                            <p class="conv-id">ID: {{ conversationId }}</p>
                        </div>
                    </div>

                    <button class="cv-btn" :disabled="isOpeningCv" @click="openJDPreview">
                        <el-icon>
                            <Document />
                        </el-icon> Mô tả công việc
                    </button>

                    <button class="cv-btn" :disabled="isOpeningCv" @click="openCvPreview">
                        <el-icon>
                            <Document />
                        </el-icon> {{ isOpeningCv ? 'Đang mở...' : 'Xem CV' }}
                    </button>

                    <button class="export-btn" @click="sendCV">
                        <el-icon>
                            <Promotion />
                        </el-icon> Nộp cv
                    </button>

                    <button class="export-btn" :disabled="isStartingReInterview" @click="startReInterview">
                        <el-icon>
                            <Promotion />
                        </el-icon> Phỏng vấn lại
                    </button>

                    <button class="export-btn" @click="exportReport">
                        <Download :size="16" /> Xuất báo cáo
                    </button>

                </div>
            </header>

            <!-- Loading -->
            <div v-if="loading" class="loading-state">
                <div class="pulse-ring"></div>
                <div class="pulse-ring delay-1"></div>
                <div class="pulse-ring delay-2"></div>
                <p>Đang tải dữ liệu phân tích...</p>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="error-state">
                <AlertCircle :size="48" />
                <h3>Không thể tải báo cáo</h3>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchReport">Thử lại</button>
            </div>

            <!-- Content -->
            <main v-else-if="report" class="report-content">

                <!-- SECTION 1: Summary -->
                <div class="section-card">
                    <div class="summary-section">
                        <div class="score-circle-wrap">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" class="ring-bg" />
                                <circle cx="50" cy="50" r="42" class="ring-fill"
                                    :stroke="getScoreColor100(overallScore)"
                                    :stroke-dasharray="`${(overallScore / 100) * 263.9} 263.9`" />
                            </svg>
                            <div class="score-center">
                                <span class="score-num">{{ overallScore }}</span>
                                <span class="score-den">ĐIỂM</span>
                            </div>
                        </div>
                        <div class="summary-body">
                            <h2>Tóm tắt đánh giá</h2>
                            <p class="summary-text">
                                {{
                                    report.summary || report.feedback || report.comments
                                }}
                            </p>
                            <div class="summary-tags">
                                <span v-for="s in (report.strengths || []).slice(0, 2)" :key="s"
                                    class="summary-tag tag-good">{{ s
                                    }}</span>
                                <span v-for="w in (report.weaknesses || report.improvements || []).slice(0, 1)" :key="w"
                                    class="summary-tag tag-warn">{{ w }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECTION 2: Radar + AI Coach -->
                <div class="two-panel">
                    <!-- Left: Radar Chart -->
                    <div class="section-card radar-panel">
                        <div class="panel-header">
                            <div class="panel-title">Các khía cạnh đánh giá</div>
                            <span class="total-score-badge">Điểm tổng quát: {{ overallScore }}/100</span>
                        </div>
                        <div class="radar-content">
                            <div ref="radarChartRef" class="radar-chart-wrap"></div>
                            <div class="score-bars">
                                <div class="score-bar-item" v-for="item in radarScores" :key="item.label">
                                    <div class="flex justify-between">
                                        <div class="score-bar-label">{{ item.label }}</div>
                                        <el-tooltip placement="bottom" effect="dark">
                                            <template #content>
                                                <div class="tooltip-content">
                                                    {{ item.fallback }}
                                                </div>
                                            </template>

                                            <div class="score-bar-value"
                                                :style="{ color: getScoreColor100(item.value) }">
                                                {{ item.value }}/100
                                            </div>
                                        </el-tooltip>

                                    </div>
                                    <div class="score-bar-track">
                                        <div class="score-bar-fill"
                                            :style="{ width: item.value + '%', background: item.color }">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: AI Coach -->
                    <div class="section-card coach-panel">
                        <div class="panel-title">Góc nhìn từ AI Coach</div>
                        <div style="margin-top:20px">
                            <div class="coach-item" v-for="(item, i) in coachInsights" :key="i">
                                <div class="coach-icon" :class="item.type">
                                    <CheckCircle :color="'#34D399'" v-if="item.type === 'positive'" :size="14" />

                                    <AlertTriangle :color="'#FBBF24'" v-else-if="item.type === 'warning'" :size="14" />

                                    <Lightbulb :color="'#818CF8'" v-else :size="14" />
                                </div>

                                <div class="coach-body">
                                    <h4>{{ item.title }}</h4>
                                    <p>{{ item.description }}</p>
                                </div>
                            </div>
                        </div>
                        <!-- CTA -->
                        <!-- <div class="cta-card">
                            <h3>Mở khóa Phân tích Nâng cao</h3>
                            <p>Nhận phân tích cảm xúc từng từ và theo dõi biểu cảm khuôn mặt.</p>
                            <button class="cta-btn">NÂNG CẤP NGAY</button>
                        </div> -->
                    </div>
                </div>

                <!-- SECTION 3: Knowledge Gaps -->
                <div class="section-card" v-if="knowledgeGaps.length">
                    <div class="gaps-header">
                        <div class="panel-title">Lỗ hổng kiến thức chính</div>
                        <span class="gaps-badge">{{ knowledgeGaps.length }} Lỗ hổng nghiêm trọng</span>
                    </div>
                    <table class="gaps-table">
                        <thead>
                            <tr>
                                <th style="width:35%">LỖ HỔNG XÁC ĐỊNH</th>
                                <th style="width:20%; text-align: center;">MỨC ĐỘ ẢNH HƯỞNG</th>
                                <th>KHUYẾN NGHỊ LỘ TRÌNH HỌC</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(gap, i) in knowledgeGaps" :key="i">
                                <td>
                                    <p class="gap-name">
                                        {{ gap.title }}
                                    </p>

                                    <p class="gap-desc">
                                        {{ gap.evidence }}
                                    </p>
                                </td>

                                <td style="text-align: center; font-size: 16px;">
                                    <span class="gap-level" :class="{
                                        'gap-high': gap.impact === 'high',
                                        'gap-medium': gap.impact === 'medium',
                                        'gap-low': gap.impact === 'low'
                                    }">
                                        {{ gap.impact }}
                                    </span>
                                </td>

                                <td style="font-size: 14px;">
                                    {{ gap.recommendation }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <!-- <button class="view-all-btn">Xem tất cả điểm cải thiện đã phát hiện</button> -->
                </div>

                <!-- Transcript -->
                <div class="section-card" v-if="report.transcript?.length">
                    <div class="panel-title" style="margin-bottom:16px">Lịch sử hội thoại</div>
                    <div style="display:flex;flex-direction:column;gap:12px">
                        <div v-for="(msg, i) in report.transcript.slice(0, showAll ? 9999 : 6)" :key="i"
                            style="display:flex;gap:12px"
                            :style="msg.role === 'assistant' ? { flexDirection: 'row-reverse' } : {}">
                            <div
                                style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">
                                {{ msg.role === 'user' ? '👤' : '🤖' }}
                            </div>
                            <div
                                style="max-width:70%;background:#0a0f1a;border:1px solid rgba(99,102,241,.15);border-radius:12px;padding:12px 16px;overflow-wrap:break-word">
                                <div style="font-size:11px;color:#475569;font-weight:700;margin-bottom:4px">{{ msg.role
                                    === 'user' ? 'Người dùng' : 'AI' }}</div>
                                <div style="font-size:14px;color:#e2e8f0;line-height:1.6">{{ msg.content }}</div>
                            </div>
                        </div>
                        <button v-if="report.transcript.length > 6" class="view-all-btn" @click="showAll = !showAll">
                            {{ showAll ? 'Thu gọn' : `Xem thêm ${report.transcript.length - 6} tin nhắn` }}
                        </button>
                    </div>
                </div>

                <el-dialog v-if="report.job_description" v-model="dialogVisible" title="Mô tả công việc" width="900px"
                    destroy-on-close class="job-dialog">
                    <div class="job-description" v-html="formatDescription(report.job_description)" />

                    <template #footer>
                        <el-button color="#6366F1" @click="dialogVisible = false">
                            Đóng
                        </el-button>
                    </template>
                </el-dialog>
            </main>
        </div>
    </LayoutInterview>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage, ElNotification } from 'element-plus'
import { Promotion, Document } from '@element-plus/icons-vue'
import {
    ChevronLeft, BarChart2, Download, AlertCircle,
    CheckCircle, AlertTriangle, Lightbulb, BookOpen
} from 'lucide-vue-next'
import LayoutInterview from '../layouts/LayoutInterview.vue'
import { useAuthStore } from '@/stores/auth'
import './DetailReport.css'
import { useRouter } from 'vue-router'

const route = useRoute()
const conversationId = computed(() => route.params.id)
const loading = ref(true)
const error = ref(null)
const report = ref(null)
const showAll = ref(false)
const radarChartRef = ref(null)
const isOpeningCv = ref(false)
const authStore = useAuthStore()
let chartInstance = null
let cvPreviewObjectUrl = null
const dialogVisible = ref(false)
const router = useRouter()
const isStartingReInterview = ref(false)


async function startReInterview() {
    if (!report.value) {
        ElMessage.warning('Không có dữ liệu báo cáo để khởi tạo phiên mới')
        return
    }

    // cố gắng lấy JD/CV từ report (defensive)
    const job_description = report.value.job_description || report.value.jd_raw_text || report.value.conversation?.job_description || ''
    const cv_profile = report.value.cv_raw_text || report.value.cv_profile || report.value.conversation?.cv_profile || ''

    isStartingReInterview.value = true
    try {
        const payload = {
            analysis_session_id: report.value.analysis_session_id,
            job_description,
            cv_profile,
        }

        const response = await authStore.authorizedRequest('/api/v1/conversations/', {
            method: 'POST',
            body: payload,
        })

        const newSessionId = response.session_id || response?.data?.session_id
        if (!newSessionId) throw new Error('Backend không trả về session_id')

        router.push(`/interview/${newSessionId}`)
    } catch (err) {
        ElMessage.error(err?.message || 'Không thể tạo phiên phỏng vấn mới')
    } finally {
        isStartingReInterview.value = false
    }
}


async function fetchReport() {
    loading.value = true
    error.value = null
    try {
        const response = await authStore.authorizedRequest(
            `/api/v1/conversations/${conversationId.value}/analysis-report`
        )
        report.value = response?.data || response
    } catch (e) {
        error.value = e?.response?.data?.message || e.message || 'Lỗi không xác định'
    } finally {
        loading.value = false
    }
}

onMounted(() => fetchReport())

onBeforeUnmount(() => {
    if (cvPreviewObjectUrl) {
        URL.revokeObjectURL(cvPreviewObjectUrl)
        cvPreviewObjectUrl = null
    }
})

// Overall score (0-100)
const overallScore = computed(() => {
    return Number(report.value?.overall_score || 0)
})

const cvPreview = computed(() => {
    return report.value?.cv_preview || report.value?.conversation?.cv_preview || null
})

async function openCvPreview() {
    const preview = cvPreview.value
    const previewUrl = preview?.preview_url || `/api/v1/conversations/${conversationId.value}/cv-preview`

    if (!previewUrl) {
        ElMessage.warning('Không tìm thấy file CV cho phiên phỏng vấn này.')
        return
    }

    isOpeningCv.value = true
    try {
        const blob = await authStore.authorizedBlobRequest(previewUrl)

        if (cvPreviewObjectUrl) URL.revokeObjectURL(cvPreviewObjectUrl)
        cvPreviewObjectUrl = URL.createObjectURL(
            blob.type ? blob : new Blob([blob], { type: preview?.content_type || 'application/pdf' })
        )

        window.open(cvPreviewObjectUrl, '_blank', 'noopener,noreferrer')
    } catch (e) {
        ElMessage.error(e.message || 'Không thể mở file CV.')
    } finally {
        isOpeningCv.value = false
    }
}

const openJDPreview = () => {
    dialogVisible.value = true
}

const sendCV = async () => {
    try {
        const res = await authStore.authorizedRequest(`/api/v1/email/send-job-application`, {
            method: 'POST',
            body: {
                session_id: report.value.analysis_session_id
            }
        })

        if (res.success) {
            ElNotification.success({
                title: 'Thành công',
                message: 'CV của bạn đã được gửi đi thành công!',
            })
        } else {
            ElNotification.error({
                title: 'Thất bại',
                message: 'CV của bạn đã không được gửi đi. Vui Lòng kiểm tra lại mô tả công việc đã có email người nhận chưa.',
            })
        }
    } catch (e) {
        ElMessage.error(e.message || 'Không thể gửi CV.')
    }
}

const formatDescription = (text) => {
    return text?.replace(/\n/g, '<br>') || ''
}

// Score color for 0-100 scale
function getScoreColor100(v) {
    if (v >= 80) return '#10b981'
    if (v >= 60) return '#6366f1'
    if (v >= 40) return '#f59e0b'
    return '#ef4444'
}

// Radar chart scores
const RADAR_ITEMS = [
    { key: 'technical', label: 'KỸ NĂNG CHUYÊN MÔN' },
    { key: 'confidence', label: 'SỰ TỰ TIN' },
    { key: 'soft_skills', label: 'KỸ NĂNG MỀM' },
    { key: 'communication', label: 'GIAO TIẾP' },
    { key: 'company_knowledge', label: 'KIẾN THỨC VỀ CÔNG TY' },
]


const radarScores = computed(() => {
    if (!report.value) return []

    const scores = report.value.scores || {}

    return RADAR_ITEMS.map(item => {
        console.log('item.key =', item.key)
        console.log('scores[item.key] =', scores[item.key])

        const data = scores[item.key] || {}

        return {
            key: item.key,
            label: item.label,
            value: Number(data.score || 0),
            fallback: data.evidence || '',
            color: getScoreColor100(Number(data.score || 0))
        }
    })
})

watch(
    radarScores,
    (newValue) => {
        console.log('radarScores:', newValue)
    },
    { immediate: true }
)

// Init radar chart
function initRadarChart() {
    if (!radarChartRef.value) return
    if (chartInstance) chartInstance.dispose()
    chartInstance = echarts.init(radarChartRef.value)
    const labels = radarScores.value.map(s => s.label)
    const values = radarScores.value.map(s => s.value)
    chartInstance.setOption({
        radar: {
            indicator: labels.map(name => ({ name, max: 100 })),
            shape: 'polygon',
            radius: '50%',
            center: ['50%', '55%'],
            axisName: {
                color: '#94a3b8',
                fontSize: 12,
                padding: [2, 6],
            },
            splitArea: { areaStyle: { color: ['rgba(99,102,241,.03)', 'rgba(99,102,241,.06)'] } },
            splitLine: { lineStyle: { color: 'rgba(99,102,241,.15)' } },
            axisLine: { lineStyle: { color: 'rgba(99,102,241,.15)' } },
        },
        series: [{
            type: 'radar',
            data: [{
                value: values, name: 'Đánh giá',
                areaStyle: { color: 'rgba(99,102,241,.25)' },
                lineStyle: { color: '#6366f1', width: 2 },
                itemStyle: { color: '#6366f1' },
                symbol: 'circle', symbolSize: 6,
            }],
        }],
    })
}

watch([radarScores, radarChartRef], () => {
    nextTick(() => initRadarChart())
}, { flush: 'post' })

// AI Coach insights
const coachInsights = computed(() => {
    return report.value?.ai_coach_insights || []
})

// Knowledge gaps
const knowledgeGaps = computed(() => {
    return report.value?.knowledge_gaps || []
})

function exportReport() {
    const blob = new Blob([JSON.stringify(report.value, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${conversationId.value}.json`
    a.click()
    URL.revokeObjectURL(url)
}
</script>
