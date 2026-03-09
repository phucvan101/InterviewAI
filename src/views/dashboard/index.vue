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
                <button class="relative w-9 h-9 flex items-center justify-center rounded-xl border transition-colors"
                    style="background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.08); color:rgba(255,255,255,0.5);"
                    @mouseenter="$event.currentTarget.style.background = 'rgba(255,255,255,0.08)'"
                    @mouseleave="$event.currentTarget.style.background = 'rgba(255,255,255,0.04)'">
                    <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"
                        style="width:18px;height:18px;">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                    <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#0f1225]" />
                </button>
            </header>

            <!-- Scrollable body -->
            <div class="flex-1 overflow-y-auto px-8 py-6 space-y-6">

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
                    <div v-for="(doc, idx) in documents" :key="doc.title"
                        class="relative rounded-2xl border p-5 cursor-pointer transition-all duration-200 group"
                        :style="getDocStyle(doc)" @mouseenter="hoveredDoc = idx" @mouseleave="hoveredDoc = null"
                        @click="doc.action && doc.action()">
                        <!-- Step number badge -->
                        <div class="absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                            style="background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.5);">
                            {{ idx + 1 }}
                        </div>

                        <!-- Status badge -->
                        <div v-if="doc.badge" class="absolute top-4 right-4">
                            <span
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold"
                                :style="doc.badge.style">
                                <span v-if="doc.badge.dot" class="w-1.5 h-1.5 rounded-full animate-pulse"
                                    :style="{ background: doc.badge.dotColor }" />
                                {{ doc.badge.text }}
                            </span>
                        </div>

                        <!-- Icon -->
                        <div class="flex justify-center mt-4 mb-5">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
                                :style="{ background: doc.iconBg }">
                                <span v-html="doc.icon" style="width:26px;height:26px;" />
                            </div>
                        </div>

                        <!-- Check mark for completed -->
                        <div v-if="doc.completed" class="flex justify-center mb-3">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center"
                                style="background:rgba(34,197,94,0.2);">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4ade80"
                                    stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </div>
                        </div>

                        <!-- Arrow connector (between cards) -->
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
                            <p class="text-[11.5px] leading-relaxed" style="color:rgba(255,255,255,0.42);">{{ doc.desc
                                }}</p>
                        </div>
                    </div>
                </div>

                <!-- ── Bottom panels ── -->
                <div class="grid grid-cols-2 gap-4">

                    <!-- Fit analysis -->
                    <div class="rounded-2xl border p-6"
                        style="background:#141728; border-color:rgba(255,255,255,0.07);">
                        <div class="flex items-start justify-between mb-1">
                            <h3 class="text-base font-black text-white leading-snug">Phân tích độ phù hợp</h3>
                            <button
                                class="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
                                style="color:rgba(255,255,255,0.35); margin-top:2px;">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    stroke-width="1.8">
                                    <circle cx="12" cy="12" r="9" />
                                    <path stroke-linecap="round" d="M12 8v1m0 3v4" />
                                </svg>
                            </button>
                        </div>
                        <p class="text-[12px] mb-6 leading-relaxed" style="color:rgba(255,255,255,0.38);">
                            Phân tích dựa trên tài liệu đã tải lên so với mô tả công việc.
                        </p>

                        <!-- Circular progress -->
                        <div class="flex justify-center">
                            <div class="relative w-36 h-36">
                                <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <!-- Track -->
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.07)"
                                        stroke-width="8" />
                                    <!-- Progress -->
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#progressGrad)"
                                        stroke-width="8" stroke-linecap="round"
                                        :stroke-dasharray="`${fitPercent * 2.51} 251`"
                                        style="transition: stroke-dasharray 1s ease;" />
                                    <defs>
                                        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stop-color="#4f46e5" />
                                            <stop offset="100%" stop-color="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <span class="text-3xl font-black text-white">{{ fitPercent }}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CV content analysis -->
                    <div class="rounded-2xl border overflow-hidden"
                        style="background:#141728; border-color:rgba(255,255,255,0.07);">
                        <!-- Tab bar -->
                        <div class="flex items-center justify-between px-5 pt-5 pb-4 border-b"
                            style="border-color:rgba(255,255,255,0.06);">
                            <h3 class="text-base font-black text-white">Phân tích nội dung CV</h3>
                            <div class="flex items-center gap-1">
                                <button class="px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors"
                                    style="background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.4);"
                                    @mouseenter="$event.currentTarget.style.background = 'rgba(255,255,255,0.1)'"
                                    @mouseleave="$event.currentTarget.style.background = 'rgba(255,255,255,0.06)'">XEM
                                    TRƯỚC</button>
                            </div>
                        </div>

                        <!-- Tabs -->
                        <div class="flex gap-1.5 px-5 pt-3 pb-2">
                            <button v-for="tab in cvTabs" :key="tab"
                                class="px-3 py-1.5 text-[12px] font-semibold rounded-full transition-all duration-150"
                                :style="activeTab === tab
                                    ? 'background:rgba(255,255,255,0.12); color:#fff;'
                                    : 'color:rgba(255,255,255,0.4);'" @click="activeTab = tab">{{ tab }}</button>
                        </div>

                        <!-- Two-col content -->
                        <div class="grid grid-cols-2 gap-3 px-5 pb-5">
                            <!-- Current -->
                            <div class="rounded-xl p-3.5"
                                style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);">
                                <div class="flex items-center gap-1.5 mb-2.5">
                                    <svg class="w-3.5 h-3.5" style="color:rgba(255,255,255,0.3);" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                    <span class="text-[10px] font-bold uppercase tracking-wider"
                                        style="color:rgba(255,255,255,0.3);">Nội dung hiện tại</span>
                                </div>
                                <p class="text-[11.5px] leading-relaxed" style="color:rgba(255,255,255,0.55);">
                                    Quản lý sản phẩm với 5 năm kinh nghiệm. Quản lý một nhóm thiết kế và lập trình viên
                                    để ra mắt ứng
                                    dụng di động.
                                </p>
                                <p class="text-[11.5px] leading-relaxed mt-2" style="color:rgba(255,255,255,0.55);">
                                    Chịu trách nhiệm lập lộ trình và quản lý backlog.
                                </p>
                            </div>

                            <!-- AI suggestion -->
                            <div class="rounded-xl p-3.5"
                                style="background:rgba(109,67,245,0.08); border:1px solid rgba(109,67,245,0.18);">
                                <div class="flex items-center gap-1.5 mb-2.5">
                                    <svg class="w-3.5 h-3.5 text-[#a78bfa]" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                                    </svg>
                                    <span class="text-[10px] font-bold uppercase tracking-wider text-[#a78bfa]">Gợi ý từ
                                        AI</span>
                                </div>
                                <p class="text-[11.5px] leading-relaxed" style="color:rgba(255,255,255,0.65);">
                                    Quản lý sản phẩm cấp cao với 5 năm kinh nghiệm thúc đẩy vòng đời sản phẩm.
                                </p>
                                <p class="text-[11.5px] leading-relaxed mt-2" style="color:rgba(255,255,255,0.65);">
                                    Dẫn dắt một nhóm đa chức năng gồm 12 người để ra mắt thành công ứng dụng chủ lực.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div><!-- end scrollable -->

            <!-- ── Bottom CTA bar ── -->
            <div class="flex items-center justify-between px-8 py-4 border-t flex-shrink-0"
                style="background:#0f1225; border-color:rgba(255,255,255,0.06);">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                        style="background:rgba(79,70,229,0.2);">
                        <img src="@/assets/icon/dashboard/rocket.svg" alt="" />
                    </div>
                    <div>
                        <div class="text-sm font-bold text-white">Sẵn sàng khởi động?</div>
                        <div class="text-[11.5px]" style="color:rgba(255,255,255,0.4);">Hoàn thành các bước trên để bắt
                            đầu mô
                            phỏng.</div>
                    </div>
                </div>

                <button
                    class="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 btn-common"
                    @mouseenter="$event.currentTarget.style.transform = 'translateY(-1px)'; $event.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.55)'"
                    @mouseleave="$event.currentTarget.style.transform = ''; $event.currentTarget.style.boxShadow = '0 4px 18px rgba(79,70,229,0.4)'">
                    Vào phòng phỏng vấn
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            </div>

        </div>
    </LayoutInterview>
