<script setup lang="ts">
import LayoutDefaultAdmin from '../layouts/LayoutDefaultAdmin.vue';
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    UserFilled, User, Setting, DataAnalysis,
    Briefcase, VideoCamera, School, Lock, EditPen
} from '@element-plus/icons-vue'
import { useManagePermissionStore } from "../../../stores/admin/managePermission";
import { useAuthStore } from '../../../stores/auth';

const router = useRouter();
const managePermissionStore = useManagePermissionStore();
const authStore = useAuthStore();

// ── Roles từ API ──────────────────────────────────────────────────────────
const roles1 = computed(() => managePermissionStore.roles)

const selectedRole = ref<number | null>(null)

// Role hiện tại được chọn (full object)
const currentRole = computed(() =>
    roles1.value.find((r: any) => r.id === selectedRole.value) ?? null
)

// Nhóm permissions theo module của role đang chọn
const groupedPermissions = computed(() => {
    if (!currentRole.value) return {}
    return groupPermissions(currentRole.value.permissions ?? [])
})


watch(roles1, (newRoles) => {
    if (newRoles.length > 0 && !selectedRole.value) {
        selectedRole.value = newRoles[0].id
    }
})

const fetchRoles = async () => {
    try {
        await managePermissionStore.fetchRoles()
    } catch (error) {
        ElMessage.error('Failed to fetch roles')
    }
}

const createRole = () => {
    router.push({ name: 'admin-role-configuration-create' });
}

const selectRole = (id: number) => {
    selectedRole.value = id
}

// Nhóm permissions theo module
const groupPermissions = (permissions: any[]) => {
    const grouped: Record<string, { title: string; permissions: any[] }> = {}
    permissions.forEach((item) => {
        const moduleName = item.module || 'other'
        if (!grouped[moduleName]) {
            grouped[moduleName] = {
                title: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
                permissions: [],
            }
        }
        grouped[moduleName].permissions.push(item)
    })
    return grouped
}

// Module icon map
const moduleIconMap: Record<string, any> = {
    users: User,
    ai: DataAnalysis,
    system: Setting,
    billing: Briefcase,
    interview: VideoCamera,
}
const moduleColorMap: Record<string, string> = {
    users: '#818cf8',
    ai: '#f472b6',
    system: '#f87171',
    billing: '#34d399',
    interview: '#fbbf24',
}
const getModuleIcon = (mod: string) => moduleIconMap[mod] ?? Lock
const getModuleColor = (mod: string) => moduleColorMap[mod] ?? '#9ca3af'

function editRole() {
    router.push({ name: 'admin-role-configuration-edit', params: { id: selectedRole.value } });
}

const deleteRole = async () => {
    try {
        await managePermissionStore.deleteRole(selectedRole.value)
        ElMessage({
            type: 'success',
            message: 'Xóa vai trò thành công',
        })
        fetchRoles()
    } catch (error) {
        ElMessage({
            type: 'error',
            message: 'Xóa vai trò thất bại',
        })
    }
}

function confirmDeleteRole() {
    ElMessageBox.confirm('Bạn có chắc chắn muốn xóa vai trò này?', 'Cảnh báo', {
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy bỏ',
        type: 'warning'
    })
        .then(() => {
            deleteRole()
        })
}

onMounted(() => {
    fetchRoles()
})
</script>

