<template>
    <!-- ── Features Section ── -->
    <section id="features" ref="sectionRef" class="mx-auto scroll-mt-20 px-6 py-24 lg:px-24 min-h-screen"
        style="background: var(--bg-linear-gradient);">

        <!-- Header -->
        <div class="mb-16 text-center">
            <div class="transition-all duration-700 ease-out"
                :class="headerRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
                :style="{ transitionDelay: '0ms' }">
            </div>

            <h2 class="heading-gradient text-4xl font-black lg:text-5xl mb-6 transition-all duration-700 ease-out"
                style="line-height: 1.25;"
                :class="headerRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
                :style="{ transitionDelay: '100ms' }">
                Mọi thứ bạn cần để thành công
            </h2>

            <p class="mx-auto max-w-2xl text-base leading-relaxed sm:text-lg transition-all duration-700 ease-out"
                style="color: var(--text-muted);"
                :class="headerRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
                :style="{ transitionDelay: '180ms' }">
                Các tính năng mạnh mẽ được thiết kế để mang lại cho bạn lợi thế cạnh tranh
                trong thị trường việc làm khó khăn ngày nay.
            </p>
        </div>

        <!-- Cards Grid -->
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="(feat, idx) in features" :key="feat.title"
                class="feat-card card-glass rounded-2xl p-7 cursor-default relative overflow-hidden"
                :class="cardsRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'" :style="{
                    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out, background 0.25s, border-color 0.25s',
                    transitionDelay: cardsRevealed ? (idx * 80) + 'ms' : '0ms',
                }" @mouseenter="hovered = idx" @mouseleave="hovered = null">
                <!-- Glow on hover -->
                <div class="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300" :style="{
                    background: `radial-gradient(circle at 30% 30%, ${feat.bg_color}, transparent 70%)`,
                    opacity: hovered === idx ? 1 : 0,
                }" />

                <!-- Border highlight -->
                <div class="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300" :style="{
                    boxShadow: 'inset 0 0 0 1px rgba(109,67,245,0.35)',
                    opacity: hovered === idx ? 1 : 0,
                }" />

                <!-- Icon -->
                <div class="relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300"
                    :style="{
                        background: feat.bg_color,
                        transform: hovered === idx ? 'scale(1.12) rotate(-3deg)' : 'scale(1) rotate(0deg)',
                    }">
                    <img :src="feat.icon" class="h-6 w-6" />
                </div>

                <!-- Text -->
                <div class="relative">
                    <h3 class="mb-2 font-bold text-white text-base">{{ feat.title }}</h3>
                    <p class="text-sm leading-relaxed" style="color: var(--text-muted);">{{ feat.desc }}</p>
                </div>

                <!-- Arrow appear on hover -->
                <div class="relative mt-4 flex items-center gap-1 text-xs font-semibold transition-all duration-300"
                    :style="{
                        color: 'var(--primary)',
                        opacity: hovered === idx ? 1 : 0,
                        transform: hovered === idx ? 'translateX(0)' : 'translateX(-6px)',
                    }">
                    Tìm hiểu thêm
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

// ── Icon imports (giữ nguyên đường dẫn của bạn) ──
import phan_hoi from '../../assets/icon/home/phan_hoi.svg'
import goi_y from '../../assets/icon/home/goi_y.svg'
import hieu_suat from '../../assets/icon/home/hieu_suat.svg'
import phan_tich_giong_noi from '../../assets/icon/home/phan_tich_giong_noi.svg'
import ngan_hang from '../../assets/icon/home/ngan_hang.svg'
import lich_su from '../../assets/icon/home/lich_su.svg'

// ── Data ──
const features = [
    { icon: phan_hoi, title: 'Phỏng vấn giọng nói thực tế', desc: 'AI lắng nghe và phản hồi bằng giọng nói GPT-4o-mini, tạo cảm giác phỏng vấn thực tế 100%.', bg_color: 'rgba(30,58,138,0.35)' },
    { icon: goi_y, title: 'Cá nhân hóa từ CV của bạn', desc: 'Upload CV và JD, AI sẽ sinh câu hỏi phù hợp với kinh nghiệm và vai trò bạn apply.', bg_color: 'rgba(88,28,135,0.35)' },
    { icon: hieu_suat, title: 'Chỉ số hiệu suất', desc: 'Phân tích chi tiết về kỹ năng chuyên môn, sự tự tin, kỹ năng mềm, giao tiếp và kiến thức về công ty.', bg_color: 'rgba(20,83,45,0.35)' },
    { icon: phan_tich_giong_noi, title: 'Feedback chi tiết sau mỗi buổi', desc: 'Nhận đánh giá điểm mạnh, điểm yếu và gợi ý cải thiện ngay sau khi kết thúc phỏng vấn.', bg_color: 'rgba(131,24,67,0.35)' },
    { icon: ngan_hang, title: 'WebRTC – không cần cài thêm', desc: 'Kết nối peer-to-peer trực tiếp trên trình duyệt, không lag, không cần phần mềm bên thứ ba.', bg_color: 'rgba(124,45,18,0.35)' },
    { icon: lich_su, title: 'Lịch sử phiên học', desc: 'Xem lại các bản ghi âm và các bản ghi chép trước đây để theo dõi sự tiến bộ của bạn theo thời gian.', bg_color: 'rgba(18,78,74,0.35)' },
]

// ── Scroll reveal state ──
const sectionRef = ref(null)
const headerRevealed = ref(false)
const cardsRevealed = ref(false)
const ctaRevealed = ref(false)
const hovered = ref(null)

// Staggered reveal: header → cards → cta
function revealAll() {
    headerRevealed.value = true
    setTimeout(() => { cardsRevealed.value = true }, 250)
    setTimeout(() => { ctaRevealed.value = true }, 300 + features.length * 80)
}

onMounted(() => {
    const io = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    revealAll()
                    obs.unobserve(e.target)
                }
            })
        },
        { threshold: 0.1 }
    )
    if (sectionRef.value) io.observe(sectionRef.value)
    onUnmounted(() => io.disconnect())
})
</script>
