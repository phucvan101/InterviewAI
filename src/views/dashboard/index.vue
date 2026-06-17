<template>
    <LayoutInterview>
        <div class="flex-1 flex flex-col overflow-hidden">

            <!-- Top bar -->
            <header class="flex items-center justify-between px-8 py-5 border-b flex-shrink-0"
                style="border-color:rgba(255,255,255,0.06);">
                <div>
                    <h1 class="text-lg font-black text-white tracking-tight">Phiên phỏng vấn mới</h1>
                    <p class="text-[12px] mt-0.5" style="color:rgba(255,255,255,0.38);">Thiết lập môi trường cho buổi mô
                        phỏng</p>
                </div>
                <!-- <button class="relative w-9 h-9 flex items-center justify-center rounded-xl border transition-colors"
                    style="background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.08); color:rgba(255,255,255,0.5);"
                    @mouseenter="$event.currentTarget.style.background = 'rgba(255,255,255,0.08)'"
                    @mouseleave="$event.currentTarget.style.background = 'rgba(255,255,255,0.04)'">
                    <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"
                        style="width:18px;height:18px;">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                    <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#0f1225]" />
                </button> -->
            </header>

            <!-- Scrollable body -->
            <div class="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                <div v-if="isInterviewFeatureLocked" class="rounded-xl border px-4 py-3 text-sm"
                    style="background:rgba(245,158,11,0.1); border-color:rgba(245,158,11,0.28); color:#fcd34d;">
                    Tài khoản của bạn đang bị khóa. Bạn vẫn có thể xem lịch sử phỏng vấn và báo cáo, nhưng không thể
                    tải tài liệu hoặc tạo phiên phỏng vấn mới.
                </div>

                <!-- ── Step Progress ── -->
                <div class="flex items-center gap-0">
                    <template v-for="(step, i) in steps" :key="step.id">

                        <!-- Step circle -->
                        <div class="flex flex-col items-center gap-1.5 z-10">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300"
                                :style="getStepStyle(step, i)">
                                {{ step.id }}
                            </div>

                            <span class="text-[11px] font-semibold whitespace-nowrap" :style="{
                                color:
                                    step.state === 'active'
                                        ? '#4f46e5'
                                        : step.state === 'done'
                                            ? 'rgba(255,255,255,0.7)'
                                            : 'rgba(255,255,255,0.3)'
                            }">
                                {{ step.label }}
                            </span>
                        </div>

                        <!-- Connector -->
                        <div v-if="i < steps.length - 1"
                            class="flex-1 h-0.5 mx-1 mb-6 rounded-full transition-all duration-500" :style="{
                                background:
                                    i < activeStep
                                        ? 'linear-gradient(90deg,#4f46e5,#4338ca)'
                                        : 'rgba(255,255,255,0.1)'
                            }" />
                    </template>
                </div>

                <!-- ── Section heading ── -->
                <div class="flex items-center gap-2">
                    <div class="w-1 h-5 rounded-full" style="background:linear-gradient(180deg,#6d43f5,#4f32b8);" />
                    <h2 class="text-base font-black text-white">Tài liệu chuẩn bị</h2>
                </div>

                <!-- ── Document cards ── -->
                <div class="grid grid-cols-3 gap-4">
                    <template v-for="(doc, idx) in documents" :key="doc.id">

                        <!-- ═══ Card CV: có logic upload ═══ -->
                        <div v-if="doc.id === 'cv'"
                            class="relative rounded-2xl border p-5 cursor-pointer transition-all duration-200"
                            :class="{ 'opacity-60 cursor-not-allowed': isInterviewFeatureLocked }"
                            :style="getDocStyle(doc)" @click="onCvCardClick" @dragover.prevent @drop="onCvDrop">

                            <!-- Hidden file input -->
                            <input ref="cvFileInputRef" type="file" accept="application/pdf" class="hidden"
                                :disabled="isInterviewFeatureLocked" @change="onCvFileChange" />

                            <!-- Step badge -->
                            <div class="absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                                style="background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.5);">
                                {{ idx + 1 }}
                            </div>

                            <!-- Status badge -->
                            <div class="absolute top-4 right-4">
                                <span
                                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold"
                                    :style="cvBadge.style">
                                    {{ cvBadge.text }}
                                </span>
                            </div>

                            <!-- Icon -->
                            <div class="flex justify-center mt-4 mb-4">
                                <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
                                    :style="{ background: doc.iconBg }">
                                    <span v-html="doc.icon" style="width:26px;height:26px;" />
                                </div>
                            </div>

                            <!-- State: IDLE -->
                            <div v-if="cvUploadState === 'idle'" class="text-center">
                                <h3 class="text-sm font-bold text-white mb-1.5">{{ doc.title }}</h3>
                                <p class="text-[11.5px] leading-relaxed" style="color:rgba(255,255,255,0.42);">
                                    Kéo thả hoặc nhấp để chọn
                                </p>
                            </div>

                            <!-- State: UPLOADING -->
                            <div v-else-if="cvUploadState === 'uploading'" class="text-center">
                                <h3 class="text-sm font-bold text-white mb-1">{{ cvFileName }}</h3>
                                <p class="text-[11px] mb-3" style="color:rgba(255,255,255,0.4);">
                                    Đang tải lên... {{ cvUploadProgress }}%
                                </p>
                                <!-- Progress bar -->
                                <div class="w-full h-1.5 rounded-full overflow-hidden"
                                    style="background:rgba(255,255,255,0.08);">
                                    <div class="h-full rounded-full transition-all duration-300"
                                        style="background:linear-gradient(90deg,#4f46e5,#60a5fa);"
                                        :style="{ width: cvUploadProgress + '%' }" />
                                </div>
                            </div>

                            <!-- State: SUCCESS -->
                            <div v-else-if="cvUploadState === 'success'" class="text-center">
                                <div class="flex justify-center mb-2">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center"
                                        style="background:rgba(34,197,94,0.2);">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4ade80"
                                            stroke-width="2.5">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 class="text-sm font-bold text-white mb-1 truncate px-2">{{ cvFileName }}</h3>
                                <button class="text-[11px] mt-1 underline underline-offset-2"
                                    style="color:rgba(255,255,255,0.35);" @click.stop="retryCvUpload">
                                    Tải lại
                                </button>
                            </div>

                            <!-- State: ERROR -->
                            <div v-else-if="cvUploadState === 'error'" class="text-center">
                                <h3 class="text-sm font-bold mb-1" style="color:#f87171;">Tải lên thất bại</h3>
                                <p class="text-[11px] mb-2" style="color:rgba(255,255,255,0.4);">{{ cvErrorMsg }}</p>
                                <button class="text-[11px] underline underline-offset-2" style="color:#60a5fa;"
                                    @click.stop="retryCvUpload">
                                    Thử lại
                                </button>
                            </div>

                            <!-- Arrow connector -->
                            <div v-if="idx < documents.length - 1"
                                class="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 rounded-full"
                                style="background:#1a1e35; border:1px solid rgba(255,255,255,0.08);">
                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)"
                                    stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </div>
                        </div>

                        <!-- ═══ Card JD: có logic upload ═══ -->
                        <div v-else-if="doc.id === 'job-description'"
                            class="relative rounded-2xl border p-5 cursor-pointer transition-all duration-200"
                            :class="{ 'opacity-60 cursor-not-allowed': isInterviewFeatureLocked }"
                            :style="getJdDocStyle()" @click="jdInputMode === 'file' ? onJdCardClick() : null"
                            @dragover.prevent @drop="jdInputMode === 'file' ? onJdDrop($event) : null">

                            <!-- Hidden file input -->
                            <input ref="jdFileInputRef" type="file"
                                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                class="hidden" @change="onJdFileChange" />

                            <!-- Step badge -->
                            <div class="absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                                style="background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.5);">
                                {{ idx + 1 }}
                            </div>

                            <!-- Status badge (Dynamic) -->
                            <div class="absolute top-4 right-4">
                                <span
                                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold"
                                    :style="jdBadgeStyle">
                                    {{ jdBadgeText }}
                                </span>
                            </div>

                            <!-- Icon -->
                            <div class="flex justify-center mt-4 mb-4">
                                <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
                                    :style="{ background: doc.iconBg }">
                                    <span v-html="doc.icon" style="width:26px;height:26px;" />
                                </div>
                            </div>

                            <!-- State: IDLE -->
                            <div v-if="jobDescriptionUploadState === 'idle'" class="text-center">
                                <h3 class="text-sm font-bold text-white mb-1.5">{{ doc.title }}</h3>
                                <div class="flex items-center justify-center gap-2 mb-3">
                                    <button class="px-2.5 py-1 rounded text-[11px] border"
                                        :style="jdInputMode === 'file'
                                            ? 'background:rgba(59,130,246,0.2); border-color:rgba(59,130,246,0.35); color:#93c5fd;'
                                            : 'background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.65);'"
                                        :disabled="isInterviewFeatureLocked" @click.stop="jdInputMode = 'file'">
                                        Upload file
                                    </button>
                                    <button class="px-2.5 py-1 rounded text-[11px] border"
                                        :style="jdInputMode === 'text'
                                            ? 'background:rgba(59,130,246,0.2); border-color:rgba(59,130,246,0.35); color:#93c5fd;'
                                            : 'background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.65);'"
                                        :disabled="isInterviewFeatureLocked" @click.stop="jdInputMode = 'text'">
                                        Dán text
                                    </button>
                                </div>
                                <p v-if="jdInputMode === 'file'" class="text-[11.5px] leading-relaxed"
                                    style="color:rgba(255,255,255,0.42);">
                                    Kéo thả hoặc nhấp để chọn file DOCX/PDF
                                </p>
                                <div v-else class="space-y-2">
                                    <textarea v-model="jobDescriptionText" rows="4"
                                        class="w-full rounded-lg p-2 text-[12px] bg-[#0f1326] border border-white/10 text-white outline-none resize-none"
                                        placeholder="Dán nội dung JD tại đây..." @click.stop />
                                    <button
                                        class="w-full px-3 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                        style="background:linear-gradient(90deg,#3b82f6,#2563eb); color:white;"
                                        :disabled="isInterviewFeatureLocked || !jobDescriptionText.trim() || jobDescriptionUploadState === 'uploading'"
                                        @click.stop="handleJdTextUploadRequest">
                                        Xong
                                    </button>
                                </div>
                                <p v-if="jdInputMode === 'text'" class="text-[11px] mt-1"
                                    style="color:rgba(255,255,255,0.42);">
                                    Nhấn "Xong" để gửi nội dung JD về BE
                                </p>
                            </div>

                            <!-- State: UPLOADING -->
                            <div v-else-if="jobDescriptionUploadState === 'uploading'" class="text-center">
                                <h3 class="text-sm font-bold text-white mb-1">{{ jobDescriptionFileName }}</h3>
                                <p class="text-[11px] mb-3" style="color:rgba(255,255,255,0.4);">
                                    Đang tải lên... {{ jobDescriptionUploadProgress }}%
                                </p>
                                <!-- Progress bar -->
                                <div class="w-full h-1.5 rounded-full overflow-hidden"
                                    style="background:rgba(255,255,255,0.08);">
                                    <div class="h-full rounded-full transition-all duration-300"
                                        style="background:linear-gradient(90deg,#4f46e5,#60a5fa);"
                                        :style="{ width: jobDescriptionUploadProgress + '%' }" />
                                </div>
                            </div>

                            <!-- State: SUCCESS -->
                            <div v-else-if="jobDescriptionUploadState === 'success'" class="text-center">
                                <div class="flex justify-center mb-2">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center"
                                        style="background:rgba(34,197,94,0.2);">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4ade80"
                                            stroke-width="2.5">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 class="text-sm font-bold text-white mb-1 truncate px-2">{{ jobDescriptionFileName }}
                                </h3>
                                <button class="text-[11px] mt-1 underline underline-offset-2"
                                    style="color:rgba(255,255,255,0.35);" @click.stop="resetJdUpload">
                                    Tải lại
                                </button>
                            </div>

                            <!-- State: ERROR -->
                            <div v-else-if="jobDescriptionUploadState === 'error'" class="text-center">
                                <h3 class="text-sm font-bold mb-1" style="color:#f87171;">Tải lên thất bại</h3>
                                <p class="text-[11px] mb-2" style="color:rgba(255,255,255,0.4);">{{ jdErrorMsg }}</p>
                                <button class="text-[11px] underline underline-offset-2" style="color:#60a5fa;"
                                    @click.stop="resetJdUpload">
                                    Thử lại
                                </button>
                            </div>

                            <!-- Arrow connector -->
                            <div v-if="idx < documents.length - 1"
                                class="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 rounded-full"
                                style="background:#1a1e35; border:1px solid rgba(255,255,255,0.08);">
                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)"
                                    stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </div>
                        </div>

                        <!-- ═══ Card Company Research: có logic upload ═══ -->
                        <div v-else-if="doc.id === 'company-research'"
                            class="relative rounded-2xl border p-5 cursor-pointer transition-all duration-200"
                            :class="{ 'opacity-60 cursor-not-allowed': isInterviewFeatureLocked }"
                            :style="getCompanyDocStyle()"
                            @click="companyInputMode === 'file' ? onCompanyCardClick() : null" @dragover.prevent
                            @drop="companyInputMode === 'file' ? onCompanyDrop($event) : null">

                            <!-- Hidden file input -->
                            <input ref="companyFileInputRef" type="file"
                                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                                class="hidden" :disabled="isInterviewFeatureLocked" @change="onCompanyFileChange" />

                            <!-- Step badge -->
                            <div class="absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                                style="background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.5);">
                                {{ idx + 1 }}
                            </div>

                            <!-- Status badge -->
                            <div class="absolute top-4 right-4">
                                <span
                                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold"
                                    :style="companyBadge.style">
                                    {{ companyBadge.text }}
                                </span>
                            </div>

                            <!-- Icon -->
                            <div class="flex justify-center mt-4 mb-4">
                                <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
                                    :style="{ background: doc.iconBg }">
                                    <span v-html="doc.icon" style="width:26px;height:26px;" />
                                </div>
                            </div>

                            <!-- State: IDLE -->
                            <div v-if="companyUploadState === 'idle'" class="text-center">
                                <h3 class="text-sm font-bold text-white mb-1.5">{{ doc.title }}</h3>
                                <div class="flex items-center justify-center gap-2 mb-3">
                                    <button class="px-2.5 py-1 rounded text-[11px] border"
                                        :style="companyInputMode === 'file'
                                            ? 'background:rgba(168,85,247,0.2); border-color:rgba(168,85,247,0.35); color:#d8b4fe;'
                                            : 'background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.65);'"
                                        :disabled="isInterviewFeatureLocked" @click.stop="companyInputMode = 'file'">
                                        Upload file
                                    </button>
                                    <button class="px-2.5 py-1 rounded text-[11px] border"
                                        :style="companyInputMode === 'text'
                                            ? 'background:rgba(168,85,247,0.2); border-color:rgba(168,85,247,0.35); color:#d8b4fe;'
                                            : 'background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.65);'"
                                        :disabled="isInterviewFeatureLocked" @click.stop="companyInputMode = 'text'">
                                        Dán text
                                    </button>
                                </div>
                                <p v-if="companyInputMode === 'file'" class="text-[11.5px] leading-relaxed"
                                    style="color:rgba(255,255,255,0.42);">
                                    Kéo thả hoặc nhấp để chọn file DOCX/PDF
                                </p>
                                <div v-else class="space-y-2">
                                    <textarea v-model="companyResearchText" rows="4"
                                        class="w-full rounded-lg p-2 text-[12px] bg-[#0f1326] border border-white/10 text-white outline-none resize-none"
                                        placeholder="Dán nội dung nghiên cứu công ty..." @click.stop />
                                    <button
                                        class="w-full px-3 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                        style="background:linear-gradient(90deg,#a855f7,#9333ea); color:white;"
                                        :disabled="isInterviewFeatureLocked || !companyResearchText.trim() || companyUploadState === 'uploading'"
                                        @click.stop="handleCompanyTextUploadRequest">
                                        Xong
                                    </button>
                                </div>
                                <p v-if="companyInputMode === 'text'" class="text-[11px] mt-1"
                                    style="color:rgba(255,255,255,0.42);">
                                    Nhấn "Xong" để gửi nội dung Company Research về BE
                                </p>
                            </div>

                            <!-- State: UPLOADING -->
                            <div v-else-if="companyUploadState === 'uploading'" class="text-center">
                                <h3 class="text-sm font-bold text-white mb-1">{{ companyFileName }}</h3>
                                <p class="text-[11px] mb-3" style="color:rgba(255,255,255,0.4);">
                                    Đang tải lên... {{ companyUploadProgress }}%
                                </p>
                                <!-- Progress bar -->
                                <div class="w-full h-1.5 rounded-full overflow-hidden"
                                    style="background:rgba(255,255,255,0.08);">
                                    <div class="h-full rounded-full transition-all duration-300"
                                        style="background:linear-gradient(90deg,#a855f7,#d946ef);"
                                        :style="{ width: companyUploadProgress + '%' }" />
                                </div>
                            </div>

                            <!-- State: SUCCESS -->
                            <div v-else-if="companyUploadState === 'success'" class="text-center">
                                <div class="flex justify-center mb-2">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center"
                                        style="background:rgba(34,197,94,0.2);">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4ade80"
                                            stroke-width="2.5">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 class="text-sm font-bold text-white mb-1 truncate px-2">{{ companyFileName }}</h3>
                                <button class="text-[11px] mt-1 underline underline-offset-2"
                                    style="color:rgba(255,255,255,0.35);" @click.stop="resetCompanyUpload">
                                    Tải lại
                                </button>
                            </div>

                            <!-- State: ERROR -->
                            <div v-else-if="companyUploadState === 'error'" class="text-center">
                                <h3 class="text-sm font-bold mb-1" style="color:#f87171;">Tải lên thất bại</h3>
                                <p class="text-[11px] mb-2" style="color:rgba(255,255,255,0.4);">{{ companyErrorMsg }}
                                </p>
                                <button class="text-[11px] underline underline-offset-2" style="color:#60a5fa;"
                                    @click.stop="resetCompanyUpload">
                                    Thử lại
                                </button>
                            </div>

                            <!-- Arrow connector -->
                            <div v-if="idx < documents.length - 1"
                                class="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 rounded-full"
                                style="background:#1a1e35; border:1px solid rgba(255,255,255,0.08);">
                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)"
                                    stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </div>
                        </div>

                        <!-- ═══ Card thường (fallback) ═══ -->
                        <div v-else
                            class="relative rounded-2xl border p-5 cursor-pointer transition-all duration-200 group"
                            :style="getDocStyle(doc)" @mouseenter="hoveredDoc = idx" @mouseleave="hoveredDoc = null">

                            <div class="absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                                style="background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.5);">
                                {{ idx + 1 }}
                            </div>

                            <div v-if="doc.badge" class="absolute top-4 right-4">
                                <span
                                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold"
                                    :style="doc.badge.style">
                                    {{ doc.badge.text }}
                                </span>
                            </div>

                            <div class="flex justify-center mt-4 mb-5">
                                <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
                                    :style="{ background: doc.iconBg }">
                                    <span v-html="doc.icon" style="width:26px;height:26px;" />

                                </div>
                            </div>

                            <div v-if="doc.completed" class="flex justify-center mb-3">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center"
                                    style="background:rgba(34,197,94,0.2);">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4ade80"
                                        stroke-width="2.5">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </div>
                            </div>

                            <div v-if="idx < documents.length - 1"
                                class="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 rounded-full"
                                style="background:#1a1e35; border:1px solid rgba(255,255,255,0.08);">
                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)"
                                    stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </div>

                            <div class="text-center">
                                <h3 class="text-sm font-bold text-white mb-1.5">{{ doc.title }}</h3>
                                <p @click="onDocClick(doc)" class="text-[11.5px] leading-relaxed"
                                    style="color:rgba(255,255,255,0.42);">{{
                                        doc.desc }}</p>
                            </div>
                        </div>

                    </template>
                </div>

                <!-- ── Bottom panels ── -->
                <div class="space-y-6">

                    <!-- Fit analysis - using AnalysisPanel component -->
                    <div ref="analysisPanelRef">
                        <AnalysisPanel :cvReady="cvReady" :jdReady="jdReady" :cvFilePath="cvPath" :jdFilePath="jdPath"
                            :companyFilePath="companyPath"
                            :can-use-interview-features="authStore.canUseInterviewFeatures"
                            @analysis-complete="handleAnalysisComplete" @analysis-reset="analysisReady = false" />
                    </div>

                    <!-- Action button -->
                    <div class="flex justify-end pt-2">
                        <button :disabled="isInterviewFeatureLocked || !analysisReady || isStartingConversation"
                            @click="startConversation"
                            class="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 btn-common"
                            @mouseenter="$event.currentTarget.style.transform = 'translateY(-1px)'; $event.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.55)'"
                            @mouseleave="$event.currentTarget.style.transform = ''; $event.currentTarget.style.boxShadow = '0 4px 18px rgba(79,70,229,0.4)'">
                            {{ isStartingConversation ? 'Đang tạo phiên...' : 'Vào phòng phỏng vấn' }}
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                stroke-width="2.2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div><!-- end scrollable -->
        </div><!-- end main container -->

        <!--- Job Description Dialog --->
        <el-dialog title="Mô tả công việc" v-model="showJobDescriptionDialog" width="600px" class="custom-dialog">
            <div class="space-y-4">

                <!-- TEXT INPUT -->
                <div>
                    <label class="block text-sm font-semibold mb-1">
                        Dán mô tả công việc
                    </label>
                    <el-input v-model="jobDescriptionText" type="textarea" :rows="6"
                        placeholder="Dán nội dung mô tả công việc..." class="w-full" />
                </div>

                <!-- OR -->
                <div class="text-center text-xs text-gray-400">HOẶC</div>

                <!-- UPLOAD FILE -->
                <div>
                    <label class="block text-sm font-semibold mb-1">
                        Tải file (DOCX, PDF)
                    </label>

                    <!-- Upload Status -->
                    <div v-if="jobDescriptionUploadState === 'idle'"
                        class="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                        @click="jdFileInputRef?.$el?.click?.() || $refs.jdFileInput?.click?.()">
                        <svg class="w-8 h-8 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <p class="text-sm text-gray-400">Kéo thả file vào đây hoặc click để chọn</p>
                    </div>

                    <div v-else-if="jobDescriptionUploadState === 'uploading'"
                        class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
                        <p class="text-sm text-white mb-2">{{ jobDescriptionFileName }}</p>
                        <p class="text-xs text-gray-400">Đang xử lý...</p>
                    </div>

                    <div v-else-if="jobDescriptionUploadState === 'success'"
                        class="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
                        <div class="flex justify-center mb-2">
                            <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p class="text-sm text-white">{{ jobDescriptionFileName }}</p>
                        <button class="text-xs text-blue-400 mt-2 underline" @click="resetJdUpload">Tải lại</button>
                    </div>

                    <div v-else-if="jobDescriptionUploadState === 'error'"
                        class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
                        <p class="text-sm text-red-400 mb-2">Lỗi: {{ jdErrorMsg }}</p>
                        <button class="text-xs text-blue-400 underline" @click="resetJdUpload">Thử lại</button>
                    </div>

                    <!-- Hidden file input -->
                    <input ref="jdFileInputRef" type="file"
                        accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        class="hidden" :disabled="isInterviewFeatureLocked" @change="onJdFileChange" />
                </div>

            </div>

            <!-- FOOTER -->
            <template #footer>
                <div class="flex justify-end gap-2">
                    <el-button @click="showJobDescriptionDialog = false">
                        Hủy
                    </el-button>

                    <el-button class="btn-primary" style="border-radius: 5px;" @click="handleSubmit"
                        :disabled="!jobDescriptionText.trim()">
                        Xác nhận
                    </el-button>
                </div>
            </template>
        </el-dialog>


    </LayoutInterview>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import LayoutInterview from '../layouts/LayoutInterview.vue'
