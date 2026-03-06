<template>
    <div class="mb-8">
        <h2 class="text-[2rem] font-black text-white tracking-tight mb-1.5">Đăng nhập</h2>
        <p class="text-sm" style="color: rgba(255,255,255,0.48);">Chào mừng trở lại! Vui lòng nhập thông
            tin
            của bạn.</p>
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">

        <!-- Email -->
        <div class="flex flex-col gap-1.5">
            <label class="text-[0.8rem] font-semibold" style="color: rgba(255,255,255,0.72);">Email</label>
            <div class="flex items-center rounded-xl border transition-all duration-200" :style="{
                background: '#111630',
                borderColor: focusedField === 'email' ? 'rgba(109,67,245,0.65)' : 'rgba(255,255,255,0.08)',
                boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(109,67,245,0.12)' : 'none',
            }">
                <svg class="w-4 h-4 ml-3.5 flex-shrink-0" style="color: rgba(255,255,255,0.28);" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <input v-model="email" type="email" placeholder="name@company.com"
                    class="flex-1 bg-transparent border-none outline-none px-3 py-3.5 text-sm"
                    style="color: rgba(255,255,255,0.88); font-family: inherit;" @focus="focusedField = 'email'"
                    @blur="focusedField = null" />
            </div>
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-1.5">
            <label class="text-[0.8rem] font-semibold" style="color: rgba(255,255,255,0.72);">Mật
                khẩu</label>
            <div class="flex items-center rounded-xl border transition-all duration-200" :style="{
                background: '#111630',
                borderColor: focusedField === 'password' ? 'rgba(109,67,245,0.65)' : 'rgba(255,255,255,0.08)',
                boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(109,67,245,0.12)' : 'none',
            }">
                <svg class="w-4 h-4 ml-3.5 flex-shrink-0" style="color: rgba(255,255,255,0.28);" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                    class="flex-1 bg-transparent border-none outline-none px-3 py-3.5 text-sm"
                    style="color: rgba(255,255,255,0.88); font-family: inherit;" @focus="focusedField = 'password'"
                    @blur="focusedField = null" />
                <button type="button" class="px-3.5 flex items-center transition-colors duration-150"
                    style="color: rgba(255,255,255,0.28);" @click="showPassword = !showPassword"
                    @mouseenter="$event.currentTarget.style.color = 'rgba(255,255,255,0.65)'"
                    @mouseleave="$event.currentTarget.style.color = 'rgba(255,255,255,0.28)'">
                    <!-- Eye open -->
                    <svg v-if="!showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        stroke-width="1.8">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    <!-- Eye slash -->
                    <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        stroke-width="1.8">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Remember + Forgot -->
        <div class="flex items-center justify-between -mt-1">
            <label class="flex items-center gap-2 cursor-pointer select-none text-[0.8rem]"
                style="color: rgba(255,255,255,0.52);">
                <input type="checkbox" v-model="remember"
                    class="w-[15px] h-[15px] rounded cursor-pointer accent-[#4F46E5]" />
                Ghi nhớ đăng nhập
            </label>
            <a href="#" class="text-[0.8rem] font-semibold transition-colors duration-150" style="color: #4F46E5;"
                @mouseenter="$event.target.style.color = '#6862DF'">
                Quên mật khẩu?
            </a>
        </div>

        <!-- Submit button -->
        <button type="submit"
            class="w-full py-3.5 rounded-xl font-bold text-[0.95rem] text-white transition-all duration-200 mt-1"
            :class="isLoading ? 'opacity-70 pointer-events-none' : 'hover:-translate-y-0.5'"
            style="background: linear-gradient(135deg, #4F46E5 0%, #5535c8 100%); box-shadow: 0 6px 24px rgba(109,67,245,0.38);"
            @mouseenter="!isLoading && ($event.currentTarget.style.boxShadow = '0 10px 32px rgba(109,67,245,0.52)')"
            @mouseleave="$event.currentTarget.style.boxShadow = '0 6px 24px rgba(109,67,245,0.38)'">
            <span v-if="!isLoading">Đăng nhập</span>
            <span v-else class="inline-flex items-center justify-center gap-1.5">
                <span v-for="n in 3" :key="n" class="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce"
                    :style="{ animationDelay: (n - 1) * 0.18 + 's' }" />
            </span>
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-0.5">
            <div class="flex-1 h-px" style="background: rgba(255,255,255,0.07);" />
            <span class="text-[0.72rem] whitespace-nowrap" style="color: rgba(255,255,255,0.28);">Hoặc
                đăng
                nhập bằng</span>
            <div class="flex-1 h-px" style="background: rgba(255,255,255,0.07);" />
        </div>

        <!-- OAuth -->
        <div class="grid grid-cols-2 gap-2.5">
            <button v-for="provider in oauthProviders" :key="provider.name" type="button"
                class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-[0.85rem] font-semibold text-white/80 transition-all duration-150"
                style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.09);"
                @mouseenter="$event.currentTarget.style.background = 'rgba(255,255,255,0.09)'; $event.currentTarget.style.borderColor = 'rgba(255,255,255,0.17)'; $event.currentTarget.style.transform = 'translateY(-1px)'"
                @mouseleave="$event.currentTarget.style.background = 'rgba(255,255,255,0.05)'; $event.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; $event.currentTarget.style.transform = ''">
                <span v-html="provider.icon" class="flex-shrink-0" />
                {{ provider.name }}
            </button>
        </div>

        <!-- Sign up -->
        <div class="text-center text-[0.82rem] mt-1" style="color: rgba(255,255,255,0.42);">
            Chưa có tài khoản?
            <span @click="$emit('switch')" class="font-bold transition-colors duration-150" style="color: #4F46E5;"
                @mouseenter="$event.target.style.color = '#6862DF'">Đăng ký ngay
            </span>
        </div>
    </form>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
    isLoading: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['submit', 'switch'])
const email = ref('')
const password = ref('')
const remember = ref(false)
const focusedField = ref(null)
const showPassword = ref(false)

const oauthProviders = [
    {
        name: 'Google',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
    },
    {
        name: 'LinkedIn',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    },
]

function onSubmit() {
    if (!email.value.trim()) return alert('Vui lòng nhập email')
    if (!password.value) return alert('Vui lòng nhập mật khẩu')

    emit('submit', {
        email: email.value.trim(),
        password: password.value,
        remember: remember.value,
    })
}
</script>
