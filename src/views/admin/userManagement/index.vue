<template>
    <LayoutDefaultAdmin>
        <div class="bg-[#0F172A] m-6 p-6 rounded-2xl text-white w-full">
            <div class="flex justify-between mb-4 items-center gap-4">
                <div class="flex gap-4 flex-wrap">
                    <input v-model="filters.username" type="text" placeholder="Tên tài khoản..."
                        class="bg-[#020617] border border-[#1E293B] px-4 py-2 rounded-lg text-sm w-[250px]" />

                    <input v-model="filters.email" type="text" placeholder="Email..."
                        class="bg-[#020617] border border-[#1E293B] px-4 py-2 rounded-lg text-sm w-[250px]" />

                    <select v-model="filters.auth"
                        class="bg-[#020617] border border-[#1E293B] px-3 py-2 rounded-lg text-sm">
                        <option value="">Tất cả loại tài khoản</option>
                        <option value="google">Google</option>
                        <option value="password">Thường</option>
                    </select>

                    <select v-model="filters.is_active"
                        class="bg-[#020617] border border-[#1E293B] px-3 py-2 rounded-lg text-sm">
                        <option value="">Tất cả trạng thái</option>
                        <option value="true">Hoạt động</option>
                        <option value="false">Đã khóa</option>
                    </select>
                </div>

                <div class="flex gap-2">
                    <button v-if="authStore.hasPermission('users.create')"
                        class="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 btn-common"
                        @click="handleCreate">
                        {{ manageUserStore.loading ? 'Đang tải...' : 'Tạo người dùng' }}
                    </button>

                    <button
                        class="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 btn-common"
                        @click="handleSearch">
                        {{ manageUserStore.loading ? 'Đang tải...' : 'Tìm kiếm' }}
                    </button>
                </div>
            </div>

            <div class="overflow-hidden rounded-xl border border-[#1E293B]">
                <div
                    class="grid grid-cols-[60px_1fr_2fr_1fr_1fr_1fr_1fr_1fr] items-center px-6 py-5 border-b border-[#1E293B] hover:bg-[#111827]">
                    <div>STT</div>
                    <div class="text-center">Tên tài khoản</div>
                    <div class="text-center">NGƯỜI DÙNG</div>
                    <div class="text-center">GÓI TÀI KHOẢN</div>
                    <div class="text-center">SỐ PHIÊN</div>
                    <div class="text-center">TRẠNG THÁI</div>
                    <div class="text-center">LOẠI TÀI KHOẢN</div>
                    <div class="text-center">THAO TÁC</div>
                </div>

                <div v-if="manageUserStore.loading" class="px-6 py-8 text-center text-gray-400">
                    Đang tải dữ liệu...
                </div>

                <div v-else-if="!manageUserStore.hasUsers" class="px-6 py-8 text-center text-gray-400">
                    Không có dữ liệu người dùng.
                </div>

                <template v-else>
                    <div v-for="(user, index) in users" :key="user.id"
                        class="grid grid-cols-[60px_1fr_2fr_1fr_1fr_1fr_1fr_1fr] items-center px-6 py-5 border-b border-[#1E293B] hover:bg-[#111827]">
                        <div>{{ (pagination.page - 1) * pagination.limit + index + 1 }}</div>
                        <div class="text-center">{{ user.username }}</div>
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="min-w-0">
                                <div class="font-semibold truncate">{{ user.name }}</div>
                                <div class="text-sm text-gray-400 truncate">{{ user.email }}</div>
                            </div>
                        </div>

                        <div class="text-center">
                            <span class="px-3 py-1 rounded-md text-sm font-medium border" :class="planClass(user.plan)">
                                {{ user.plan }}
                            </span>
                        </div>

                        <div class="font-semibold text-center">{{ user.interview_count }}</div>

                        <div class="flex items-center gap-2 justify-center">
                            <span class="w-2 h-2 rounded-full"
                                :class="user.status === 'active' ? 'bg-indigo-400' : 'bg-red-400'"></span>

                            <select v-if="authStore.hasPermission('users.deactivate')" :value="user.status"
                                @change="onStatusChange(user, $event)"
                                class="bg-transparent text-sm text-gray-300 border border-transparent focus:border-[#1E293B] px-2 py-1 rounded">
                                <option value="active">Hoạt động</option>
                                <option value="locked">Đã khóa</option>
                            </select>

                            <span v-else class="text-sm text-gray-400">
                                {{ user.status === 'active' ? 'Hoạt động' : 'Đã khóa' }}
                            </span>
                        </div>

                        <div class="text-center">
                            <span class="text-gray-400">{{ user.auth_provider === 'google' ? 'Google' : 'Thường'
                            }}</span>
                        </div>

                        <div class="flex justify-center gap-3 text-lg">
                            <button title="Xem chi tiết" @click="openViewDialog(user.id)" class="hover:text-indigo-400">
                                <el-icon>
                                    <View />
                                </el-icon>
                            </button>

                            <button v-if="authStore.hasPermission('users.update')" title="Chỉnh sửa"
                                @click="openEditDialog(user.id)" class="hover:text-cyan-400">
                                <el-icon>
                                    <Edit />
                                </el-icon>
                            </button>

                            <button v-if="authStore.hasPermission('users.delete')" title="Xóa"
                                @click="onDeleteUser(user)" class="hover:text-red-400">
                                <el-icon color="#FF6E84">
                                    <Delete />
                                </el-icon>
                            </button>
                        </div>
                    </div>
                </template>
            </div>

            <div class="flex justify-between items-center mt-4 text-gray-400">
                <div>
                    TRANG {{ pagination.page }} / {{ pagination.totalPages }}
                    <span class="ml-3 text-xs">(Tổng {{ pagination.total }} tài khoản)</span>
                </div>
                <div class="flex gap-2">
                    <button class="w-10 h-10 rounded-lg border border-[#1E293B] disabled:opacity-50"
                        :disabled="pagination.page <= 1 || manageUserStore.loading" @click="changePage(-1)">‹</button>
                    <button class="w-10 h-10 rounded-lg border border-[#1E293B] disabled:opacity-50"
                        :disabled="pagination.page >= pagination.totalPages || manageUserStore.loading"
                        @click="changePage(1)">›</button>
                </div>
            </div>
        </div>

        <el-dialog v-model="showViewDialog" title="Chi tiết người dùng" width="520px">
            <div v-if="manageUserStore.detailLoading" class="text-center text-gray-500 py-5">Đang tải...</div>
            <div v-else-if="selectedUser" class="space-y-3">
                <div><b>ID:</b> {{ selectedUser.id }}</div>
                <div><b>Họ tên:</b> {{ selectedUser.name }}</div>
                <div><b>Username:</b> {{ selectedUser.username || '-' }}</div>
                <div><b>Email:</b> {{ selectedUser.email }}</div>
                <div><b>Gói:</b> {{ selectedUser.plan }}</div>
                <div><b>Số phiên:</b> {{ selectedUser.sessions }}</div>
                <div><b>Loại tài khoản:</b> {{ selectedUser.auth_provider }}</div>
                <div><b>Trạng thái:</b> {{ selectedUser.status === 'active' ? 'Hoạt động' : 'Đã khóa' }}</div>
                <div><b>Đã xác thực:</b> {{ selectedUser.is_verified ? 'Có' : 'Chưa' }}</div>
                <div><b>Superuser:</b> {{ selectedUser.is_superuser ? 'Có' : 'Không' }}</div>
                <div><b>Avatar URL:</b> {{ selectedUser.avatar_url || '-' }}</div>
                <div><b>Google ID:</b> {{ selectedUser.google_id || '-' }}</div>
            </div>
        </el-dialog>

        <el-dialog v-model="showCreateDialog" title="Tạo người dùng" width="520px">
            <el-form label-position="top" :model="editForm">
                <el-form-item label="Họ tên">
                    <el-input v-model="createForm.full_name" />
                </el-form-item>
                <el-form-item label="Tài khoản">
                    <el-input v-model="createForm.username" />
                </el-form-item>
                <el-form-item label="Email">
                    <el-input v-model="createForm.email" />
                </el-form-item>

                <el-form-item label="Mật khẩu">
                    <el-input v-model="createForm.password" :type="showPasswordCreate ? 'text' : 'password'">
                        <template #suffix>
                            <el-button link @click="showPasswordCreate = !showPasswordCreate"
                                :icon="showPasswordCreate ? View : Hide" />
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item label="Trạng thái">
                    <el-select v-model="createForm.status" class="w-full">
                        <el-option label="Hoạt động" value="active" />
                        <el-option label="Đã khóa" value="locked" />
                    </el-select>
                </el-form-item>

                <el-form-item label="Chọn vai trò">
                    <el-select v-model="createForm.roles" multiple class="w-full" placeholder="Chọn vai trò">
                        <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <el-button @click="showCreateDialog = false">Hủy</el-button>
                    <el-button type="primary" :loading="manageUserStore.submitting" @click="onSubmitCreate">
                        Tạo người dùng
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog v-model="showEditDialog" title="Cập nhật người dùng" width="520px">
            <el-form label-position="top" :model="editForm">
                <el-form-item label="Họ tên">
                    <el-input v-model="editForm.full_name" />
                </el-form-item>
                <el-form-item label="Tài khoản">
                    <el-input v-model="editForm.username" />
                </el-form-item>
                <el-form-item label="Email">
                    <el-input v-model="editForm.email" />
                </el-form-item>

                <el-form-item label="Mật khẩu" v-if="editForm.auth_provider === 'password'">
                    <el-input v-model="editForm.password" :type="showPasswordEdit ? 'text' : 'password'">
                        <template #suffix>
                            <el-button link @click="showPasswordEdit = !showPasswordEdit"
                                :icon="showPasswordEdit ? View : Hide" />
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item v-if="authStore.hasPermission('users.deactivate')" label="Trạng thái">
                    <el-select v-model="editForm.status" class="w-full">
                        <el-option label="Hoạt động" value="active" />
                        <el-option label="Đã khóa" value="locked" />
                    </el-select>
                </el-form-item>

                <el-form-item label="Chọn vai trò">
                    <el-select v-model="editForm.roles" multiple class="w-full" placeholder="Chọn vai trò">
                        <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
                    </el-select>
                </el-form-item>

                <el-form-item v-if="authStore.hasPermission('users.delete')" label="Đã xóa mềm (is_deleted)">
                    <el-switch v-model="editForm.is_deleted" />
                </el-form-item>
                <el-form-item label="Đã xác thực (is_verified)">
                    <el-switch v-model="editForm.is_verified" />
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <el-button @click="showEditDialog = false">Hủy</el-button>
                    <el-button type="primary" :loading="manageUserStore.submitting" @click="onSubmitEdit">
                        Lưu thay đổi
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </LayoutDefaultAdmin>
</template>