<template>
    <LayoutDefaultAdmin>
        <div class="p-6 w-full">

            <!-- Page Header -->
            <div class="flex justify-between items-end mb-6">
                <div style="color: #DFE4FE">
                    <div class="text-3xl font-bold mb-2">Quản lý quyền</div>
                    <p class="text-sm opacity-70">Quản lý và phân bổ quyền hạn cho các cấp bậc người dùng trong hệ thống
                        AI.</p>
                </div>
                <button v-if="authStore.hasPermission('roles.create')"
                    class="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 btn-common"
                    @click="createRole">
                    + Tạo vai trò mới
                </button>
            </div>

            <div class="min-h-screen bg-[#0d0f1e] text-white">

                <!-- Role Selector -->
                <div class="grid grid-cols-5 gap-3 mb-6" v-if="roles1.length > 0">
                    <div v-for="role in roles1" :key="role.id" @click="selectRole(role.id)" :class="[
                        'flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-200',
                        selectedRole === role.id
                            ? 'bg-[#1a1d3a] border-[#6366f1] shadow-[0_0_0_1px_#6366f1]'
                            : 'bg-[#13152a] border-[#2a2d4a] hover:border-[#4a4d7a]'
                    ]">
                        <!-- Badge is_system -->
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                            :class="selectedRole === role.id ? 'bg-[#6366f1]/20' : 'bg-[#1e2040]'">
                            <el-icon :size="16" :style="{ color: selectedRole === role.id ? '#818cf8' : '#5a5f8a' }">
                                <Lock />
                            </el-icon>
                        </div>

                        <div class="text-center w-full">
                            <div
                                :class="['text-sm font-semibold truncate', selectedRole === role.id ? 'text-white' : 'text-[#9ca3af]']">
                                {{ role.name }}
                            </div>
                            <div class="text-[10px] text-[#6b7280] mt-0.5 line-clamp-1 px-1" :title="role.description">
                                {{ role.description || '—' }}
                            </div>
                        </div>

                        <!-- System badge -->
                        <span v-if="role.is_system"
                            class="text-[9px] px-2 py-0.5 rounded-full bg-[#6366f1]/20 text-[#818cf8] font-semibold uppercase tracking-wider">
                            System
                        </span>

                        <!-- Permission count -->
                        <span class="text-[10px] text-[#6b7280]">
                            {{ role.permissions?.length ?? 0 }} quyền
                        </span>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-else class="text-center text-[#6b7280] py-10">Đang tải danh sách vai trò...</div>

                <!-- Permission Detail Panel -->
                <div class="bg-[#13152a] rounded-2xl border border-[#2a2d4a] p-6" v-if="currentRole">

                    <!-- Header -->
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-lg bg-[#6366f1]/20 flex items-center justify-center">
                                <el-icon :size="18" class="text-[#818cf8]">
                                    <Lock />
                                </el-icon>
                            </div>
                            <div>
                                <h2 class="text-base font-semibold text-white">
                                    Chi tiết quyền hạn:
                                    <span class="text-[#818cf8]">{{ currentRole.name }}</span>
                                </h2>
                                <p class="text-xs text-[#6b7280] mt-0.5">{{ currentRole.description }}</p>
                            </div>
                        </div>

                        <!-- Meta info -->
                        <div class="flex items-center gap-6 text-xs text-[#6b7280]">
                            <div class="text-right">
                                <div class="text-[10px] uppercase tracking-wider mb-0.5">Tạo lúc</div>
                                <div class="text-[#9ca3af]">{{ new
                                    Date(currentRole.created_at).toLocaleDateString('vi-VN') }}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-[10px] uppercase tracking-wider mb-0.5">Cập nhật</div>
                                <div class="text-[#9ca3af]">{{ new
                                    Date(currentRole.updated_at).toLocaleDateString('vi-VN') }}</div>
                            </div>
                            <div class="flex items-center gap-3">
                                <el-button v-if="authStore.hasPermission('roles.delete')" @click="confirmDeleteRole"
                                    class="!bg-transparent !border-red-500 !text-red-500 hover:!bg-red-500 hover:!border-red-500 hover:!text-white !rounded-xl">
                                    Xóa vai trò
                                </el-button>
                                <el-button v-if="authStore.hasPermission('roles.update')" type="primary"
                                    @click="editRole"
                                    class="!bg-[#6366f1] !border-[#6366f1] !rounded-xl !font-semibold hover:!bg-[#5154cc]">
                                    <el-icon class="mr-2">
                                        <EditPen />
                                    </el-icon>
                                    Chỉnh sửa
                                </el-button>
                            </div>
                        </div>
                    </div>

                    <!-- No permissions -->
                    <div v-if="Object.keys(groupedPermissions).length === 0"
                        class="text-center text-[#6b7280] py-10 text-sm">
                        Vai trò này chưa có quyền nào được gán.
                    </div>

                    <!-- Permission Groups Grid -->
                    <div v-else class="grid gap-6"
                        :class="Object.keys(groupedPermissions).length === 1 ? 'grid-cols-1' : 'grid-cols-2'">
                        <div v-for="(group, moduleName) in groupedPermissions" :key="moduleName">

                            <!-- Module Header -->
                            <div class="flex items-center gap-2 mb-3">
                                <el-icon :size="14" :style="{ color: getModuleColor(moduleName as string) }">
                                    <component :is="getModuleIcon(moduleName as string)" />
                                </el-icon>
                                <span class="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
                                    {{ group.title }}
                                </span>
                                <span class="ml-auto text-[10px] text-[#6b7280] bg-[#1e2040] px-2 py-0.5 rounded-full">
                                    {{ group.permissions.length }}
                                </span>
                            </div>

                            <!-- Permissions List -->
                            <div class="space-y-2">
                                <div v-for="perm in group.permissions" :key="perm.id"
                                    class="flex items-center justify-between bg-[#0f1123] rounded-xl px-4 py-3 border border-[#1e2040] hover:bg-[#1a1d3a] transition-colors">
                                    <div class="flex gap-5 min-w-0">
                                        <div class="flex items-center gap-2">
                                            <div class="text-sm font-semibold text-white">{{ perm.name }}</div>
                                            <span
                                                class="text-[9px] font-mono bg-[#1e2040] text-[#6b7280] px-1.5 py-0.5 rounded">
                                                {{ perm.code }}
                                            </span>
                                        </div>
                                        <div class="text-xs text-[#6b7280] mt-0.5 truncate">{{ perm.description }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    </LayoutDefaultAdmin>
</template>

<style scoped></style>