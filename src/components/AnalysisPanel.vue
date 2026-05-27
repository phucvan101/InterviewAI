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
        <button class="px-6 py-2.5 rounded-lg font-semibold transition-all" :style="cvReady && jdReady ? {
          background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
          color: '#1a1a1a'
        } : {
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.4)'
        }" :disabled="!cvReady || !jdReady" @click="startAnalysis">
          {{ cvReady && jdReady ? 'Bắt đầu phân tích' : 'Tải CV và JD lên' }}
        </button>
        <p v-if="!cvReady || !jdReady" class="text-[11px] mt-3" style="color:#f87171;">
          {{
            !cvReady && !jdReady ? 'Hãy tải file CV và JD lên' : !cvReady ? 'Hãy tải file CV lên' : 'Hãy tải file JD lên'
          }}
        </p>
      </div>

      <!-- Loading state with progress bar -->
      <div v-else-if="isAnalyzing" class="text-center py-10">
        <div class="mb-4">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl"
            style="background:rgba(96,165,250,0.1); animation: spin 2s linear infinite;">
            <svg class="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
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
            style="background:linear-gradient(90deg,#4f46e5,#60a5fa);" :style="{ width: analysisProgress + '%' }" />
        </div>
        <p class="text-[12px] mt-3" style="color:rgba(255,255,255,0.4);">
          {{ Math.floor(analysisProgress) }}%
        </p>
      </div>

      <!-- Results state -->
      <div v-else-if="analysisCompleted && analysisData" class="space-y-6">
        <!-- Score interpretation + Detail bars row -->
        <div class="flex flex-col lg:flex-row items-center justify-center gap-8">

          <!-- Score circle -->
          <div class="relative w-36 h-36 flex-shrink-0 self-center">
            <!-- Background circle -->
            <svg class="w-full h-full absolute" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
              <circle cx="80" cy="80" r="75" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8" />
              <!-- Progress circle -->
              <circle cx="80" cy="80" r="75" fill="none" stroke="url(#scoreGradient)" stroke-width="8"
                stroke-dasharray="471" stroke-dashoffset="471" :style="{
                  strokeDashoffset: 471 - (471 * (analysisData.overall_score / 100)),
                  transition: 'stroke-dashoffset 1.5s ease-out'
                }" stroke-linecap="round" />
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
              <span class="text-[10px] font-semibold mt-1" style="color:rgba(255,255,255,0.45);">
                {{ getScoreLabel(analysisData.overall_score) }}
              </span>
            </div>
          </div>

          <!-- Detail score bars -->
          <div class="flex-1 self-end space-y-3" style="max-width:480px;">
            <h4 class="text-xs font-bold uppercase tracking-wider mb-3" style="color:rgba(255,255,255,0.4);">
              Điểm chi tiết
            </h4>

            <!-- Experience -->
            <div v-if="analysisData.detailed_scores?.experience_score != null">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[12px] font-semibold text-white">Kinh nghiệm</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-2 flex-1 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.07);">
                  <div class="h-full rounded-full transition-all duration-1000"
                    :style="{ width: (analysisData.detailed_scores.experience_score / 50 * 100) + '%', background: '#60a5fa' }" />
                </div>
                <span class="text-[12px] font-bold flex-shrink-0" style="color:#60a5fa;">
                  {{ analysisData.detailed_scores.experience_score }}/50
                </span>
              </div>
            </div>

            <!-- Skills -->
            <div v-if="analysisData.detailed_scores?.skills_total_score != null">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[12px] font-semibold text-white">Kỹ năng</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-2 flex-1 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.07);">
                  <div class="h-full rounded-full transition-all duration-1000"
                    :style="{ width: (analysisData.detailed_scores.skills_total_score / 30 * 100) + '%', background: '#a78bfa' }" />
                </div>
                <span class="text-[12px] font-bold flex-shrink-0" style="color:#a78bfa;">
                  {{ analysisData.detailed_scores.skills_total_score }}/30
                </span>
              </div>
            </div>

            <!-- Education -->
            <div v-if="analysisData.detailed_scores?.education_score != null">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[12px] font-semibold text-white">Học vấn</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-2 flex-1 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.07);">
                  <div class="h-full rounded-full transition-all duration-1000"
                    :style="{ width: (analysisData.detailed_scores.education_score / 10 * 100) + '%', background: '#4ade80' }" />
                </div>
                <span class="text-[12px] font-bold flex-shrink-0" style="color:#4ade80;">
                  {{ analysisData.detailed_scores.education_score }}/10
                </span>
              </div>
            </div>

            <!-- Career Objectives -->
            <div v-if="analysisData.detailed_scores?.career_objectives_score != null">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[12px] font-semibold text-white">Mục tiêu nghề nghiệp</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-2 flex-1 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.07);">
                  <div class="h-full rounded-full transition-all duration-1000"
                    :style="{ width: (analysisData.detailed_scores.career_objectives_score / 10 * 100) + '%', background: '#fb923c' }" />
                </div>
                <span class="text-[12px] font-bold flex-shrink-0" style="color:#fb923c;">
                  {{ analysisData.detailed_scores.career_objectives_score }}/10
                </span>
              </div>
            </div>

            <!-- Company Fit -->
            <div v-if="analysisData.detailed_scores?.company_fit_score != null">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[12px] font-semibold text-white">Phù hợp công ty</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-2 flex-1 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.07);">
                  <div class="h-full rounded-full transition-all duration-1000"
                    :style="{ width: (analysisData.detailed_scores.company_fit_score / 10 * 100) + '%', background: '#f472b6' }" />
                </div>
                <span class="text-[12px] font-bold flex-shrink-0" style="color:#f472b6;">
                  {{ analysisData.detailed_scores.company_fit_score }}/10
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs for details -->
        <div class="flex gap-2 border-b" style="border-color:rgba(255,255,255,0.1);">
          <button v-for="tab in detailTabs" :key="tab.id"
            class="px-4 py-2 text-sm font-semibold transition-colors relative" :style="{
              color: activeDetailTab === tab.id ? '#60a5fa' : 'rgba(255,255,255,0.5)'
            }" @click="activeDetailTab = tab.id">
            {{ tab.label }}
            <div v-if="activeDetailTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5"
              style="background:linear-gradient(90deg,#60a5fa,#3b82f6);" />
          </button>
        </div>

        <!-- Tab content: Tổng quát -->
        <div v-if="activeDetailTab === 'tongquan'">
          <h4 class="text-sm font-bold text-white mb-3">Tổng quan kỹ năng</h4>

          <!-- Summary Stats -->
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="rounded-lg p-3 text-center" style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2);">
              <p class="text-2xl font-black" style="color:#f87171;">
                {{ analysisData.skills_detail?.missing?.length || 0 }}
              </p>
              <p class="text-[11px]" style="color:rgba(255,255,255,0.5);">Không đáp ứng</p>
            </div>
            <div class="rounded-lg p-3 text-center" style="background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.2);">
              <p class="text-2xl font-black" style="color:#fbbf24;">
                {{ analysisData.skills_detail?.related?.length || 0 }}
              </p>
              <p class="text-[11px]" style="color:rgba(255,255,255,0.5);">Relevance</p>
            </div>
            <div class="rounded-lg p-3 text-center" style="background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.2);">
              <p class="text-2xl font-black" style="color:#4ade80;">
                {{ analysisData.skills_detail?.matched?.length || 0 }}
              </p>
              <p class="text-[11px]" style="color:rgba(255,255,255,0.5);">Perfect Match</p>
            </div>
          </div>

          <!-- Quick preview: Missing skills (clickable like Không Đáp ứng tab) -->
          <div v-if="analysisData.skills_detail?.missing?.length">
            <h5 class="text-xs font-semibold mb-2" style="color:#f87171;">Không đáp ứng</h5>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(skill, idx) in analysisData.skills_detail.missing"
                :key="`miss-preview-${idx}`"
                @click="toggleSkillDetail('missing', idx)"
                class="px-3 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer transition-all"
                :class="{
                  'ring-2 ring-red-400': expandedSkill?.type === 'missing' && expandedSkill?.index === idx
                }"
                :style="{
                  background: skill.severity === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
                  color: skill.severity === 'high' ? '#fca5a5' : '#f87171',
                  border: skill.severity === 'high' ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(239,68,68,0.2)'
                }">
                <span v-if="skill.importance === 'CRITICAL'" class="mr-1 text-[9px] px-1 py-0.5 rounded bg-red-500/30">!</span>
                {{ skill.skill }}
                <span v-if="expandedSkill?.type === 'missing' && expandedSkill?.index === idx" class="ml-1">▼</span>
                <span v-else class="ml-1">▶</span>
              </span>
            </div>
            <div v-if="expandedSkill?.type === 'missing'" class="mt-2 p-3 rounded-lg"
              style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2);">
              <p class="text-[12px]" style="color:rgba(255,255,255,0.8);">
                <span class="text-red-400 font-semibold">Lý do: </span>{{ getExpandedSkill()?.reason }}
              </p>
            </div>
          </div>

          <!-- Quick preview: Perfect Match (clickable like Yêu cầu phù hợp tab) -->
          <div v-if="analysisData.skills_detail?.matched?.length">
            <h5 class="text-xs font-semibold mb-2 mt-3" style="color:#4ade80;">Perfect Match</h5>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(skill, idx) in analysisData.skills_detail.matched"
                :key="`match-preview-${idx}`"
                @click="toggleSkillDetail('matched', idx)"
                class="px-3 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer transition-all"
                :class="{
                  'ring-2 ring-green-400': expandedSkill?.type === 'matched' && expandedSkill?.index === idx
                }"
                style="background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.25);">
                {{ skill.skill }}
                <span v-if="expandedSkill?.type === 'matched' && expandedSkill?.index === idx" class="ml-1">▼</span>
                <span v-else class="ml-1">▶</span>
              </span>
            </div>
            <div v-if="expandedSkill?.type === 'matched'" class="mt-2 p-3 rounded-lg"
              style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2);">
              <p class="text-[12px]" style="color:rgba(255,255,255,0.8);">
                <span class="text-green-400 font-semibold">Lý do: </span>{{ getExpandedSkill()?.reason }}
              </p>
              <p v-if="getExpandedSkill()?.evidence" class="text-[11px] mt-1 italic" style="color:rgba(255,255,255,0.5);">
                {{ getExpandedSkill()?.evidence }}
              </p>
            </div>
          </div>

          <!-- Quick preview: Relevance Match (clickable like Yêu cầu phù hợp tab) -->
          <div v-if="analysisData.skills_detail?.related?.length">
            <h5 class="text-xs font-semibold mb-2 mt-3" style="color:#fbbf24;">Relevance Match</h5>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(skill, idx) in analysisData.skills_detail.related"
                :key="`related-preview-${idx}`"
                @click="toggleSkillDetail('related', idx)"
                class="px-3 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer transition-all"
                :class="{
                  'ring-2 ring-yellow-400': expandedSkill?.type === 'related' && expandedSkill?.index === idx
                }"
                style="background:rgba(251,191,36,0.2); color:#fbbf24; border:2px solid rgba(251,191,36,0.6);">
                {{ skill.skill }}
                <span v-if="expandedSkill?.type === 'related' && expandedSkill?.index === idx" class="ml-1">▼</span>
                <span v-else class="ml-1">▶</span>
              </span>
            </div>
            <div v-if="expandedSkill?.type === 'related'" class="mt-2 p-3 rounded-lg"
              style="background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.2);">
              <p class="text-[12px]" style="color:rgba(255,255,255,0.8);">
                <span class="text-yellow-400 font-semibold">Lý do: </span>{{ getExpandedSkill()?.reason }}
              </p>
              <p v-if="getExpandedSkill()?.evidence" class="text-[11px] mt-1 italic" style="color:rgba(255,255,255,0.5);">
                {{ getExpandedSkill()?.evidence }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tab content: Strengths -->
        <div v-else-if="activeDetailTab === 'strengths'">
          <h4 class="text-sm font-bold text-white mb-3">Điểm mạnh chính</h4>
          <div v-if="!analysisData.main_strengths?.length" class="text-center py-4" style="color:rgba(255,255,255,0.4);">
            Không có dữ liệu điểm mạnh.
          </div>
          <div class="space-y-2">
            <div v-for="(strength, idx) in analysisData.main_strengths" :key="`strength-${idx}`"
              class="px-4 py-3 rounded-lg"
              style="background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.2);">
              <p class="text-[13px] font-semibold leading-relaxed" style="color:#86efac;">
                ✓ {{ getStrengthText(strength) }}
              </p>
              <p v-if="getStrengthDescription(strength)" class="text-[12px] mt-1 leading-relaxed" style="color:rgba(134,239,172,0.7);">
                {{ getStrengthDescription(strength) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tab content: Development -->
        <div v-else-if="activeDetailTab === 'development'">
          <h4 class="text-sm font-bold text-white mb-3">Khu vực cần phát triển</h4>
          <div v-if="!analysisData.areas_for_development?.length" class="text-center py-4" style="color:rgba(255,255,255,0.4);">
            Không có dữ liệu phát triển.
          </div>
          <div class="space-y-2">
            <div v-for="(area, idx) in analysisData.areas_for_development" :key="`area-${idx}`"
              class="px-4 py-3 rounded-lg"
              style="background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2);">
              <p class="text-[13px] font-semibold leading-relaxed" style="color:#93c5fd;">
                {{ getAreaTitle(area) }}
              </p>
              <p v-if="getAreaDescription(area)" class="text-[12px] mt-1 leading-relaxed" style="color:rgba(147,197,253,0.7);">
                {{ getAreaDescription(area) }}
              </p>
              <div v-if="getAreaSuggestions(area)?.length" class="mt-2">
                <span class="text-[11px] font-semibold" style="color:#fbbf24;">Gợi ý: </span>
                <span v-for="(sug, si) in getAreaSuggestions(area)" :key="si"
                  class="text-[11px] ml-1" style="color:rgba(251,191,36,0.8);">
                  {{ si > 0 ? '• ' : '' }}{{ sug }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab content: Recommendation -->
        <div v-else-if="activeDetailTab === 'recommendation'">
          <h4 class="text-sm font-bold text-white mb-3">Khuyến nghị</h4>
          <!-- Render structured recommendation -->
          <div v-if="getRecommendationText()" class="space-y-3">
            <div class="px-4 py-3 rounded-lg"
              style="background:rgba(168,85,247,0.1); border:1px solid rgba(168,85,247,0.2);">
              <p class="text-[13px] leading-relaxed font-semibold" style="color:#d8b4fe;">
                {{ getRecommendationText() }}
              </p>
            </div>
            <!-- Action items -->
            <div v-if="getRecommendationActionItems()?.length">
              <p class="text-xs font-bold mb-2" style="color:rgba(255,255,255,0.5);">Hành động cần thiết:</p>
              <div class="space-y-1">
                <div v-for="(item, idx) in getRecommendationActionItems()" :key="idx"
                  class="flex items-start gap-2 px-3 py-2 rounded-lg"
                  style="background:rgba(168,85,247,0.06); border:1px solid rgba(168,85,247,0.12);">
                  <span class="flex-shrink-0 text-[14px]">•</span>
                  <span class="text-[12px] leading-relaxed" style="color:rgba(216,180,254,0.85);">{{ item }}</span>
                </div>
              </div>
            </div>
            <!-- Interview tips -->
            <div v-if="getRecommendationTips()?.length">
              <p class="text-xs font-bold mb-2 mt-3" style="color:rgba(255,255,255,0.5);">Mẹo phỏng vấn:</p>
              <div class="space-y-1">
                <div v-for="(tip, idx) in getRecommendationTips()" :key="idx"
                  class="flex items-start gap-2 px-3 py-2 rounded-lg"
                  style="background:rgba(251,191,36,0.06); border:1px solid rgba(251,191,36,0.12);">
                  <span class="flex-shrink-0 text-[14px]" style="color:#fbbf24;">→</span>
                  <span class="text-[12px] leading-relaxed" style="color:rgba(251,191,36,0.85);">{{ tip }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- Fallback: plain string -->
          <div v-else-if="typeof analysisData.recommendation === 'string' && analysisData.recommendation"
            class="px-4 py-3 rounded-lg"
            style="background:rgba(168,85,247,0.1); border:1px solid rgba(168,85,247,0.2);">
            <p class="text-[13px] leading-relaxed" style="color:#d8b4fe;">
              {{ analysisData.recommendation }}
            </p>
          </div>
          <div v-else class="text-center py-4" style="color:rgba(255,255,255,0.4);">
            Không có khuyến nghị.
          </div>
        </div>

        <!-- Tab content: Kinh nghiệm -->
        <div v-else-if="activeDetailTab === 'experience'">
          <h4 class="text-sm font-bold text-white mb-4">Đánh giá kinh nghiệm</h4>

          <!-- Metrics grid -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="rounded-lg p-3" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
              <p class="text-[11px] mb-1" style="color:rgba(255,255,255,0.4);">Điểm kinh nghiệm</p>
              <p class="text-xl font-black" style="color:#60a5fa;">{{ getExpDetailMetric('score') }}/50</p>
            </div>
            <div class="rounded-lg p-3" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
              <p class="text-[11px] mb-1" style="color:rgba(255,255,255,0.4);">Điểm JD yêu cầu</p>
              <p class="text-xl font-black" style="color:#a78bfa;">{{ getExpDetailMetric('jd_level') }}</p>
            </div>
            <div class="rounded-lg p-3" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
              <p class="text-[11px] mb-1" style="color:rgba(255,255,255,0.4);">Relevance</p>
              <p class="text-xl font-black" style="color:#4ade80;">{{ getExpDetailMetric('project_relevance') }}</p>
            </div>
            <div class="rounded-lg p-3" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
              <p class="text-[11px] mb-1" style="color:rgba(255,255,255,0.4);">Bonus</p>
              <p class="text-xl font-black" style="color:#fbbf24;">{{ getExpDetailMetric('bonus') }}</p>
            </div>
          </div>

          <!-- Assessment summary -->
          <div class="rounded-lg p-4 mb-4" style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.15);">
            <p class="text-[13px] leading-relaxed" style="color:rgba(255,255,255,0.8);">
              {{ getExpDetailSummary() }}
            </p>
          </div>

          <!-- Years breakdown -->
          <div v-if="getExpDetailYears()" class="rounded-lg p-3 mb-4"
            style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);">
            <p class="text-[12px] leading-relaxed" style="color:rgba(255,255,255,0.6);">
              {{ getExpDetailYears() }}
            </p>
          </div>

          <!-- Projects list -->
          <div v-if="getExpDetailProjects()?.length">
            <h5 class="text-xs font-semibold mb-2" style="color:rgba(255,255,255,0.5);">Dự án</h5>
            <div class="space-y-2">
              <div v-for="(project, idx) in getExpDetailProjects()" :key="idx"
                class="flex items-start gap-2 rounded-lg px-3 py-2"
                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06);">
                <span class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style="background:rgba(59,130,246,0.2); color:#60a5fa;">
                  {{ idx + 1 }}
                </span>
                <span class="text-[12px] text-white">{{ project }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reset button -->
        <div class="text-center pt-4">
          <button class="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style="background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.6);" @click="resetAnalysis">
            ↻ Phân tích lại
          </button>
        </div>
      </div>

      <!-- Reset button -->
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
const isMoreSkills = ref(false)
const analysisData = ref(null)
const analysisSessionId = ref(null)
const activeDetailTab = ref('tongquan')
const analysisProgress = ref(0)
const expandedSkill = ref(null) // { type: 'matched'|'related'|'missing', index: number }

function toggleSkillDetail(type, index) {
  if (expandedSkill.value?.type === type && expandedSkill.value?.index === index) {
    expandedSkill.value = null
  } else {
    expandedSkill.value = { type, index }
  }
}

function getExpandedSkill() {
  if (!expandedSkill.value || !analysisData.value?.skills_detail) return null
  const { type, index } = expandedSkill.value
  return analysisData.value.skills_detail[type]?.[index] || null
}

function getMetricValue(text, key) {
  if (!text) return '—'
  const patterns = {
    years_score: /years_score[=:]?\s*([\d.]+)/i,
    seniority: /seniority[=:]?\s*([\d.]+)/i,
    project_relevance: /Avg\s+project\s+relevance[=:]?\s*([\d.]+)/i,
    bonus: /bonus[=:]?\s*([\d.]+)/i
  }
  const match = text.match(patterns[key])
  return match ? match[1] : '—'
}

function getExperienceLevel(text) {
  if (!text) return 'Không xác định'
  const lower = text.toLowerCase()
  if (lower.includes('fresher') || lower.includes('sinh viên')) return '🎓 Fresher / Sinh viên'
  if (lower.includes('junior')) return '💼 Junior'
  if (lower.includes('senior')) return '⭐ Senior'
  if (lower.includes('lead') || lower.includes('manager')) return '👔 Lead / Manager'
  return '💼 Nhân viên'
}

function getExperienceBadgeStyle(text) {
  if (!text) return { background: 'rgba(255,255,255,0.1)', color: '#aaa' }
  const lower = text.toLowerCase()
  if (lower.includes('senior') || lower.includes('lead') || lower.includes('manager')) {
    return { background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }
  }
  if (lower.includes('junior')) {
    return { background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.4)' }
  }
  if (lower.includes('fresher') || lower.includes('sinh viên')) {
    return { background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.4)' }
  }
  return { background: 'rgba(255,255,255,0.1)', color: '#aaa', border: '1px solid rgba(255,255,255,0.2)' }
}

function getProjects(text) {
  if (!text) return []
  const match = text.match(/Projects?:\s*\[(.*?)\]/i)
  if (!match) return []
  return match[1].split(',').map(p => p.trim().replace(/^["']|["']$/g, '')).filter(p => p)
}

// ── Strength helpers ──────────────────────────────────────────────────────────────────
function getStrengthText(strength) {
  if (!strength) return ''
  if (typeof strength === 'string') return strength
  return strength.title || strength.text || strength.description || ''
}

function getStrengthDescription(strength) {
  if (!strength) return ''
  if (typeof strength === 'string') return ''
  return strength.description || ''
}

// ── Area helpers ───────────────────────────────────────────────────────────────────
function getAreaTitle(area) {
  if (!area) return ''
  if (typeof area === 'string') return area
  return area.title || area.text || ''
}

function getAreaDescription(area) {
  if (!area) return ''
  if (typeof area === 'string') return ''
  return area.description || ''
}

function getAreaSuggestions(area) {
  if (!area) return []
  if (typeof area === 'string') return []
  return area.suggestions || []
}

// ── Recommendation helpers ─────────────────────────────────────────────────────────
function getRecommendationText() {
  const rec = analysisData.value?.recommendation
  if (!rec) return ''
  if (typeof rec === 'string') return rec
  return rec.text || rec.summary || ''
}

function getRecommendationActionItems() {
  const rec = analysisData.value?.recommendation
  if (!rec || typeof rec === 'string') return []
  return rec.action_items || []
}

function getRecommendationTips() {
  const rec = analysisData.value?.recommendation
  if (!rec || typeof rec === 'string') return []
  return rec.interview_tips || []
}

// ── Experience detail helpers ───────────────────────────────────────────────────────
function getExpDetailLevel() {
  const detail = analysisData.value?.experience_detail
  if (!detail) return 'Không xác định'
  if (typeof detail === 'string') return getExperienceLevel(detail)
  const cvLevel = detail.cv_level || ''
  if (cvLevel) {
    const lower = cvLevel.toLowerCase()
    if (lower.includes('fresher') || lower.includes('sinh viên')) return 'Fresher / Sinh viên'
    if (lower.includes('junior')) return 'Junior'
    if (lower.includes('senior')) return 'Senior'
    if (lower.includes('lead') || lower.includes('manager')) return 'Lead / Manager'
    return cvLevel
  }
  return 'Nhân viên'
}

function getExpDetailBadgeStyle() {
  const level = getExpDetailLevel()
  if (level.includes('Senior') || level.includes('Lead')) {
    return { background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }
  }
  if (level.includes('Junior')) {
    return { background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.4)' }
  }
  if (level.includes('Fresher')) {
    return { background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.4)' }
  }
  return { background: 'rgba(255,255,255,0.1)', color: '#aaa', border: '1px solid rgba(255,255,255,0.2)' }
}

function getExpDetailMetric(metric) {
  const detail = analysisData.value?.experience_detail
  if (!detail) return metric === 'score' ? 0 : '—'
  if (typeof detail === 'string') {
    if (metric === 'score') return getMetricValue(detail, 'years_score') || 0
    if (metric === 'seniority') return getMetricValue(detail, 'seniority') || '—'
    if (metric === 'project_relevance') return getMetricValue(detail, 'project_relevance') || '—'
    if (metric === 'bonus') return getMetricValue(detail, 'bonus') || '—'
    if (metric === 'jd_level') return '—'
    return '—'
  }
  if (metric === 'score') return detail.score || 0
  if (metric === 'jd_level') return detail.jd_required_level || '—'
  if (metric === 'project_relevance') {
    const avg = detail.project_relevance_avg
    return avg ? `${(avg * 100).toFixed(0)}%` : '—'
  }
  if (metric === 'bonus') return detail.bonus_val || 0
  return '—'
}

function getExpDetailSummary() {
  const detail = analysisData.value?.experience_detail
  if (!detail) return 'Không có dữ liệu.'
  if (typeof detail === 'string') return detail
  return detail.summary || 'Không có mô tả.'
}

function getExpDetailYears() {
  const detail = analysisData.value?.experience_detail
  if (!detail || typeof detail === 'string') return ''
  const yd = detail.years_detail
  if (!yd || Object.keys(yd).length === 0) return ''
  const total = yd.total_years || 0
  const work = yd.work_years || 0
  const proj = yd.project_years || 0
  return `${total.toFixed(1)} năm kinh nghiệm tổng (${work.toFixed(1)}y làm việc, ${proj.toFixed(1)}y dự án)`
}

function getExpDetailProjects() {
  const detail = analysisData.value?.experience_detail
  if (!detail) return []
  if (typeof detail === 'string') return getProjects(detail)
  return detail.projects || []
}

const detailTabs = [
  { id: 'tongquan', label: 'Tổng quát' },
  { id: 'strengths', label: 'Điểm mạnh' },
  { id: 'development', label: 'Phát triển' },
  { id: 'experience', label: 'Kinh nghiệm' },
  { id: 'recommendation', label: 'Khuyến nghị' }
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
      analysisSessionId.value = response.data.data?.session_id || null
      analysisCompleted.value = true
      activeDetailTab.value = 'tongquan'
      ElMessage.success('Phân tích hoàn thành')
      console.log('[AnalysisPanel] Analysis complete', {
        sessionId: analysisSessionId.value,
        hasSkillsDetail: !!response.data.data?.skills_detail,
        matchedCount: response.data.data?.skills_detail?.matched?.length,
        relatedCount: response.data.data?.skills_detail?.related?.length,
        missingCount: response.data.data?.skills_detail?.missing?.length,
      })
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
  analysisSessionId.value = null
  activeDetailTab.value = 'tongquan'
  expandedSkill.value = null
}
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>