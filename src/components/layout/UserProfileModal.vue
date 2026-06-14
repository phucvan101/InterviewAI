<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="w-full max-w-4xl bg-[#0f1225] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
         style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
        <h2 class="text-lg font-semibold text-white">Thông tin cá nhân</h2>
        <button @click="$emit('close')" class="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-8">
        
        <!-- Profile Section -->
        <div class="flex flex-col md:flex-row gap-8 items-start">
          
          <!-- Avatar -->
          <div class="flex flex-col items-center gap-3">
            <div class="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-[#4F46E5]/30 bg-gradient-to-br from-[#4F46E5]/20 to-[#06B6D4]/20 p-1">
              <img :src="avatarUrl" alt="Avatar" class="w-full h-full object-cover rounded-xl" />
            </div>
            <div class="text-xs text-white/40 text-center max-w-[120px]">
              Avatar được tạo tự động ngẫu nhiên
            </div>
          </div>

          <!-- Info Form -->
          <div class="flex-1 w-full space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-white font-medium text-base">Chi tiết tài khoản</h3>
              <button v-if="!isEditing" @click="startEditing" 
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-colors border border-white/10">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Chỉnh sửa
              </button>
              <div v-else class="flex gap-2">
                <button @click="cancelEditing" 
                        class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-white/60 text-sm transition-colors">
                  Hủy
                </button>
                <button @click="saveProfile" :disabled="saving"
                        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white text-sm font-medium transition-colors disabled:opacity-50">
                  <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Lưu
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Full Name -->
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Họ và tên</label>
                <div v-if="!isEditing" class="text-white bg-white/5 px-3 py-2 rounded-lg border border-transparent min-h-[42px] flex items-center">
                  {{ formData.full_name || 'Chưa cập nhật' }}
                </div>
                <input v-else v-model="formData.full_name" type="text" 
                       class="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white outline-none focus:border-[#4F46E5] transition-colors"
                       placeholder="Nhập họ và tên..." />
              </div>

              <!-- User Name -->
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Tên đăng nhập</label>
                <div v-if="!isEditing" class="text-white bg-white/5 px-3 py-2 rounded-lg border border-transparent min-h-[42px] flex items-center">
                  {{ formData.user_name || formData.name || 'Chưa cập nhật' }}
                </div>
                <input v-else v-model="formData.user_name" type="text" 
                       class="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white outline-none focus:border-[#4F46E5] transition-colors"
                       placeholder="Nhập tên đăng nhập..." />
              </div>

              <!-- Email (Readonly) -->
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-white/50 uppercase tracking-wider flex justify-between">
                  <span>Email</span>
                  <span class="text-[10px] text-white/30">(Không thể sửa)</span>
                </label>
                <div class="text-white/70 bg-white/5 px-3 py-2 rounded-lg border border-white/5 min-h-[42px] flex items-center select-none opacity-80 cursor-not-allowed">
                  {{ user?.email || 'N/A' }}
                </div>
              </div>

              <!-- Status (Readonly) -->
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-white/50 uppercase tracking-wider">Trạng thái tài khoản</label>
                <div class="min-h-[42px] flex items-center">
                  <span v-if="isActive" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Đang hoạt động
                  </span>
                  <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Bị khóa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const user = computed(() => authStore.user)

// Trạng thái tài khoản (thường là is_active = 1 hoặc true)
const isActive = computed(() => {
  if (!user.value) return false;
  return user.value.is_active === 1 || user.value.is_active === true || user.value.status === 'active';
})

// Avatar tạo tự động bằng DiceBear API
// Sử dụng style 'bottts-neutral' hoặc 'adventurer'
const avatarUrl = computed(() => {
  const seed = user.value?.email || user.value?.name || 'default'
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0f1225`
})

// Form data
const isEditing = ref(false)
const saving = ref(false)
const formData = ref({
  full_name: '',
  user_name: '',
})


onMounted(() => {
  if (user.value) {
    formData.value = {
      full_name: user.value.full_name || user.value.name || '',
      user_name: user.value.user_name || user.value.username || user.value.name || '',
    }
  }
})

const startEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  if (user.value) {
    formData.value = {
      full_name: user.value.full_name || user.value.name || '',
      user_name: user.value.user_name || user.value.username || user.value.name || '',
    }
  }
  isEditing.value = false
}

const saveProfile = async () => {
  if (!formData.value.full_name.trim()) {
    ElMessage.warning('Họ và tên không được để trống')
    return
  }
  
  saving.value = true
  try {
    // Chuẩn bị payload, mapping các key cho phù hợp với API BE
    const payload = {
      full_name: formData.value.full_name,
      username: formData.value.user_name,
      // name: formData.value.full_name, // Nếu backend dùng 'name' thay vì 'full_name'
    }
    
    await authStore.updateProfile(payload)
    ElMessage.success('Cập nhật thông tin thành công')
    isEditing.value = false
  } catch (error) {
    ElMessage.error(error.message || 'Có lỗi xảy ra khi cập nhật thông tin')
  } finally {
    saving.value = false
  }
}
</script>
