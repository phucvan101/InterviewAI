<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="relative w-full max-w-md rounded-[1.5rem] border overflow-hidden animate-[formIn_0.3s_ease-out_both]" 
         style="background: #080c22; border-color: rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);" @click.stop>
      
      <!-- Grid texture overlay -->
      <div class="absolute inset-0 pointer-events-none opacity-50"
          style="background-image: linear-gradient(rgba(109,67,245,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(109,67,245,0.04) 1px, transparent 1px); background-size: 40px 40px;" />

      <div class="relative z-10 p-8">
        <!-- Close button -->
        <button @click="$emit('close')" class="absolute top-5 right-5 text-white/40 hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="mb-8">
          <h2 class="text-[1.75rem] font-black text-white tracking-tight mb-1.5 flex items-center gap-2">
            Đổi mật khẩu
          </h2>
          <p class="text-sm" style="color: rgba(255,255,255,0.48);">Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <!-- Current Password -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[0.8rem] font-semibold" style="color: rgba(255,255,255,0.72);">Mật khẩu hiện tại</label>
            <div class="flex items-center rounded-xl border transition-all duration-200" :style="{
                background: '#111630',
                borderColor: focusedField === 'current' ? 'rgba(109,67,245,0.65)' : 'rgba(255,255,255,0.08)',
                boxShadow: focusedField === 'current' ? '0 0 0 3px rgba(109,67,245,0.12)' : 'none',
            }">
              <svg class="w-4 h-4 ml-3.5 flex-shrink-0" style="color: rgba(255,255,255,0.28);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <input v-model="form.current_password" :type="showCurrent ? 'text' : 'password'" placeholder="••••••••"
                  class="flex-1 bg-transparent border-none outline-none px-3 py-3.5 text-sm"
                  style="color: rgba(255,255,255,0.88); font-family: inherit;" @focus="focusedField = 'current'" @blur="focusedField = null" />
              <button type="button" class="px-3.5 flex items-center transition-colors" style="color: rgba(255,255,255,0.28);" @click="showCurrent = !showCurrent" @mouseenter="$event.currentTarget.style.color = 'rgba(255,255,255,0.65)'" @mouseleave="$event.currentTarget.style.color = 'rgba(255,255,255,0.28)'">
                <svg v-if="!showCurrent" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[0.8rem] font-semibold" style="color: rgba(255,255,255,0.72);">Mật khẩu mới</label>
            <div class="flex items-center rounded-xl border transition-all duration-200" :style="{
                background: '#111630',
                borderColor: focusedField === 'new' ? 'rgba(109,67,245,0.65)' : 'rgba(255,255,255,0.08)',
                boxShadow: focusedField === 'new' ? '0 0 0 3px rgba(109,67,245,0.12)' : 'none',
            }">
              <svg class="w-4 h-4 ml-3.5 flex-shrink-0" style="color: rgba(255,255,255,0.28);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <input v-model="form.new_password" :type="showNew ? 'text' : 'password'" placeholder="••••••••"
                  class="flex-1 bg-transparent border-none outline-none px-3 py-3.5 text-sm"
                  style="color: rgba(255,255,255,0.88); font-family: inherit;" @focus="focusedField = 'new'" @blur="focusedField = null" />
              <button type="button" class="px-3.5 flex items-center transition-colors" style="color: rgba(255,255,255,0.28);" @click="showNew = !showNew" @mouseenter="$event.currentTarget.style.color = 'rgba(255,255,255,0.65)'" @mouseleave="$event.currentTarget.style.color = 'rgba(255,255,255,0.28)'">
                <svg v-if="!showNew" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              </button>
            </div>
            <p class="text-[0.7rem]" style="color: rgba(255,255,255,0.4);">Tối thiểu 8 ký tự, có chữ hoa và số.</p>
          </div>

          <!-- Confirm New Password -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[0.8rem] font-semibold" style="color: rgba(255,255,255,0.72);">Xác nhận mật khẩu mới</label>
            <div class="flex items-center rounded-xl border transition-all duration-200" :style="{
                background: '#111630',
                borderColor: focusedField === 'confirm' ? 'rgba(109,67,245,0.65)' : 'rgba(255,255,255,0.08)',
                boxShadow: focusedField === 'confirm' ? '0 0 0 3px rgba(109,67,245,0.12)' : 'none',
            }">
              <svg class="w-4 h-4 ml-3.5 flex-shrink-0" style="color: rgba(255,255,255,0.28);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <input v-model="form.confirm_password" :type="showConfirm ? 'text' : 'password'" placeholder="••••••••"
                  class="flex-1 bg-transparent border-none outline-none px-3 py-3.5 text-sm"
                  style="color: rgba(255,255,255,0.88); font-family: inherit;" @focus="focusedField = 'confirm'" @blur="focusedField = null" />
              <button type="button" class="px-3.5 flex items-center transition-colors" style="color: rgba(255,255,255,0.28);" @click="showConfirm = !showConfirm" @mouseenter="$event.currentTarget.style.color = 'rgba(255,255,255,0.65)'" @mouseleave="$event.currentTarget.style.color = 'rgba(255,255,255,0.28)'">
                <svg v-if="!showConfirm" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-[0.8rem] flex items-center gap-2 mt-1">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>{{ error }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 mt-4">
            <button type="button" @click="$emit('close')" :disabled="isLoading"
              class="w-1/3 py-3.5 rounded-xl font-bold text-[0.95rem] text-white/80 transition-all duration-200 border"
              style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.08);"
              @mouseenter="!isLoading && ($event.currentTarget.style.background = 'rgba(255,255,255,0.1)')"
              @mouseleave="$event.currentTarget.style.background = 'rgba(255,255,255,0.05)'">
              Hủy
            </button>
            <button type="submit" :disabled="isLoading || !isValid"
              class="flex-1 py-3.5 rounded-xl font-bold text-[0.95rem] text-white transition-all duration-200"
              :class="(isLoading || !isValid) ? 'opacity-70 pointer-events-none' : 'hover:-translate-y-0.5'"
              style="background: linear-gradient(135deg, #4F46E5 0%, #5535c8 100%); box-shadow: 0 6px 24px rgba(109,67,245,0.38);"
              @mouseenter="(!isLoading && isValid) && ($event.currentTarget.style.boxShadow = '0 10px 32px rgba(109,67,245,0.52)')"
              @mouseleave="$event.currentTarget.style.boxShadow = '0 6px 24px rgba(109,67,245,0.38)'">
              <span v-if="!isLoading">Xác nhận đổi</span>
              <span v-else class="inline-flex items-center justify-center gap-1.5">
                  <span v-for="n in 3" :key="n" class="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce"
                      :style="{ animationDelay: (n - 1) * 0.18 + 's' }" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const emit = defineEmits(['close'])
const authStore = useAuthStore()
const router = useRouter()

const isLoading = ref(false)
const error = ref('')

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const focusedField = ref(null)

const form = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const isValid = computed(() => {
  return form.current_password && 
         form.new_password.length >= 8 && 
         form.confirm_password && 
         form.new_password === form.confirm_password
})

const handleSubmit = async () => {
  if (form.new_password !== form.confirm_password) {
    error.value = 'Mật khẩu xác nhận không khớp.'
    return
  }
  
  if (form.current_password === form.new_password) {
    error.value = 'Mật khẩu mới phải khác mật khẩu hiện tại.'
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    
    await authStore.changePassword({
      current_password: form.current_password,
      new_password: form.new_password
    })
    
    // Log out the user and redirect
    authStore.logout()
    emit('close')
    router.push('/')
    alert('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
    
  } catch (err) {
    error.value = err.message || err.detail || err.response?.data?.detail || 'Có lỗi xảy ra, vui lòng kiểm tra lại mật khẩu hiện tại.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@keyframes formIn {
    from {
        opacity: 0;
        transform: translateY(22px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
    display: none;
}
input::placeholder {
    color: rgba(255, 255, 255, 0.22) !important;
}
</style>