<script setup>
import LayoutDefaultAdmin from '../layouts/LayoutDefaultAdmin.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import { View, Edit, Delete, Hide } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { useManageUserStore } from '@/stores/admin/manageUser'
import { useAuthStore } from '@/stores/auth'
import { useManagePermissionStore } from '../../../stores/admin/managePermission'

const manageUserStore = useManageUserStore()
const managePermissionStore = useManagePermissionStore()
const authStore = useAuthStore()

const users = computed(() => manageUserStore.users)
const pagination = computed(() => manageUserStore.pagination)
const selectedUser = computed(() => manageUserStore.selectedUser)

const roles = computed(() => managePermissionStore.roles)

const showViewDialog = ref(false)
const showCreateDialog = ref(false)
const showPasswordCreate = ref(false)
const showEditDialog = ref(false)

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,50}$/
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,100}$/

const currentEditUserId = ref(null)

const createForm = reactive({
    full_name: '',
    username: '',
    email: '',
    status: 'active',
    roles: [],
    password: '',
    is_deleted: false,
    is_verified: false,
})

const resetFormCreate = () => {
    createForm.full_name = ''
    createForm.username = ''
    createForm.email = ''
    createForm.status = 'active'
    createForm.roles = []
    createForm.password = ''
    createForm.is_deleted = false
    createForm.is_verified = false
}