import AnalysisPanel from '@/components/AnalysisPanel.vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { useRouter } from 'vue-router'

const showJobDescriptionDialog = ref(false);
const analysisReady = ref(false)
const sessionId = ref(null)
const cv_raw_text = ref('')
const jd_raw_text = ref('')
const isStartingConversation = ref(false)
const analysisData = ref({})


const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
const authStore = useAuthStore()
const router = useRouter()
const isInterviewFeatureLocked = computed(() => !authStore.canUseInterviewFeatures)
const lockedFeatureMessage = 'Tài khoản của bạn đang bị khóa. Bạn vẫn có thể xem lịch sử phỏng vấn và báo cáo, nhưng không thể tải tài liệu hoặc tạo phiên phỏng vấn mới.'

function buildApiUrl(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    if (!API_BASE_URL) {
        return normalizedPath
    }

    if (API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api/')) {
        return `${API_BASE_URL.slice(0, -4)}${normalizedPath}`
    }

    return `${API_BASE_URL}${normalizedPath}`
}


function handleAnalysisComplete(data) {

    sessionId.value = data.session_id
    analysisData.value = data

    console.log('sessionId:', sessionId.value)
}

function notifyLockedFeature() {
    ElNotification.warning({
        title: 'Tài khoản bị khóa',
        message: lockedFeatureMessage,
        duration: 4000,
    })
}

