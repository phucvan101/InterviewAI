<template>
  <div>
    <!-- ── Hero Section ── -->
    <section class="hero-bg relative overflow-hidden min-h-screen flex items-center">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div v-for="i in 40" :key="i" class="absolute rounded-full bg-white" :style="{
          width: Math.random() * 2 + 1 + 'px',
          height: Math.random() * 2 + 1 + 'px',
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
          opacity: Math.random() * 0.35 + 0.05,
        }" />
      </div>

      <div class="relative mx-auto max-w-5xl px-6 pb-32 pt-24 text-center lg:px-8">
        <div class="mb-8 flex justify-center">
          <span class="badge-gpt">
            <span class="badge-gpt-dot" />
            Đã tích hợp giọng nói GPT-4o
          </span>
        </div>

        <h1 ref="el"
          class="heading-gradient mb-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          style="line-height: 1.25;">
        </h1>

        <p class="mx-auto mb-10 max-w-2xl text-base leading-relaxed sm:text-lg" style="color: var(--text-muted);">
          Tải lên CV của bạn, dán mô tả công việc và để AI được hỗ trợ bởi
          RAG của chúng tôi mô phỏng môi trường phỏng vấn hoàn hảo được
          thiết kế dành riêng cho bạn.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4">
          <RouterLink to="/webrtc"
            class="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-200"
            style="background: var(--primary);"
            onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 10px 32px rgba(109,67,245,0.5)'"
            onmouseout="this.style.transform='';this.style.boxShadow=''">
            Bắt đầu luyện tập
          </RouterLink>
          <button
            class="inline-flex items-center justify-center gap-3 rounded-2xl border px-8 py-4 text-base font-bold text-white transition-all duration-200"
            style="background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15);"
            onmouseover="this.style.background='rgba(255,255,255,0.1)';this.style.transform='translateY(-2px)'"
            onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.transform=''">
            <span class="flex h-7 w-7 items-center justify-center rounded-full"
              style="background: rgba(255,255,255,0.15);">
              <svg class="h-3 w-3 translate-x-0.5" fill="currentColor" viewBox="0 0 8 10">
                <path d="M1 1.5l6 3-6 3V1.5z" />
              </svg>
            </span>
            Xem Demo
          </button>
        </div>

        <div class="mt-20 border-t" style="border-color: rgba(255,255,255,0.08);" />

        <div class="pt-12">
          <p class="mb-8 text-xs font-semibold uppercase tracking-widest" style="color: var(--text-subtle);">
            Được tin dùng bởi các ứng viên đã trúng tuyển tại
          </p>
          <div class="flex flex-wrap items-center justify-center gap-10">
            <span v-for="co in companies" :key="co" class="company-name">{{ co }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Steps Section ── -->
    <section ref="stepsSection" class="mx-auto px-10 py-16 lg:px-24 min-h-screen flex items-center"
      style="background: var(--bg-gray);">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Left column -->
        <div class="max-w-md transition-all duration-700"
          :class="stepsRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'"
          :style="{ transitionDelay: '80ms' }">
          <h1 class="text-3xl font-black leading-tight mb-4 transition-all duration-700"
            :class="stepsRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
            :style="{ transitionDelay: '120ms' }">
            Quy trình 3 bước đơn giản
          </h1>
          <p class="mb-6 text-lg transition-all duration-700"
            :class="stepsRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'"
            :style="{ transitionDelay: '200ms', color: 'var(--text-muted)' }">
            Đi từ khâu chuẩn bị đến sự hoàn hảo chỉ trong ba bước đơn giản. Hệ thống của chúng tôi phân tích
            nền tảng của bạn so với yêu cầu công việc để tạo ra một kịch bản mô phỏng siêu thực tế.
          </p>
          <RouterLink to="/learn-more" class="text-sm font-semibold inline-block transition-all duration-700"
            :class="stepsRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'"
            :style="{ transitionDelay: '320ms', color: 'var(--primary)' }">
            Tìm hiểu thêm về phương pháp của chúng tôi →
          </RouterLink>
        </div>

        <!-- Right column: steps -->
        <div class="space-y-10 col-span-2">
          <div v-for="(s, idx) in steps" :key="s.title"
            class="relative rounded-2xl border card-glass p-6 pl-10 transition-all duration-500 ease-out"
            :class="stepsRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'" :style="{
              borderColor: 'rgba(255,255,255,0.06)',
              background: '#0F172A',
              transitionDelay: stepsRevealed ? (idx * 120) + 'ms' : '0ms',
            }">
            <div
              class="absolute -left-6 -top-4 flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
              :style="{ background: 'var(--primary)' }">
              {{ idx + 1 }}
            </div>
            <div class="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-lg"
              style="background: rgba(255,255,255,0.03);">
              <img :src="s.icon" />
            </div>
            <h3 class="text-xl font-bold text-white mb-1 pt-2 pb-2">{{ s.title }}</h3>
            <p class="text-base" style="color: var(--text-muted);">{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Features Section ── -->
    <FeaturesSection />

    <!-- ── Testimonials Section ── -->
    <section ref="testimonialsSection" class="mx-auto px-10 py-24 lg:px-24" style="background: var(--bg-gray);">
      <!-- Heading -->
      <div class="text-center mb-12 transition-all duration-700 ease-out"
        :class="testimonialsRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <h2 class="text-3xl font-semibold text-white">
          Chia sẻ từ các ứng viên đã trúng tuyển
        </h2>
        <p class="mt-3 text-sm" style="color: var(--text-muted);">
          Hàng nghìn ứng viên đã chinh phục vòng phỏng vấn nhờ luyện tập cùng AI
        </p>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="(t, idx) in testimonials" :key="t.name"
          class="relative p-6 rounded-2xl border overflow-hidden cursor-default"
          style="border-color: rgba(255,255,255,0.06); background: rgba(255,255,255,0.03);"
          :class="testimonialsRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'" :style="{
            transition: 'opacity 0.65s ease-out, transform 0.65s ease-out, background 0.25s, box-shadow 0.25s',
            transitionDelay: testimonialsRevealed ? (idx * 120) + 'ms' : '0ms',
          }" @mouseenter="hoveredCard = idx" @mouseleave="hoveredCard = null">
          <!-- Glow on hover -->
          <div class="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500" :style="{
            background: 'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(109,67,245,0.12), transparent 70%)',
            opacity: hoveredCard === idx ? 1 : 0,
          }" />
          <!-- Top border line -->
          <div class="pointer-events-none absolute top-0 left-6 right-6 h-px transition-all duration-500" :style="{
            background: 'linear-gradient(90deg, transparent, rgba(109,67,245,0.6), transparent)',
            opacity: hoveredCard === idx ? 1 : 0,
            transform: hoveredCard === idx ? 'scaleX(1)' : 'scaleX(0)',
          }" />

          <div class="relative flex items-start gap-4">
            <div class="relative flex-shrink-0">
              <img :src="t.avatar" alt="" class="h-12 w-12 rounded-full object-cover transition-all duration-300"
                :style="{
                  boxShadow: hoveredCard === idx ? '0 0 0 2px rgba(109,67,245,0.7)' : '0 0 0 0px transparent',
                }" />
              <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 transition-colors duration-300"
                :style="{
                  background: hoveredCard === idx ? '#4ade80' : 'rgba(255,255,255,0.2)',
                  borderColor: '#0b0f2e',
                }" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex gap-0.5 mb-3">
                <span v-for="star in 5" :key="star" class="text-yellow-400 text-sm transition-all duration-200" :style="{
                  transitionDelay: hoveredCard === idx ? (star * 40) + 'ms' : '0ms',
                  transform: hoveredCard === idx ? 'scale(1.2)' : 'scale(1)',
                }">★</span>
              </div>

              <p class="text-sm mb-4 leading-relaxed transition-colors duration-300"
                :style="{ color: hoveredCard === idx ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)' }">
                "{{ t.quote }}"
              </p>

              <div class="text-xs">
                <div class="font-semibold transition-colors duration-200"
                  :style="{ color: hoveredCard === idx ? '#fff' : 'rgba(255,255,255,0.85)' }">
                  {{ t.name }}
                </div>
                <div class="mt-0.5 flex items-center gap-1.5">
                  <span style="color: rgba(255,255,255,0.55)">{{ t.role }}</span>
                  <span style="color: rgba(255,255,255,0.25)">·</span>
                  <span class="font-medium transition-colors duration-200"
                    :style="{ color: hoveredCard === idx ? 'rgba(167,139,250,0.9)' : 'rgba(255,255,255,0.45)' }">
                    {{ t.company }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA Section ── -->
    <section class="mx-auto px-10 py-16 lg:px-24" style="background: var(--bg-linear-gradient);">
      <div class="py-12 px-8 rounded-2xl text-center">
        <h3 class="text-4xl font-black mb-4 text-white">Sẵn sàng chinh phục buổi phỏng vấn?</h3>
        <p class="text-base mb-6" style="color: rgba(255,255,255,0.8);">
          Tham gia cùng hàng ngàn ứng viên đang được hỗ trợ bởi AI để đạt được công việc mơ ước.
        </p>
        <RouterLink to="/signup"
          class="inline-block px-8 py-4 rounded-2xl font-bold text-white transition-all duration-200"
          style="background: linear-gradient(90deg,#5048E5,#1e3a8a); box-shadow: 0 10px 30px rgba(109,67,245,0.22);"
          onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 14px 36px rgba(109,67,245,0.4)'"
          onmouseout="this.style.transform='';this.style.boxShadow='0 10px 30px rgba(109,67,245,0.22)'">
          Bắt đầu dùng thử miễn phí
        </RouterLink>
        <div class="mt-3 text-xs" style="color: rgba(255,255,255,0.5);">Không cần thẻ tín dụng. Hủy bất cứ lúc nào.
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import FeaturesSection from '@/views/homeComponent/FeaturesSection.vue'
import { RouterLink } from 'vue-router'
import { useCounterStore } from '@/stores/counter'
import Typed from 'typed.js'
import { onMounted, ref } from 'vue'

import voice from '../assets/icon/home/voice.svg'
import analysis from '../assets/icon/home/analysis.svg'
import upload from '../assets/icon/home/upload.svg'
import goi_y from '../assets/icon/home/goi_y.svg'
import lich_su from '../assets/icon/home/lich_su.svg'
import ngan_hang from '../assets/icon/home/ngan_hang.svg'
import phan_hoi from '../assets/icon/home/phan_hoi.svg'
import phan_tich_giong_noi from '../assets/icon/home/phan_tich_giong_noi.svg'
import hieu_suat from '../assets/icon/home/hieu_suat.svg'

// ── Template refs ──────────────────────────────────────────
const el = ref(null)
const stepsSection = ref(null)
const testimonialsSection = ref(null)

// ── Reveal state — MỖI SECTION MỘT BIẾN RIÊNG ──────────────
const stepsRevealed = ref(false)
const testimonialsRevealed = ref(false)

// ── Hover state cho testimonial cards ──────────────────────
const hoveredCard = ref(null)

// ── Helper: tạo IntersectionObserver gọn ───────────────────
function observeSection(el, revealRef, threshold = 0.15) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        revealRef.value = true
        obs.unobserve(e.target)
      }
    })
  }, { threshold })

  if (el) io.observe(el)
  return io
}