const editForm = reactive({
    full_name: '',
    username: '',
    email: '',
    status: '',
    password: '',
    roles: [],
    is_deleted: false,
    is_verified: false,
})

const filters = reactive({
    username: '',
    email: '',
    auth: '',
    is_active: '',
    status: '',
})

const planClass = (plan) => {
    switch (plan) {
        case 'ENTERPRISE':
            return 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
        case 'PRO':
            return 'border-purple-500 text-purple-400 bg-purple-500/10'
        case 'FREE':
        default:
            return 'border-gray-500 text-gray-400 bg-gray-500/10'
    }
}

async function loadUsers(page = 1) {
    try {
        console.log('Loading users with filters:', { ...filters, page })
        await manageUserStore.fetchUsers({
            ...filters,
            page,
        })
    } catch (error) {
        ElMessage.error(error?.message || 'Không thể tải danh sách người dùng.')
    }
}

async function handleSearch() {
    await loadUsers(1)
}

const handleCreate = () => {
    showCreateDialog.value = true
    fetchRoles();
}

async function changePage(step) {
    const nextPage = pagination.value.page + step
    if (nextPage < 1 || nextPage > pagination.value.totalPages) return
    await loadUsers(nextPage)
}

async function openViewDialog(userId) {
    try {
        await manageUserStore.getUserDetail(userId)
        showViewDialog.value = true
    } catch (error) {
        ElMessage.error(error?.message || 'Không thể tải chi tiết người dùng.')
    }
}

