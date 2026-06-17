<template>
    <div class="mb-8">
        <h2 class="text-[2rem] font-black text-white tracking-tight mb-1.5">Đăng ký tài khoản</h2>
        <p class="text-sm" style="color: rgba(255,255,255,0.48);">Vui lòng nhập thông
            tin
            của bạn.</p>
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <!-- Full name -->
        <div class="flex flex-col gap-1.5">
            <label class="text-[0.8rem] font-semibold" style="color: rgba(255,255,255,0.72);">Họ và
                tên</label>
            <div class="flex items-center rounded-xl border transition-all duration-200 relative" :style="{
                background: '#111630',
                borderColor: focusedField === 'fullName' ? 'rgba(109,67,245,0.65)' : (validation.fullName === false ? 'rgba(239,68,68,0.5)' : (validation.fullName === true ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)')),
                boxShadow: focusedField === 'fullName' ? '0 0 0 3px rgba(109,67,245,0.12)' : 'none',
            }">
                <svg class="w-4 h-4 ml-3.5 flex-shrink-0" style="color: rgba(255,255,255,0.28);" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <input v-model="fullName" type="text" placeholder="Nguyễn Văn A"
                    class="flex-1 bg-transparent border-none outline-none px-3 py-3.5 text-sm pr-10"
                    style="color: rgba(255,255,255,0.88); font-family: inherit;" @focus="focusedField = 'fullName'"
                    @blur="focusedField = null" />

                <!-- Validation Icons -->
                <div class="absolute right-3 flex items-center pointer-events-none">
                    <svg v-if="validation.fullName === true" class="w-5 h-5 text-emerald-500" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else-if="validation.fullName === false" class="w-5 h-5 text-red-500" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            </div>
            <p v-if="validation.fullName === false" class="text-[0.72rem] mt-0.5 text-red-400">
                {{ errors.fullName }}
            </p>
        </div>

        <!-- Username -->
        <div class="flex flex-col gap-1.5">
            <label class="text-[0.8rem] font-semibold" style="color: rgba(255,255,255,0.72);">Username</label>
            <div class="flex items-center rounded-xl border transition-all duration-200 relative" :style="{
                background: '#111630',
                borderColor: focusedField === 'username' ? 'rgba(109,67,245,0.65)' : (validation.username === false ? 'rgba(239,68,68,0.5)' : (validation.username === true ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)')),
                boxShadow: focusedField === 'username' ? '0 0 0 3px rgba(109,67,245,0.12)' : 'none',
            }">
                <svg class="w-4 h-4 ml-3.5 flex-shrink-0" style="color: rgba(255,255,255,0.28);" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <input v-model="username" type="text" placeholder="user_01"
                    class="flex-1 bg-transparent border-none outline-none px-3 py-3.5 text-sm pr-10"
                    style="color: rgba(255,255,255,0.88); font-family: inherit;" @focus="focusedField = 'username'"
                    @blur="focusedField = null" />

                <!-- Validation Icons -->
                <div class="absolute right-3 flex items-center pointer-events-none">
                    <svg v-if="validation.username === true" class="w-5 h-5 text-emerald-500" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else-if="validation.username === false" class="w-5 h-5 text-red-500" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            </div>
            <p v-if="validation.username === false" class="text-[0.72rem] mt-0.5 text-red-400">
                {{ errors.username }}
            </p>
            <p v-else class="text-[0.72rem] mt-0.5" style="color: rgba(255,255,255,0.45);">
                3-50 ký tự, chỉ gồm a-z A-Z 0-9, dấu gạch dưới (_) hoặc gạch ngang (-).
            </p>
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-1.5">
            <label class="text-[0.8rem] font-semibold" style="color: rgba(255,255,255,0.72);">Email</label>
            <div class="flex items-center rounded-xl border transition-all duration-200 relative" :style="{
                background: '#111630',
                borderColor: focusedField === 'email' ? 'rgba(109,67,245,0.65)' : (validation.email === false ? 'rgba(239,68,68,0.5)' : (validation.email === true ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)')),
                boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(109,67,245,0.12)' : 'none',
            }">
                <svg class="w-4 h-4 ml-3.5 flex-shrink-0" style="color: rgba(255,255,255,0.28);" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <input v-model="email" type="email" placeholder="name@company.com"
                    class="flex-1 bg-transparent border-none outline-none px-3 py-3.5 text-sm pr-10"
                    style="color: rgba(255,255,255,0.88); font-family: inherit;" @focus="focusedField = 'email'"
                    @blur="handleEmailBlur" />

                <!-- Validation Icons -->
                <div class="absolute right-3 flex items-center pointer-events-none">
                    <svg v-if="isValidatingEmail" class="w-5 h-5 text-indigo-400 animate-spin" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <svg v-else-if="validation.email === true" class="w-5 h-5 text-emerald-500" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else-if="validation.email === false" class="w-5 h-5 text-red-500" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            </div>
            <p v-if="validation.email === false" class="text-[0.72rem] mt-0.5 text-red-400">
                {{ errors.email }}
            </p>
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-1.5">
            <label class="text-[0.8rem] font-semibold" style="color: rgba(255,255,255,0.72);">Mật
                khẩu</label>
            <div class="flex items-center rounded-xl border transition-all duration-200 relative" :style="{
                background: '#111630',
                borderColor: focusedField === 'password' ? 'rgba(109,67,245,0.65)' : (validation.password === false ? 'rgba(239,68,68,0.5)' : (validation.password === true ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)')),
                boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(109,67,245,0.12)' : 'none',
            }">
                <svg class="w-4 h-4 ml-3.5 flex-shrink-0" style="color: rgba(255,255,255,0.28);" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                    class="flex-1 bg-transparent border-none outline-none px-3 py-3.5 text-sm pr-16"
                    style="color: rgba(255,255,255,0.88); font-family: inherit;" @focus="focusedField = 'password'"
                    @blur="focusedField = null" />

                <!-- Validation Icons -->
                <div class="absolute right-12 flex items-center pointer-events-none">
                    <svg v-if="validation.password === true" class="w-5 h-5 text-emerald-500" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else-if="validation.password === false" class="w-5 h-5 text-red-500" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <button type="button" class="px-3.5 flex items-center transition-colors duration-150 absolute right-0"
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
            <p v-if="validation.password === false" class="text-[0.72rem] mt-0.5 text-red-400">
                {{ errors.password }}
            </p>
            <p v-else class="text-[0.72rem] mt-0.5" style="color: rgba(255,255,255,0.45);">
                8-100 ký tự, có ít nhất 1 chữ in hoa và 1 số.
            </p>
        </div>

        <!-- Remember + Forgot -->
        <div class="flex items-center justify-between -mt-1">
            <label class="flex items-center gap-2 cursor-pointer select-none text-[0.8rem]"
                style="color: rgba(255,255,255,0.52);">
                <input type="checkbox" v-model="remember"
                    class="w-[15px] h-[15px] rounded cursor-pointer accent-[#4F46E5]" />
                Ghi nhớ thông tin đăng nhập
            </label>
        </div>

        <!-- Submit button -->
        <button type="submit"
            class="w-full py-3.5 rounded-xl font-bold text-[0.95rem] text-white transition-all duration-200 mt-1"
            :class="isLoading ? 'opacity-70 pointer-events-none' : 'hover:-translate-y-0.5'"
            style="background: linear-gradient(135deg, #4F46E5 0%, #5535c8 100%); box-shadow: 0 6px 24px rgba(109,67,245,0.38);"
            @mouseenter="!isLoading && ($event.currentTarget.style.boxShadow = '0 10px 32px rgba(109,67,245,0.52)')"
            @mouseleave="$event.currentTarget.style.boxShadow = '0 6px 24px rgba(109,67,245,0.38)'">
            <span v-if="!isLoading">Đăng ký</span>
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
        <div>
            <button v-for="provider in oauthProviders" :key="provider.name" type="button"
                class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-[0.85rem] font-semibold text-white/80 transition-all duration-150 w-full"
                style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.09);"
                @mouseenter="$event.currentTarget.style.background = 'rgba(255,255,255,0.09)'; $event.currentTarget.style.borderColor = 'rgba(255,255,255,0.17)'; $event.currentTarget.style.transform = 'translateY(-1px)'"
                @mouseleave="$event.currentTarget.style.background = 'rgba(255,255,255,0.05)'; $event.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; $event.currentTarget.style.transform = ''"
                @click="onOAuth(provider)">
                <span v-html="provider.icon" class="flex-shrink-0" />
                {{ provider.name }}
            </button>
        </div>

        <!-- Back to login -->
        <p class="text-center text-[0.82rem] mt-1" style="color: rgba(255,255,255,0.42);">
            Đã có tài khoản?
            <span @click="$emit('switch')" class="font-bold transition-colors duration-150 cursor-pointer"
                style="color: #4F46E5;" @mouseenter="$event.target.style.color = '#6862DF'">Đăng nhập
            </span>
        </p>

    </form>
