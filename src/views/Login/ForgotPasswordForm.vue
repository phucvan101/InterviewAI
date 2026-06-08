<template>
  <div class="mb-8">
    <div v-if="successMode" class="text-center animate-[formIn_0.3s_ease-out_both]">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
           style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);">
        <svg class="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-2xl font-bold text-white mb-3">Kiểm tra hộp thư</h3>
      <p class="text-sm leading-relaxed mb-8" style="color: rgba(255,255,255,0.6);">
        Chúng tôi đã gửi một mật khẩu mới đến email<br/> <strong class="text-white">{{ form.email }}</strong>.<br/>
        Vui lòng kiểm tra hộp thư đến (và mục thư rác).
      </p>
      <button 
        @click="$emit('back-to-login')"
        class="w-full py-3.5 rounded-xl font-bold text-[0.95rem] text-white transition-all duration-200 hover:-translate-y-0.5"
        style="background: linear-gradient(135deg, #4F46E5 0%, #5535c8 100%); box-shadow: 0 6px 24px rgba(109,67,245,0.38);"
        @mouseenter="$event.currentTarget.style.boxShadow = '0 10px 32px rgba(109,67,245,0.52)'"
        @mouseleave="$event.currentTarget.style.boxShadow = '0 6px 24px rgba(109,67,245,0.38)'"
      >
        Quay lại đăng nhập
      </button>
    </div>

    <div v-else class="animate-[formIn_0.3s_ease-out_both]">
      <div class="mb-8">
        <h2 class="text-[2rem] font-black text-white tracking-tight mb-1.5">Quên mật khẩu?</h2>
        <p class="text-sm" style="color: rgba(255,255,255,0.48);">
          Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một mật khẩu mới.
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
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
                <input v-model="form.email" type="email" placeholder="name@company.com"
                    class="flex-1 bg-transparent border-none outline-none px-3 py-3.5 text-sm"
                    style="color: rgba(255,255,255,0.88); font-family: inherit;" @focus="focusedField = 'email'"
                    @blur="focusedField = null" :disabled="isLoading" required />
            </div>
        </div>

        <div v-if="error" class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-[0.8rem] flex items-center gap-2 mt-1">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span>{{ error }}</span>
        </div>

        <button type="submit"
            class="w-full py-3.5 rounded-xl font-bold text-[0.95rem] text-white transition-all duration-200 mt-1"
            :class="(isLoading || !form.email) ? 'opacity-70 pointer-events-none' : 'hover:-translate-y-0.5'"
            style="background: linear-gradient(135deg, #4F46E5 0%, #5535c8 100%); box-shadow: 0 6px 24px rgba(109,67,245,0.38);"
            @mouseenter="(!isLoading && form.email) && ($event.currentTarget.style.boxShadow = '0 10px 32px rgba(109,67,245,0.52)')"
            @mouseleave="$event.currentTarget.style.boxShadow = '0 6px 24px rgba(109,67,245,0.38)'">
            <span v-if="!isLoading">Gửi mật khẩu mới</span>
            <span v-else class="inline-flex items-center justify-center gap-1.5">
                <span v-for="n in 3" :key="n" class="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce"
                    :style="{ animationDelay: (n - 1) * 0.18 + 's' }" />
            </span>
        </button>
      </form>

      <div class="mt-8 text-center">
        <button 
          @click="$emit('back-to-login')"
          class="text-[0.85rem] font-semibold transition-colors duration-150 inline-flex items-center gap-1.5 group"
          style="color: rgba(255,255,255,0.5);"
          @mouseenter="$event.currentTarget.style.color = '#fff'"
          @mouseleave="$event.currentTarget.style.color = 'rgba(255,255,255,0.5)'"
        >
          <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['back-to-login'])
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')
const successMode = ref(false)
const focusedField = ref(null)

const form = reactive({
  email: ''
})

const handleSubmit = async () => {
  if (!form.email) return
  
  try {
    isLoading.value = true
    error.value = ''
    
    await authStore.forgotPassword(form.email)
    successMode.value = true
  } catch (err) {
    error.value = err.message || err.response?.data?.detail || 'Có lỗi xảy ra, vui lòng thử lại sau.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
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
.animate-\[formIn_0\.3s_ease-out_both\] {
    animation: formIn 0.3s ease-out both;
}
input::placeholder {
    color: rgba(255, 255, 255, 0.22) !important;
}
</style>