onMounted(() => {
  // Typed.js cho headline
  new Typed(el.value, {
    strings: ['Chinh phục phỏng vấn AI'],
    typeSpeed: 60,
    backSpeed: 30,
    showCursor: false,
  })

  // Mỗi section observe độc lập
  const io1 = observeSection(stepsSection.value, stepsRevealed)
  const io2 = observeSection(testimonialsSection.value, testimonialsRevealed)
})

// ── Data ───────────────────────────────────────────────────
const counter = useCounterStore()
const companies = ['Google', 'Microsoft', 'Amazon', 'Spotify', 'Netflix']

const steps = [
  {
    icon: upload,
    title: 'Tải lên thông minh',
    desc: 'Tải lên CV (PDF) và dán liên kết hoặc văn bản mô tả công việc (JD). Trình phân tích của chúng tôi trích xuất các kỹ năng chính, kinh nghiệm và yêu cầu để tùy chỉnh ngữ cảnh phiên phỏng vấn ngay lập tức.',
  },
  {
    icon: analysis,
    title: 'Phân tích lỗ hổng kiến thức AI',
    desc: 'Trước khi buổi phỏng vấn bắt đầu, AI của chúng tôi xác định các lỗ hổng kỹ năng tiềm ẩn và tạo ra danh sách các câu hỏi kỹ thuật và hành vi có thể xảy ra để lấp đầy những lỗ hổng đó.',
  },
  {
    icon: voice,
    title: 'Phỏng vấn thử ảo',
    desc: 'Trải nghiệm mô phỏng giọng nói hoặc văn bản thực tế. Người phỏng vấn AI thích nghi với câu trả lời của bạn, đặt câu hỏi tiếp theo và cung cấp gợi ý theo thời gian thực nếu bạn gặp khó khăn.',
  },
]

const testimonials = [
  {
    avatar: 'https://i.pravatar.cc/80?img=12',
    name: 'Sarah Jenkins',
    role: 'Kỹ sư phần mềm',
    company: 'Google',
    quote: 'Phân tích lỗ hổng kiến thức thực sự thay đổi cuộc chơi. Tôi được vị trí L5 tại Google!',
  },
  {
    avatar: 'https://i.pravatar.cc/80?img=32',
    name: 'Marcus Chen',
    role: 'Quản lý sản phẩm',
    company: 'Netflix',
    quote: 'Luyện tập với chế độ giọng nói AI đã giúp tôi mạch lạc hơn trong cách kể chuyện theo phương pháp STAR.',
  },
  {
    avatar: 'https://i.pravatar.cc/80?img=45',
    name: 'Elena Rodriguez',
    role: 'Nhà khoa học dữ liệu',
    company: 'Amazon',
    quote: 'Phản hồi cực kỳ thành thật và hữu ích. Rất khuyến khích cho ai đang đi phỏng vấn.',
  },
]


console.log('Hello World')
</script>