</template>

<script setup>
import { ref, watch } from 'vue'

defineProps({
    isLoading: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['submit', 'switch', 'oauth'])
const fullName = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const remember = ref(false)
const focusedField = ref(null)
const showPassword = ref(false)

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,50}$/
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,100}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validation = ref({
    fullName: null,
    username: null,
    email: null,
    password: null
})

const errors = ref({
    fullName: '',
    username: '',
    email: '',
    password: ''
})

// Validation Watchers
watch(fullName, (val) => {
    if (!val || val.trim().length === 0) {
        validation.value.fullName = null
        errors.value.fullName = ''
    } else {
        validation.value.fullName = val.trim().length > 0
        if (!validation.value.fullName) errors.value.fullName = 'Họ và tên không hợp lệ.'
    }
})

watch(username, (val) => {
    if (!val || val.trim().length === 0) {
        validation.value.username = null
        errors.value.username = ''
    } else {
        validation.value.username = USERNAME_REGEX.test(val.trim())
        if (!validation.value.username) errors.value.username = 'Username không hợp lệ. Chỉ dùng a-z, A-Z, 0-9, _, - và dài 3-50 ký tự.'
    }
})

watch(password, (val) => {
    if (!val || val.length === 0) {
        validation.value.password = null
        errors.value.password = ''
    } else {
        validation.value.password = PASSWORD_REGEX.test(val)
        if (!validation.value.password) errors.value.password = 'Mật khẩu phải dài 8-100 ký tự, có ít nhất 1 chữ in hoa và 1 số.'
    }
})

