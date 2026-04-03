<template>
    <div class="flex min-h-screen font-['Be_Vietnam_Pro',sans-serif] overflow-hidden" style="background:#080c22;">

        <!-- ══ LEFT PANEL ══ -->
        <div class="relative hidden md:flex md:w-1/2 flex-col justify-center overflow-hidden">

            <!-- Background portrait -->
            <div class="absolute inset-0 bg-cover bg-top transition-transform duration-[8000ms] ease-linear scale-[1.04] hover:scale-100"
                :style="{ backgroundImage: `url(${bgImage})`, filter: 'brightness(0.5) saturate(0.75)' }" />

            <!-- Overlays -->
            <div class="absolute inset-0"
                style="background: linear-gradient(135deg, rgba(8,12,34,0.5) 0%, rgba(8,12,34,0.1) 50%, rgba(8,12,34,0.65) 100%);" />
            <div class="absolute inset-0"
                style="background: radial-gradient(ellipse at center, transparent 30%, rgba(4,6,20,0.7) 100%);" />
            <div class="absolute bottom-0 left-0 right-0 h-[55%]"
                style="background: linear-gradient(to top, rgba(8,12,34,0.95) 0%, transparent 100%);" />

            <!-- Scanlines -->
            <div class="absolute inset-0 pointer-events-none"
                style="background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);" />

            <!-- Content -->
            <div class="relative z-10 px-12 pb-14 text-center">
                <!-- Badge -->
                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-7 text-xs font-semibold backdrop-blur-sm"
                    style="background: rgba(79,70,229,0.1); border-color: rgba(79,70,229,0.3); color:rgba(79,70,229);">
                    <img src="@/assets/icon/logoHeader.svg" class="h-3" alt="Logo" />
                    AI Interview Prep
                </div>

                <!-- Headline -->
                <h1 class="text-4xl xl:text-5xl font-black text-white leading-[1.18] tracking-tight mb-4">
                    Nâng tầm sự nghiệp<br />
                    của bạn với công nghệ<br />
                    phỏng vấn AI
                </h1>

                <!-- Sub -->
                <div class="text-sm leading-relaxed mb-8" style="color: rgba(255,255,255,0.58);">
                    Luyện tập không giới hạn, nhận phản hồi chi tiết và <br />
                    tự tin chinh phục mọi buổi phỏng vấn.
                </div>

                <!-- Stats -->
                <div class="flex justify-center gap-5">
                    <div v-for="(s, i) in stats" :key="s.label" class="flex items-center gap-5">
                        <div class="flex flex-col gap-0.5">
                            <span class="text-base font-black text-white tracking-tight">{{ s.num }}</span>
                            <span class="text-[10px] font-semibold uppercase tracking-widest"
                                style="color: rgba(255,255,255,0.4);">{{ s.label }}</span>
                        </div>
                        <div v-if="i < stats.length - 1" class="w-px h-8" style="background: rgba(255,255,255,0.12);" />
                    </div>
                </div>
            </div>
        </div>

        <!-- ══ RIGHT PANEL ══ -->
        <div class="relative flex w-full md:w-1/2 items-center justify-center px-6 py-12" style="background: #0a0d24;">

            <!-- Grid texture -->
            <div class="absolute inset-0 pointer-events-none"
                style="background-image: linear-gradient(rgba(109,67,245,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(109,67,245,0.04) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);" />

            <div class="relative z-10 w-full max-w-[400px] animate-[formIn_0.6s_cubic-bezier(0.22,1,0.36,1)_both]">
                <div v-if="errorMessage" class="mb-4 rounded-xl border px-4 py-3 text-sm text-red-200"
                    style="background: rgba(127, 29, 29, 0.22); border-color: rgba(248, 113, 113, 0.35);">
                    {{ errorMessage }}
                </div>

                <!--Login-->
                <!-- Header -->
                <div v-if="!isRegisterMode">
                    <LoginForm @submit="handleLogin" @switch="switchToRegister" @oauth="handleOAuth"
                        :isLoading="isLoading" />
                </div>

                <div v-else>
                    <RegisterForm @submit="handleRegister" @switch="switchToLogin" @oauth="handleOAuth"
                        :isLoading="isLoading" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BG_IMAGE from '@/assets/image/avatarAI.png'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const bgImage = ref(BG_IMAGE)
const isRegisterMode = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const stats = [
    { num: '50K+', label: 'Ứng viên' },
    { num: '98%', label: 'Hài lòng' },
    { num: 'GPT-4o', label: 'Công nghệ' },
]

async function handleLogin(payload) {
    isLoading.value = true
    errorMessage.value = ''
    try {
        await authStore.login(payload)
        await authStore.fetchProfile()
        await router.push('/dashboard')
    } catch (error) {
        errorMessage.value = error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
    } finally {
        isLoading.value = false
    }
}

async function handleRegister(payload) {
    isLoading.value = true
    errorMessage.value = ''
    try {
        await authStore.register(payload)

        if (authStore.isLoggedIn) {
            await authStore.fetchProfile()
            await router.push('/')
            return
        }

        isRegisterMode.value = false
        alert('Đăng ký thành công. Vui lòng đăng nhập để tiếp tục.')
    } catch (error) {
        errorMessage.value = error?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
    } finally {
        isLoading.value = false
    }
}

async function handleOAuth(provider) {
    if (!provider || provider.name !== 'Google') {
        errorMessage.value = 'Tính năng đăng nhập này chưa được hỗ trợ.'
        return
    }

    isLoading.value = true
    errorMessage.value = ''
    try {
        await authStore.loginWithGoogle()
        await authStore.fetchProfile()

        const redirect = typeof route.query?.redirect === 'string' ? route.query.redirect : '/dashboard'
        await router.push(redirect)
    } catch (error) {
        errorMessage.value = error?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.'
    } finally {
        isLoading.value = false
    }
}

function switchToRegister() {
    errorMessage.value = ''
    isRegisterMode.value = true
}

function switchToLogin() {
    errorMessage.value = ''
    isRegisterMode.value = false
}
</script>

<style>
@keyframes formIn {
    from {
        opacity: 0;
        transform: translateY(22px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-\[formIn_0\.6s_cubic-bezier\(0\.22\,1\,0\.36\,1\)_both\] {
    animation: formIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
    display: none;
}

input::placeholder {
    color: rgba(255, 255, 255, 0.22) !important;
}
</style>