async function openEditDialog(userId) {
    try {
        await managePermissionStore.fetchRoles()
        const roles = await manageUserStore.getRoleUser(userId)
        const user = await manageUserStore.getUserDetail(userId)
        currentEditUserId.value = user.id
        editForm.full_name = user.name
        editForm.username = user.username || ''
        editForm.email = user.email
        editForm.status = user.status
        editForm.is_deleted = !!user.is_deleted
        editForm.is_verified = !!user.is_verified
        editForm.auth_provider = user.auth_provider
        editForm.roles = roles.items.map(role => role.id)
        showEditDialog.value = true
    } catch (error) {
        ElMessage.error(error?.message || 'Không thể tải người dùng để chỉnh sửa.')
    }
}

async function fetchRoles() {
    try {
        await managePermissionStore.fetchRoles()
    } catch (error) {
        ElMessage.error(error?.message || 'Không thể tải danh sách vai trò.')
    }
}

async function onSubmitCreate() {
    if (!createForm.full_name.trim()) return alert('Nhập họ tên')
    if (!createForm.username.trim()) return alert('Nhập username')
    if (!USERNAME_REGEX.test(createForm.username.trim())) {
        return alert('Username không hợp lệ. Chỉ dùng a-zA-Z0-9_- và dài 3-50 ký tự.')
    }
    if (!createForm.email.trim()) return alert('Nhập email')
    if (!createForm.password) return alert('Nhập mật khẩu')
    if (!PASSWORD_REGEX.test(createForm.password)) {
        return alert('Mật khẩu phải dài 8-100 ký tự, có ít nhất 1 chữ in hoa và 1 số.')
    }

    try {
        const newUser = await manageUserStore.createUser({  // ← nhận user trả về
            full_name: createForm.full_name.trim(),
            username: createForm.username.trim(),
            email: createForm.email.trim(),
            password: createForm.password.trim(),
            is_active: createForm.status === 'active',
            is_deleted: createForm.is_deleted,
            is_superuser: createForm.is_superuser,
            is_verified: createForm.is_verified,
        })

        await manageUserStore.assignRoleToUser(newUser.id, createForm.roles)
        showCreateDialog.value = false
        resetFormCreate()
        ElNotification({
            title: 'Thông báo',
            message: `Tài khoản ${newUser.username} đã được tạo thành công.`,
            type: 'success',
        })
        await loadUsers(pagination.value.page)
    } catch (error) {
        ElMessage.error(error?.message || 'Tạo người dùng thất bại.')
    }
}

