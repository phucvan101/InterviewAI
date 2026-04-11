<template>
  <div class="space-y-6">
    <!-- ── Section heading ── -->
    <div class="flex items-center gap-2">
      <div class="w-1 h-5 rounded-full" style="background:linear-gradient(180deg,#fbbf24,#f59e0b);" />
      <h2 class="text-base font-black text-white">Phân tích độ phù hợp</h2>
    </div>

    <!-- ── Analysis card ── -->
    <div class="rounded-2xl border p-6" :style="{
      background: '#141728',
      'border-color': 'rgba(255,255,255,0.07)'
    }">
      <!-- Initial state: Button to start analysis -->
      <div v-if="!analysisCompleted && !isAnalyzing" class="text-center py-6">
        <div class="mb-4">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl"
            style="background:rgba(251,191,36,0.1);">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">So sánh CV với Mô tả công việc</h3>
        <p class="text-[13px] mb-6" style="color:rgba(255,255,255,0.5);">
          Nhấn nút dưới để xem mức độ phù hợp của CV với công việc
        </p>
        <button class="px-6 py-2.5 rounded-lg font-semibold transition-all"
          :style="cvReady && jdReady ? {
            background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
            color: '#1a1a1a'
          } : {
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.4)'
          }"
          :disabled="!cvReady || !jdReady"
          @click="startAnalysis">
          {{ cvReady && jdReady ? '🚀 Bắt đầu phân tích' : '⚠️ Tải CV và JD lên' }}
        </button>
        <p v-if="!cvReady || !jdReady" class="text-[11px] mt-3" style="color:#f87171;">
          {{ !cvReady && !jdReady ? 'Hãy tải file CV và JD lên' : !cvReady ? 'Hãy tải file CV lên' : 'Hãy tải file JD lên' }}
        </p>
      </div>

      <!-- Loading state with progress bar -->
      <div v-else-if="isAnalyzing" class="text-center py-10">
        <div class="mb-4">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl"
            style="background:rgba(96,165,250,0.1); animation: spin 2s linear infinite;">
            <svg class="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Đang phân tích...</h3>
        <p class="text-[13px] mb-6" style="color:rgba(255,255,255,0.5);">
          Vui lòng chờ trong khi hệ thống sử dụng AI để phân tích
        </p>
        <!-- Progress bar -->
        <div class="w-full h-2 rounded-full overflow-hidden"
          style="background:rgba(255,255,255,0.08); max-width:300px; margin:0 auto;">
          <div class="h-full rounded-full transition-all duration-300"
            style="background:linear-gradient(90deg,#4f46e5,#60a5fa);"
            :style="{ width: analysisProgress + '%' }" />
        </div>
        <p class="text-[12px] mt-3" style="color:rgba(255,255,255,0.4);">
          {{ Math.floor(analysisProgress) }}%
        </p>
      </div>

      <!-- Results state -->
      <div v-else-if="analysisCompleted && analysisData" class="space-y-6">
        <!-- Score circle -->
        <div class="flex justify-center">
          <div class="relative w-36 h-36">
            <!-- Background circle -->
            <svg class="w-full h-full absolute" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
              <circle cx="80" cy="80" r="75" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8" />
              <!-- Progress circle -->
              <circle cx="80" cy="80" r="75" fill="none" stroke="url(#scoreGradient)" stroke-width="8"
                stroke-dasharray="471" stroke-dashoffset="471" :style="{
                  strokeDashoffset: 471 - (471 * (analysisData.overall_score / 100)),
                  transition: 'stroke-dashoffset 1.5s ease-out'
                }"
                stroke-linecap="round" />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" :style="{ 'stop-color': getScoreColor(analysisData.overall_score).start }" />
                  <stop offset="100%" :style="{ 'stop-color': getScoreColor(analysisData.overall_score).end }" />
                </linearGradient>
              </defs>
            </svg>
            <!-- Score text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-5xl font-black" :style="{ color: getScoreColor(analysisData.overall_score).main }">
                {{ analysisData.overall_score }}
              </span>
              <span class="text-xs mt-1" style="color:rgba(255,255,255,0.5);">/ 100</span>
            </div>
          </div>
        </div>

        <!-- Score interpretation -->
        <div class="text-center">
          <h3 class="text-lg font-bold text-white mb-1">{{ getScoreLabel(analysisData.overall_score) }}</h3>
          <p class="text-[13px]" style="color:rgba(255,255,255,0.6);">
            {{ analysisData.score_rationale }}
          </p>
        </div>

        <!-- Tabs for details -->
        <div class="flex gap-2 border-b" style="border-color:rgba(255,255,255,0.1);">
          <button v-for="tab in detailTabs" :key="tab.id"
            class="px-4 py-2 text-sm font-semibold transition-colors relative"
            :style="{
              color: activeDetailTab === tab.id ? '#60a5fa' : 'rgba(255,255,255,0.5)'
            }"
            @click="activeDetailTab = tab.id">
            {{ tab.label }}
            <div v-if="activeDetailTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5"
              style="background:linear-gradient(90deg,#60a5fa,#3b82f6);" />
          </button>
        </div>

        <!-- Tab content: Missing Skills -->
        <div v-if="activeDetailTab === 'missing'">
          <h4 class="text-sm font-bold text-white mb-3">❌ Kỹ năng thiếu ({{ analysisData.missing_skills.length }})</h4>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="(skill, idx) in analysisData.missing_skills" :key="`missing-${idx}`"
              class="px-3 py-2 rounded-lg text-[12px]"
              style="background:rgba(239,68,68,0.1); color:#fca5a5; border:1px solid rgba(239,68,68,0.2);">
              • {{ skill }}
            </div>
          </div>
        </div>

        <!-- Tab content: Strengths -->
        <div v-else-if="activeDetailTab === 'strengths'">
          <h4 class="text-sm font-bold text-white mb-3">💪 Điểm mạnh chính</h4>
          <div class="space-y-2">
            <div v-for="(strength, idx) in analysisData.main_strengths" :key="`strength-${idx}`"
              class="px-4 py-3 rounded-lg"
              style="background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.2);">
              <p class="text-[13px] leading-relaxed" style="color:#86efac;">
                ✓ {{ strength }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tab content: Development -->
        <div v-else-if="activeDetailTab === 'development'">
          <h4 class="text-sm font-bold text-white mb-3">📈 Khu vực cần phát triển</h4>
          <div class="space-y-2">
            <div v-for="(area, idx) in analysisData.areas_for_development" :key="`area-${idx}`"
              class="px-4 py-3 rounded-lg"
              style="background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2);">
              <p class="text-[13px] leading-relaxed" style="color:#93c5fd;">
                → {{ area }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tab content: Recommendation -->
        <div v-else-if="activeDetailTab === 'recommendation'">
          <h4 class="text-sm font-bold text-white mb-3">💡 Khuyến nghị</h4>
          <div class="px-4 py-3 rounded-lg" style="background:rgba(168,85,247,0.1); border:1px solid rgba(168,85,247,0.2);">
            <p class="text-[13px] leading-relaxed" style="color:#d8b4fe;">
              {{ analysisData.recommendation }}
            </p>
          </div>
        </div>

        <!-- Matched Skills Summary -->
        <div>
          <h4 class="text-sm font-bold text-white mb-3">✅ Kỹ năng phù hợp ({{ analysisData.matched_skills.length }})</h4>
          <div class="flex flex-wrap gap-2">
            <span v-for="(skill, idx) in analysisData.matched_skills.slice(0, 8)" :key="`matched-${idx}`"
              class="px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style="background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.25);">
              {{ skill }}
            </span>
            <span v-if="analysisData.matched_skills.length > 8"
              class="px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style="background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.5);">
              +{{ analysisData.matched_skills.length - 8 }} more
            </span>
          </div>
        </div>

        <!-- Experience Assessment -->
        <div class="rounded-lg p-4" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);">
          <h4 class="text-sm font-bold text-white mb-2">🎯 Đánh giá kinh nghiệm</h4>
          <p class="text-[13px] mb-2" style="color:rgba(255,255,255,0.7);">
            <span class="font-semibold">{{ analysisData.experience_assessment }}</span>
          </p>
          <p class="text-[12px]" style="color:rgba(255,255,255,0.5);">
            {{ analysisData.experience_detail }}
          </p>
        </div>

        <!-- Reset button -->
        <div class="text-center pt-4">
          <button class="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style="background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.6);"
            @click="resetAnalysis">
            ↻ Phân tích lại
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()