</template>

<script setup>
import { ref, computed } from 'vue'
import LayoutInterview from '../layouts/LayoutInterview.vue'

// ── Navigation ───────────────────────────────────────────────────────────────
const navItems = ref([
    {
        label: 'Bảng điều khiển', active: true,
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    },
    {
        label: 'Kho kiến thức', active: false,
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/></svg>`,
    },
    {
        label: 'Phòng phỏng vấn', active: false,
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>`,
    },
    {
        label: 'Báo cáo', active: false,
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg>`,
    },
])

function setActiveNav(selected) {
    navItems.value.forEach(i => i.active = i === selected)
}

const recentSessions = [
    { title: 'Vị trí PM Cấp cao', color: '#4ade80' },
    { title: 'Trưởng nhóm UX tại Google', color: '#fbbf24' },
]

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
        title: 'Tải CV lên (PDF)',
        desc: 'Kéo thả hoặc nhấp để chọn',
        completed: true,
        iconBg: 'rgba(109,67,245,0.2)',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="#a78bfa" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>`,
        badge: { text: '● HOÀN THÀNH', style: 'background:rgba(34,197,94,0.15); color:#4ade80; border:1px solid rgba(34,197,94,0.25);', dot: false },
    },
    {
        title: 'Mô tả công việc',
        desc: 'Dán văn bản hoặc tải file',
        completed: false,
        iconBg: 'rgba(59,130,246,0.18)',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="#60a5fa" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>`,
        badge: { text: '💬 ĐANG CHỜ', style: 'background:rgba(234,179,8,0.15); color:#fbbf24; border:1px solid rgba(234,179,8,0.25);', dot: false },
    },
    {
        title: 'Nghiên cứu công ty',
        desc: 'Giá trị, sứ mệnh, báo cáo',
        completed: false,
        iconBg: 'rgba(168,85,247,0.18)',
        icon: `<svg fill="none" viewBox="0 0 24 24" stroke="#c084fc" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>`,
        badge: { text: 'TÙY CHỌN', style: 'background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.1);', dot: false },
    },
]

function getDocStyle(doc) {
    if (doc.completed) {
        return 'background:#141728; border-color:rgba(34,197,94,0.2);'
    }
    return 'background:#141728; border-color:rgba(255,255,255,0.07);'
}

// ── CV Analysis ───────────────────────────────────────────────────────────────
const fitPercent = ref(78)
const cvTabs = ['Tóm tắt', 'Kinh nghiệm', 'Kỹ năng']
const activeTab = ref('Tóm tắt')
</script>