const isValidatingEmail = ref(false)

watch(email, (val) => {
    // Chỉ reset validation khi đang gõ, không gọi API ở đây
    if (!val || val.trim().length === 0) {
        validation.value.email = null
        errors.value.email = ''
    } else {
        const isFormatValid = EMAIL_REGEX.test(val.trim())
        if (!isFormatValid) {
            validation.value.email = false
            errors.value.email = 'Email không đúng định dạng.'
        } else {
            // Định dạng đúng, tạm coi là hợp lệ cho đến khi blur kiểm tra
            validation.value.email = null
            errors.value.email = ''
        }
    }
})

const handleEmailBlur = async () => {
    focusedField.value = null
    const val = email.value.trim()
    if (!val || !EMAIL_REGEX.test(val)) return

    isValidatingEmail.value = true
    try {
        let baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
        const path = `/api/v1/users/verify-email?email=${encodeURIComponent(val)}`
        // Xử lý để tránh bị trùng /api/api/v1
        if (baseUrl.endsWith('/api') && path.startsWith('/api/')) {
            baseUrl = baseUrl.slice(0, -4)
        }
        const url = `${baseUrl}${path}`

        // Dùng fetch thay vì axios vì không cần auth
        const res = await fetch(url)
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.detail || 'Lỗi API xác thực')
        }
        const data = await res.json()

        // Kiểm tra deliverability
        const isDeliverable = data.deliverability === 'DELIVERABLE'
        if (isDeliverable || data.deliverability === 'UNKNOWN') {
            validation.value.email = true
            errors.value.email = ''
        } else {
            validation.value.email = false
            errors.value.email = 'Email không tồn tại hoặc không thể nhận thư.'
        }
    } catch (err) {
        // Hiển thị lỗi API ra UI (có thể hiển thị bằng ElMessage hoặc gán vào errors)
        validation.value.email = false
        errors.value.email = `Lỗi xác thực API: ${err.message}`
        import('element-plus').then(({ ElMessage }) => {
            ElMessage.error(`Lỗi xác thực email: ${err.message}`)
        })
    } finally {
        isValidatingEmail.value = false
    }
}

const oauthProviders = [
    {
        name: 'Google',
        icon: `<svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
    },
    // {
    //     name: 'LinkedIn',
    //     icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    // },
]

function onSubmit() {
    if (!fullName.value.trim()) return alert('Nhập họ tên')
    if (!username.value.trim()) return alert('Nhập username')
    if (!USERNAME_REGEX.test(username.value.trim())) {
        return alert('Username không hợp lệ. Chỉ dùng a-zA-Z0-9_- và dài 3-50 ký tự.')
    }
    if (!email.value.trim()) return alert('Nhập email')
    if (!password.value) return alert('Nhập mật khẩu')
    if (!PASSWORD_REGEX.test(password.value)) {
        return alert('Mật khẩu phải dài 8-100 ký tự, có ít nhất 1 chữ in hoa và 1 số.')
    }

    emit('submit', {
        email: email.value.trim(),
        username: username.value.trim(),
        full_name: fullName.value.trim(),
        password: password.value,
    })
}

function onOAuth(provider) {
    emit('oauth', provider)
}
</script>