// Props
const props = defineProps({
  cvReady: {
    type: Boolean,
    default: false
  },
  jdReady: {
    type: Boolean,
    default: false
  },
  cvFilePath: {
    type: String,
    default: null
  },
  jdFilePath: {
    type: String,
    default: null
  },
  companyFilePath: {
    type: String,
    default: null
  }
})

// State
const isAnalyzing = ref(false)
const analysisCompleted = ref(false)
const analysisData = ref(null)
const activeDetailTab = ref('missing')
const analysisProgress = ref(0)

const detailTabs = [
  { id: 'missing', label: '❌ Kỹ năng thiếu' },
  { id: 'strengths', label: '💪 Điểm mạnh' },
  { id: 'development', label: '📈 Phát triển' },
  { id: 'recommendation', label: '💡 Khuyến nghị' }
]

// Compute API URL
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (!API_BASE_URL) return normalizedPath
  if (API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${API_BASE_URL.slice(0, -4)}${normalizedPath}`
  }
  return `${API_BASE_URL}${normalizedPath}`
}

// Score color mapping
function getScoreColor(score) {
  if (score >= 85) {
    return { main: '#4ade80', start: '#34d399', end: '#10b981' }
  } else if (score >= 70) {
    return { main: '#60a5fa', start: '#3b82f6', end: '#1d4ed8' }
  } else if (score >= 60) {
    return { main: '#fbbf24', start: '#f59e0b', end: '#d97706' }
  } else {
    return { main: '#f87171', start: '#fb7185', end: '#dc2626' }
  }
}

function getScoreLabel(score) {
  if (score >= 85) return 'Rất phù hợp'
  if (score >= 70) return 'Khá phù hợp'
  if (score >= 60) return 'Trung bình'
  if (score >= 50) return 'Ít phù hợp'
  return 'Không phù hợp'
}

// Methods
async function startAnalysis() {
  if (!props.cvReady || !props.jdReady || !props.cvFilePath || !props.jdFilePath) {
    ElMessage.error('Hãy tải file CV và JD lên')
    return
  }

  isAnalyzing.value = true
  analysisCompleted.value = false
  analysisProgress.value = 0

  // Simulate progress updates
  const progressInterval = setInterval(() => {
    if (analysisProgress.value < 90) {
      analysisProgress.value = Math.min(analysisProgress.value + Math.random() * 20, 90)
    }
  }, 500)

  try {
    const token = authStore.token || localStorage.getItem('access_token')
    const headers = {}
    if (token) headers.Authorization = `Bearer ${token}`

    // Build request payload with optional company file path
    const payload = {
      cv_file_path: props.cvFilePath,
      jd_file_path: props.jdFilePath
    }
    if (props.companyFilePath) {
      payload.company_file_path = props.companyFilePath
    }

    const response = await axios.post(
      buildApiUrl('/api/v1/analysis/match-cv-jd'),
      payload,
      { headers }
    )

    // Complete the progress bar
    clearInterval(progressInterval)
    analysisProgress.value = 100

    if (response.data.success) {
      analysisData.value = response.data.data
      analysisCompleted.value = true
      activeDetailTab.value = 'missing'
      ElMessage.success('Phân tích hoàn thành')
    } else {
      throw new Error(response.data.message || 'Phân tích thất bại')
    }
  } catch (err) {
    clearInterval(progressInterval)
    console.error('Analysis error:', err)
    ElMessage.error(err.response?.data?.detail || err.message || 'Có lỗi xảy ra')
    isAnalyzing.value = false
  } finally {
    // Keep analyzing state briefly after progress is complete
    setTimeout(() => {
      if (analysisCompleted.value) {
        isAnalyzing.value = false
      }
    }, 500)
  }
}

function resetAnalysis() {
  analysisCompleted.value = false
  analysisData.value = null
  activeDetailTab.value = 'missing'
}
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