function ensureCanUseInterviewFeatures() {
    if (!isInterviewFeatureLocked.value) return true
    notifyLockedFeature()
    return false
}

// ── Steps ────────────────────────────────────────────────────────────────────
const activeStep = ref(0) // 0-indexed

const steps = [
    { id: 1, label: 'Tải tài liệu', state: 'active' },
    { id: 2, label: 'Phân tích', state: 'pending' },
    { id: 3, label: 'Phỏng vấn', state: 'pending' },
]

function getStepStyle(step, i) {
    // Step hiện tại
    if (step.state === 'active') {
        return `
            background:#4f46e5;
            border-color:#4f46e5;
            color:#fff;
            box-shadow:0 0 0 4px rgba(79,70,229,0.25);
        `
    }

    // Step đã hoàn thành
    if (i < activeStep.value) {
        return `
            background:#1a1e35;
            border-color:#4f46e5;
            color:#4f46e5;
        `
    }

    // Step chưa tới
    return `
        background:rgba(255,255,255,0.04);
        border-color:rgba(255,255,255,0.12);
        color:rgba(255,255,255,0.35);
    `
}

// ── Documents ────────────────────────────────────────────────────────────────
const hoveredDoc = ref(null)

const documents = [
    {
        id: 'cv',
        title: 'Tải CV lên (PDF)',
        iconBg: 'rgba(109,67,245,0.2)',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="#a78bfa" stroke-width="1.8">
                 <path stroke-linecap="round" stroke-linejoin="round"
                   d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5
                      A1.125 1.125 0 0 1 13.5 7.125v-1.5
                      a3.375 3.375 0 0 0-3.375-3.375H8.25
                      m.75 12 3 3m0 0 3-3m-3 3v-6
                      m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25
                      c0 .621.504 1.125 1.125 1.125h12.75
                      c.621 0 1.125-.504 1.125-1.125V11.25
                      a9 9 0 0 0-9-9Z"/>
               </svg>`,
    },
    {
        id: 'job-description',
        title: 'Mô tả công việc',
        desc: 'Dán văn bản hoặc tải file',
        completed: false,
        iconBg: 'rgba(59,130,246,0.18)',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="#60a5fa" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>`,
    },

    {
        id: 'company-research',
        title: 'Nghiên cứu công ty',
        desc: 'Giá trị, sứ mệnh, báo cáo',
        completed: false,
        iconBg: 'rgba(168,85,247,0.18)',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="#c084fc" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>`,
        badge: { text: 'TÙY CHỌN', style: 'background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.1);', dot: false },
    },
]


// ── CV Analysis ───────────────────────────────────────────────────────────────
const fitPercent = ref(78)
const cvTabs = ['Tóm tắt', 'Kinh nghiệm', 'Kỹ năng']
const activeTab = ref('Tóm tắt')

// ── CV Upload ─────────────────────────────────────────────────────────────────
const cvUploadState = ref('idle')
const cvUploadProgress = ref(0)
const cvFileName = ref('')
const cvErrorMsg = ref('')
const cvFileInputRef = ref(null)

// ── Job Description Upload ─────────────────────────────────────────────────────
const jobDescriptionText = ref('')
const jdInputMode = ref('file')
const jobDescriptionFileName = ref('')
const jobDescriptionUploadState = ref('idle')
const jobDescriptionUploadProgress = ref(0)
const jdErrorMsg = ref('')
const jdFileInputRef = ref(null)
const fileName = ref('')  // for compatibility

// ── File paths for analysis ───────────────────────────────────────────────────
const cvPath = ref(null)
const jdPath = ref(null)
const companyPath = ref(null)  // Optional company research path
const cvData = ref(null)
const jdData = ref(null)

// ── Company Research Upload ─────────────────────────────────────────────────
const companyFileName = ref('')
const companyInputMode = ref('file')
const companyResearchText = ref('')
const companyUploadState = ref('idle')
const companyUploadProgress = ref(0)
const companyErrorMsg = ref('')
const companyFileInputRef = ref(null)

// ── Computed: Check if CV & JD are ready ───────────────────────────────────
const cvReady = computed(() => cvUploadState.value === 'success')
const jdReady = computed(() => jobDescriptionUploadState.value === 'success')

function onCvCardClick() {
    if (!ensureCanUseInterviewFeatures()) return

    const el = cvFileInputRef.value
    // kiểm tra chắc chắn là DOM element có method click
    if ((cvUploadState.value === 'idle' || cvUploadState.value === 'error') && el && typeof el.click === 'function') {
        el.click()
        return
    }

    // fallback: tạo input tạm nếu ref không hợp lệ
    if (cvUploadState.value === 'idle' || cvUploadState.value === 'error') {
        const tmp = document.createElement('input')
        tmp.type = 'file'
        tmp.accept = 'application/pdf'
        tmp.onchange = (e) => onCvFileChange(e)
        tmp.click()
    }
}

async function handleCvUpload(file) {
    if (!ensureCanUseInterviewFeatures()) return
    if (!file) return
    if (file.type !== 'application/pdf') {
        cvUploadState.value = 'error'
        cvErrorMsg.value = 'Chỉ chấp nhận file PDF'
        return
    }

    cvFileName.value = file.name
    cvUploadState.value = 'uploading'
    cvUploadProgress.value = 0

    const formData = new FormData()
    formData.append('file', file)

    try {
        // Ưu tiên localStorage vì token được lưu ở đó sau login
        const token = localStorage.getItem('access_token') ||
            localStorage.getItem('token') ||
            authStore.token
        const headers = {}

        if (token) {
            headers.Authorization = `Bearer ${token}`
            console.log('🔐 CV Token found:', token.substring(0, 30) + '...')
        } else {
            console.error('❌ CV: NO TOKEN FOUND!')
            console.log('   - localStorage access_token:', localStorage.getItem('access_token'))
            console.log('   - localStorage token:', localStorage.getItem('token'))
            console.log('   - authStore.token:', authStore.token)
            cvUploadState.value = 'error'
            cvErrorMsg.value = 'Chưa đăng nhập. Vui lòng đăng nhập lại.'
            return
        }

        console.log('🌐 CV Uploading to:', buildApiUrl('/api/v1/cv-profiles/upload'))
        console.log('📦 CV FormData size:', file.size, 'bytes')

        const response = await axios.post(buildApiUrl('/api/v1/cv-profiles/upload'), formData, {
            headers,
            onUploadProgress: (e) => {
                cvUploadProgress.value = Math.round((e.loaded / e.total) * 100)
            },
        })

        cvUploadProgress.value = 100
        // Lưu file_path trả về từ server
        cvPath.value = response.data.file_path
        cvFileName.value = response.data.file_name
        cvUploadState.value = 'success'
        console.log('✅ CV uploaded successfully:', response.data)
    } catch (err) {
        cvUploadState.value = 'error'
        cvErrorMsg.value = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại'
        console.error('❌ CV upload error:', err)
    }
}

function onCvFileChange(e) {
    if (!ensureCanUseInterviewFeatures()) return
    const file = e.target.files?.[0]
    if (file) handleCvUpload(file)
}

function onCvDrop(e) {
    e.preventDefault()
    if (!ensureCanUseInterviewFeatures()) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleCvUpload(file)
}

function retryCvUpload() {
    cvUploadState.value = 'idle'
    cvUploadProgress.value = 0
    cvFileName.value = ''
    cvErrorMsg.value = ''
    cvPath.value = null
    if (cvFileInputRef.value) cvFileInputRef.value.value = ''
}

// Badge computed theo trạng thái thực tế
const cvBadge = computed(() => {
    switch (cvUploadState.value) {
        case 'uploading': return {
            text: '⏳ ĐANG TẢI',
            style: 'background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.25);'
        }
        case 'success': return {
            text: '● HOÀN THÀNH',
            style: 'background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.25);'
        }
        case 'error': return {
            text: '✕ LỖI',
            style: 'background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.25);'
        }
        default: return {
            text: '↑ CHƯA TẢI',
            style: 'background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.45); border:1px solid rgba(255,255,255,0.1);'
        }
    }
})


const cvCardBorderColor = computed(() => ({
    idle: 'rgba(255,255,255,0.07)',
    uploading: 'rgba(59,130,246,0.35)',
    success: 'rgba(34,197,94,0.25)',
    error: 'rgba(239,68,68,0.3)',
}[cvUploadState.value]))


function getDocStyle(doc) {
    if (doc.id === 'cv') return `background:#141728; border-color:${cvCardBorderColor.value};`
    if (doc.completed) return 'background:#141728; border-color:rgba(34,197,94,0.2);'
    return 'background:#141728; border-color:rgba(255,255,255,0.07);'
}

function onDocClick(doc) {
    // Now company research is handled by the card upload, no modal needed
}

async function getInforInterview(id_session) {
    try {
        const response = await authStore.authorizedRequest(`/api/v1/analysis/${id_session}`, {
            method: 'GET',
        })
        cv_raw_text.value = response.cv_raw_text
        jd_raw_text.value = response.jd_raw_text

    } catch (error) {
        console.log(error)
    }
}

async function startConversation() {
    if (!ensureCanUseInterviewFeatures()) return

    if (!cvPath.value || !jdPath.value) {
        ElNotification.warning({
            title: 'Thiếu tài liệu',
            message: 'Vui lòng đảm bảo bạn đã tải lên cả CV và Mô tả công việc để bắt đầu phiên phỏng vấn.',
            duration: 3000,
        })
        return
    }

    isStartingConversation.value = true

    try {
        const response = await authStore.authorizedRequest('/api/v1/conversations/', {
            method: 'POST',
            body: {
                analysis_session_id: sessionId.value,
                job_description: jd_raw_text.value,
                cv_profile: cv_raw_text.value,
            },
        })

        const conversationSessionId = response.session_id
        if (!conversationSessionId) {
            throw new Error('Backend không trả về session_id')
        }

        router.push(`/interview/${conversationSessionId}`)
    } catch (err) {
        ElMessage.error(err.message || 'Không thể tạo phiên phỏng vấn')
    } finally {
        isStartingConversation.value = false
    }
}

async function handleJdTextSubmit() {
    await handleJdTextUploadRequest()
}

async function handleSubmit() {
    await handleJdTextSubmit()
}

function resetJdUpload() {
    jobDescriptionUploadState.value = 'idle'
    jobDescriptionUploadProgress.value = 0
    jobDescriptionFileName.value = ''
    jdErrorMsg.value = ''
    jdPath.value = null
    jdInputMode.value = 'file'
    jobDescriptionText.value = ''
    if (jdFileInputRef.value) jdFileInputRef.value.value = ''
}

const jdBadge = computed(() => {
    switch (jobDescriptionUploadState.value) {
        case 'uploading': return {
            text: '⏳ ĐANG TẢI',
            style: 'background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.25);'
        }
        case 'success': return {
            text: '● HOÀN THÀNH',
            style: 'background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.25);'
        }
        case 'error': return {
            text: '✕ LỖI',
            style: 'background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.25);'
        }
        default: return {
            text: '↑ CHƯA TẢI',
            style: 'background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.45); border:1px solid rgba(255,255,255,0.1);'
        }
    }
})

const jdBadgeText = computed(() => jdBadge.value.text)
const jdBadgeStyle = computed(() => jdBadge.value.style)

const jdCardBorderColor = computed(() => ({
    idle: 'rgba(255,255,255,0.07)',
    uploading: 'rgba(59,130,246,0.35)',
    success: 'rgba(34,197,94,0.25)',
    error: 'rgba(239,68,68,0.3)',
}[jobDescriptionUploadState.value]))

function getJdDocStyle() {
    return `background:#141728; border-color:${jdCardBorderColor.value};`
}

// ── Company Badge & Border Color ─────────────────────────────────────────────
const companyBadge = computed(() => {
    switch (companyUploadState.value) {
        case 'uploading': return {
            text: '⏳ ĐANG TẢI',
            style: 'background:rgba(168,85,247,0.15); color:#d946ef; border:1px solid rgba(168,85,247,0.25);'
        }
        case 'success': return {
            text: '✓ HOÀN THÀNH',
            style: 'background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.25);'
        }
        case 'error': return {
            text: '✕ LỖI',
            style: 'background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.25);'
        }
        default: return {
            text: '↑ TÙY CHỌN',
            style: 'background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.45); border:1px solid rgba(255,255,255,0.1);'
        }
    }
})

const companyCardBorderColor = computed(() => ({
    idle: 'rgba(255,255,255,0.07)',
    uploading: 'rgba(168,85,247,0.35)',
    success: 'rgba(34,197,94,0.25)',
    error: 'rgba(239,68,68,0.3)',
}[companyUploadState.value]))

function getCompanyDocStyle() {
    return `background:#141728; border-color:${companyCardBorderColor.value};`
}

function onJdCardClick() {
    if (!ensureCanUseInterviewFeatures()) return

    const el = jdFileInputRef.value
    if ((jobDescriptionUploadState.value === 'idle' || jobDescriptionUploadState.value === 'error') && el && typeof el.click === 'function') {
        el.click()
        return
    }

    if (jobDescriptionUploadState.value === 'idle' || jobDescriptionUploadState.value === 'error') {
        const tmp = document.createElement('input')
        tmp.type = 'file'
        tmp.accept = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,.pdf'
        tmp.onchange = (e) => onJdFileChange(e)
        tmp.click()
    }
}

function onJdFileChange(e) {
    if (!ensureCanUseInterviewFeatures()) return
    jdInputMode.value = 'file'
    const file = e.target.files?.[0]
    console.log('🔍 onJdFileChange called, file:', file?.name)
    if (file) handleJdFileUploadRequest(file)
}

function onJdDrop(e) {
    e.preventDefault()
    if (!ensureCanUseInterviewFeatures()) return
    const file = e.dataTransfer.files?.[0]
    console.log('🔍 onJdDrop called, file:', file?.name)
    if (file) handleJdFileUploadRequest(file)
}

async function handleJdFileUploadRequest(file) {
    if (!ensureCanUseInterviewFeatures()) return
    console.log('▶️ handleJdFileUploadRequest started, file:', file?.name)
    if (!file) return

    const fileNameLower = file.name.toLowerCase()
    console.log('📝 File name:', fileNameLower)
    if (!fileNameLower.endsWith('.docx') && !fileNameLower.endsWith('.pdf')) {
        jobDescriptionUploadState.value = 'error'
        jdErrorMsg.value = 'Chỉ chấp nhận file DOCX hoặc PDF'
        console.log('❌ File rejected - invalid type')
        return
    }

    jobDescriptionFileName.value = file.name
    jobDescriptionUploadState.value = 'uploading'
    jobDescriptionUploadProgress.value = 0
    console.log('⏳ State changed to uploading, progress:', jobDescriptionUploadProgress.value)

    const formData = new FormData()
    formData.append('file', file)

    try {
        // Ưu tiên localStorage vì token được lưu ở đó sau login
        const token = localStorage.getItem('access_token') ||
            localStorage.getItem('token') ||
            authStore.token
        const headers = {}

        if (token) {
            headers.Authorization = `Bearer ${token}`
            console.log('🔐 JD Token found:', token.substring(0, 30) + '...')
        } else {
            console.error('❌ JD: NO TOKEN FOUND!')
            console.log('   - localStorage access_token:', localStorage.getItem('access_token'))
            console.log('   - localStorage token:', localStorage.getItem('token'))
            console.log('   - authStore.token:', authStore.token)
            jobDescriptionUploadState.value = 'error'
            jdErrorMsg.value = 'Chưa đăng nhập. Vui lòng đăng nhập lại.'
            return
        }

        console.log('🌐 Uploading to:', buildApiUrl('/api/v1/job-description/upload'))
        console.log('📦 FormData contains:', file.name, 'size:', file.size, 'bytes')

        const response = await axios.post(buildApiUrl('/api/v1/job-description/upload'), formData, {
            headers,
            onUploadProgress: (e) => {
                const percent = Math.round((e.loaded / e.total) * 100)
                jobDescriptionUploadProgress.value = percent
                console.log('📊 Progress:', percent, '%')
            },
        })

        console.log('✅ Upload success, status:', response.status)
        console.log('📄 Response data:', response.data)
        jobDescriptionUploadProgress.value = 100
        // Lưu file_path trả về từ server
        jdPath.value = response.data.file_path
        jobDescriptionFileName.value = response.data.file_name
        jobDescriptionUploadState.value = 'success'
        fileName.value = file.name
        console.log('🎉 JD upload complete, state:', jobDescriptionUploadState.value)
    } catch (err) {
        console.error('💥 Upload error:', err)
        console.error('📍 Error status:', err.response?.status)
        console.error('📋 Error detail:', err.response?.data?.detail)
        console.error('🔗 Error URL:', err.config?.url)
        console.error('🔑 Auth header:', err.config?.headers?.Authorization?.substring(0, 30) + '...')
        jobDescriptionUploadState.value = 'error'
        jdErrorMsg.value = err.response?.data?.detail || err.message || 'Có lỗi xảy ra, vui lòng thử lại'
        console.error('💾 Error message set to:', jdErrorMsg.value)
    }
}

async function handleJdTextUploadRequest() {
    if (!ensureCanUseInterviewFeatures()) return

    const text = jobDescriptionText.value.trim()
    if (!text) {
        ElNotification.warning({
            title: 'Thiếu nội dung',
            message: 'Vui lòng dán nội dung mô tả công việc vào ô văn bản.',
            duration: 3000,
        })
        return
    }

    jobDescriptionUploadState.value = 'uploading'
    jobDescriptionUploadProgress.value = 100
    jobDescriptionFileName.value = 'job_description.txt'

    try {
        const token = localStorage.getItem('access_token') ||
            localStorage.getItem('token') ||
            authStore.token
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const response = await axios.post(
            buildApiUrl('/api/v1/job-description/upload-text'),
            {
                text,
                file_name: 'job_description_pasted'
            },
            { headers }
        )

        jdPath.value = response.data.file_path
        jobDescriptionFileName.value = response.data.file_name || 'job_description.txt'
        jobDescriptionUploadState.value = 'success'
        jdErrorMsg.value = ''
        ElNotification.success({
            title: 'Thành công',
            message: 'Đã gửi JD dạng text thành công',
            duration: 3000,
        })
    } catch (err) {
        jobDescriptionUploadState.value = 'error'
        jdErrorMsg.value = err.response?.data?.detail || err.message || 'Có lỗi xảy ra, vui lòng thử lại'
    }
}

function onCompanyCardClick() {
    if (!ensureCanUseInterviewFeatures()) return

    const el = companyFileInputRef.value
    if ((companyUploadState.value === 'idle' || companyUploadState.value === 'error') && el && typeof el.click === 'function') {
        el.click()
        return
    }

    if (companyUploadState.value === 'idle' || companyUploadState.value === 'error') {
        const tmp = document.createElement('input')
        tmp.type = 'file'
        tmp.accept = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,.pdf'
        tmp.onchange = (e) => onCompanyFileChange(e)
        tmp.click()
    }
}

function onCompanyFileChange(e) {
    if (!ensureCanUseInterviewFeatures()) return
    const file = e.target.files?.[0]
    console.log('onCompanyFileChange called, file:', file?.name)
    if (file) handleCompanyFileUploadRequest(file)
}

function onCompanyDrop(e) {
    e.preventDefault()
    if (!ensureCanUseInterviewFeatures()) return
    const file = e.dataTransfer.files?.[0]
    console.log('onCompanyDrop called, file:', file?.name)
    if (file) handleCompanyFileUploadRequest(file)
}

async function handleCompanyFileUploadRequest(file) {
    if (!ensureCanUseInterviewFeatures()) return
    console.log('handleCompanyFileUploadRequest started, file:', file?.name)
    if (!file) return

    const fileNameLower = file.name.toLowerCase()
    if (!fileNameLower.endsWith('.docx') && !fileNameLower.endsWith('.pdf')) {
        companyUploadState.value = 'error'
        companyErrorMsg.value = 'Chỉ chấp nhận file DOCX hoặc PDF'
        return
    }

    companyFileName.value = file.name
    companyUploadState.value = 'uploading'
    companyUploadProgress.value = 0

    const formData = new FormData()
    formData.append('file', file)

    try {
        const token = localStorage.getItem('access_token') ||
            localStorage.getItem('token') ||
            authStore.token
        const headers = {}

        if (token) {
            headers.Authorization = `Bearer ${token}`
            console.log('🔐 Company Token found')
        }

        const response = await axios.post(buildApiUrl('/api/v1/company-research/upload'), formData, {
            headers,
            onUploadProgress: (e) => {
                const percent = Math.round((e.loaded / e.total) * 100)
                companyUploadProgress.value = percent
            },
        })

        companyUploadProgress.value = 100
        companyPath.value = response.data.file_path
        companyFileName.value = response.data.file_name
        companyUploadState.value = 'success'
        console.log('✅ Company upload success')
    } catch (err) {
        console.error('❌ Company upload error:', err)
        companyUploadState.value = 'error'
        companyErrorMsg.value = err.response?.data?.detail || err.message || 'Có lỗi xảy ra, vui lòng thử lại'
    }
}

async function handleCompanyTextUploadRequest() {
    if (!ensureCanUseInterviewFeatures()) return

    const text = companyResearchText.value.trim()
    if (!text) {
        ElNotification.error({
            title: 'Thiếu nội dung',
            message: 'Vui lòng dán nội dung nghiên cứu công ty.',
            duration: 3000,
        })
        return
    }

    companyUploadState.value = 'uploading'
    companyUploadProgress.value = 100
    companyFileName.value = 'company_research.txt'

    try {
        const token = localStorage.getItem('access_token') ||
            localStorage.getItem('token') ||
            authStore.token
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const response = await axios.post(
            buildApiUrl('/api/v1/company-research/upload-text'),
            {
                text,
                file_name: 'company_research_pasted'
            },
            { headers }
        )

        companyPath.value = response.data.file_path
        companyFileName.value = response.data.file_name || 'company_research.txt'
        companyUploadState.value = 'success'
        companyErrorMsg.value = ''
        ElNotification.success({
            title: 'Thành công',
            message: 'Đã gửi Company Research dạng text thành công',
            duration: 3000,
        })
    } catch (err) {
        companyUploadState.value = 'error'
        companyErrorMsg.value = err.response?.data?.detail || err.message || 'Có lỗi xảy ra, vui lòng thử lại'
    }
}

function resetCompanyUpload() {
    companyUploadState.value = 'idle'
    companyUploadProgress.value = 0
    companyFileName.value = ''
    companyErrorMsg.value = ''
    companyPath.value = null
    companyInputMode.value = 'file'
    companyResearchText.value = ''
    if (companyFileInputRef.value) companyFileInputRef.value.value = ''
}

// ── Auto-scroll to Analysis Panel when CV & JD ready ──────────────────────
const analysisPanelRef = ref(null)

function scrollToAnalysisPanel() {
    if (analysisPanelRef.value) {
        setTimeout(() => {
            analysisPanelRef.value.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }, 300)
    }
}

watch(sessionId, async (newSessionId) => {
    if (!newSessionId) return

    console.log('New session ID:', newSessionId)
    await getInforInterview(newSessionId)  // await để đảm bảo xong mới check

    // Kiểm tra null-safe trước khi truy cập
    const overallScore = analysisData.value?.analysis.data.overall_score

    console.log('overall_score:', overallScore)
    console.log('analysisData:', analysisData.value)

    if (overallScore < 30) {
        console.log('CV không phù hợp với công việc')
        analysisReady.value = false
    } else {
        analysisReady.value = true
    }

    console.log('analysisReady:', analysisReady.value)
})

// Watch CV and JD ready state to update step and auto-scroll
watch([cvReady, jdReady], ([cvReadyVal, jdReadyVal]) => {
    if (cvReadyVal && jdReadyVal) {
        // Both CV and JD are ready
        activeStep.value = 1
        scrollToAnalysisPanel()
    } else if (cvReadyVal || jdReadyVal) {
        // Only one file uploaded
        activeStep.value = 0
    }
}, { flush: 'post' })
</script>


<style scoped>
/* BUTTON CUSTOM */
.btn-primary {
    background: #4f46e5;
    border-color: #4f46e5;
    color: #fff;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.25);
}

/* hover */
.btn-primary:hover {
    opacity: 0.9;
}
</style>

<style>
.custom-dialog .el-dialog {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 12px;
}

.custom-dialog .el-dialog__title {
    color: #e5e7eb;
}

.custom-dialog .el-dialog__headerbtn {
    color: #94a3b8;
}

.custom-dialog .el-dialog__body {
    color: #cbd5f5;
}

/* textarea */
.custom-dialog .el-textarea__inner {
    background: #020617;
    border: 1px solid #1e293b;
    color: #e5e7eb;
}

/* upload */
.custom-dialog .el-upload-dragger {
    background: #020617;
    border: 1px dashed #334155;
    color: #94a3b8;
}

.el-overlay {
    backdrop-filter: blur(6px);
    background: rgba(0, 0, 0, 0.6) !important;
}

.el-dialog {
    --el-dialog-bg-color: rgba(30, 58, 138, 0.2);
    /* giống #1e3a8a36 */
    backdrop-filter: blur(12px);
    border: 1px solid rgba(99, 102, 241, 0.3);
}

.btn-common:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
}
</style>