async function onSubmitEdit() {
    if (!currentEditUserId.value) return

    if (!editForm.full_name.trim()) return alert('Nhập họ tên')
    if (!editForm.username.trim()) return alert('Nhập username')
    if (!USERNAME_REGEX.test(editForm.username.trim())) {
        return alert('Username không hợp lệ. Chỉ dùng a-zA-Z0-9_- và dài 3-50 ký tự.')
    }
    if (!editForm.email.trim()) return alert('Nhập email')
    if (editForm.password && !PASSWORD_REGEX.test(editForm.password)) {
        return alert('Mật khẩu phải dài 8-100 ký tự, có ít nhất 1 chữ in hoa và 1 số.')
    }

    try {
        const payload = {
            full_name: editForm.full_name.trim(),
            username: editForm.username.trim(),
            email: editForm.email.trim(),
            is_active: editForm.status === 'active',
            is_deleted: editForm.is_deleted,
            is_superuser: editForm.is_superuser,
            is_verified: editForm.is_verified,
        }

        if (editForm.password) {
            payload.password = editForm.password.trim()
        }

        await manageUserStore.updateUser(currentEditUserId.value, payload)

        await manageUserStore.assignRoleToUser(currentEditUserId.value, editForm.roles)

        showEditDialog.value = false
        ElNotification({
            title: 'Thông báo',
            message: `Tài khoản ${editForm.username} đã được cập nhật thành công.`,
            type: 'success',
        })
        await loadUsers(pagination.value.page)
    } catch (error) {
        ElMessage.error(error?.message || 'Cập nhật người dùng thất bại.')
    }
}

async function onDeleteUser(user) {
    try {
        await ElMessageBox.confirm(
            `Bạn có chắc muốn xóa mềm tài khoản "${user.name}" không?`,
            'Xác nhận xóa',
            {
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy',
                type: 'warning',
            },
        )

        await manageUserStore.softDeleteUser(user.id)
        ElNotification({
            title: 'Thông báo',
            message: `Đã xóa mềm tài khoản ${user.name}.`,
            type: 'success',
        })

        if (!manageUserStore.users.length && pagination.value.page > 1) {
            await loadUsers(pagination.value.page - 1)
            return
        }

        await loadUsers(pagination.value.page)
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error?.message || 'Xóa tài khoản thất bại.')
        }
    }
}

async function onStatusChange(user, event) {
    const previousStatus = user.status
    const nextStatus = event.target.value

    if (nextStatus === previousStatus) return

    try {
        if (nextStatus === 'locked') {
            const response = await manageUserStore.deactivateUser(user.id)
            ElNotification({
                title: 'Thông báo',
                message: `Tài khoản ${response.username} đã bị vô hiệu hóa.`,
                type: 'success',
            })
        } else {
            const response = await manageUserStore.updateUser(user.id, { is_active: true })
            ElNotification({
                title: 'Thông báo',
                message: `Tài khoản ${response.username} đã được kích hoạt.`,
                type: 'success',
            })
        }

        await loadUsers(pagination.value.page)
    } catch (error) {
        event.target.value = previousStatus
        ElMessage.error(error?.message || 'Cập nhật trạng thái thất bại.')
    }
}

onMounted(() => {
    loadUsers(1)
})
</script>

<style scoped></style>
