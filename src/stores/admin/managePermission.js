import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { hi } from 'element-plus/es/locale/index.mjs'

const PERMISSIONS_ENDPOINT = '/api/v1/admin/roles/permissions'
const ROLE_ENDPOINT = '/api/v1/admin/roles/'

function normalizePermission(permission) {
    return {
        id: permission?.id ?? null,
        code: permission?.code ?? '',
        name: permission?.name ?? '',
        description: permission?.description ?? '',
        module: permission?.module ?? '',
    }
}

export const useManagePermissionStore = defineStore('manage-permission', () => {
    const authStore = useAuthStore()

    // state
    const permissions = ref([])
    const roles = ref([])
    const selectedPermission = ref(null)
    const historyUpdateRoles = ref([])

    const loading = ref(false)
    const detailLoading = ref(false)
    const submitting = ref(false)
    const error = ref('')

    const pagination = ref({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    })

    // computed
    const hasPermissions = computed(() => permissions.value.length > 0)

    // lấy danh sách permission
    async function fetchPermissions() {
        loading.value = true
        error.value = ''

        try {
            const response = await authStore.authorizedRequest(
                PERMISSIONS_ENDPOINT
            )

            const items = Array.isArray(response)
                ? response.map(normalizePermission)
                : []

            permissions.value = items

            return items
        } catch (err) {
            error.value =
                err?.message || 'Không thể tải danh sách quyền.'

            throw err
        } finally {
            loading.value = false
        }
    }

    // tạo role
    async function createRole(roleData) {
        submitting.value = true
        error.value = ''

        try {
            const response = await authStore.authorizedRequest(
                ROLE_ENDPOINT,
                {
                    method: 'POST',
                    body: roleData,
                }
            )

            return response
        } catch (err) {
            error.value =
                err?.message || 'Không thể tạo vai trò mới.'

            throw err
        } finally {
            submitting.value = false
        }
    }

    // danh sách role
    async function fetchRoles() {
        loading.value = true
        error.value = ''

        try {
            const response = await authStore.authorizedRequest(
                ROLE_ENDPOINT
            )

            roles.value = response.items

            return roles
        } catch (err) {
            error.value =
                err?.message || 'Không thể tạo vai trò mới.'

            throw err
        } finally {
            submitting.value = false
        }
    }

    async function fetchRoleDetail(roleId) {
        loading.value = true
        error.value = ''

        try {
            const response = await authStore.authorizedRequest(
                `${ROLE_ENDPOINT}${roleId}`
            )

            return response
        } catch (err) {
            error.value =
                err?.message || 'Không thể tải chi tiết vai trò.'

            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateRole(roleId, roleData) {
        submitting.value = true
        error.value = ''

        try {
            const response = await authStore.authorizedRequest(
                `${ROLE_ENDPOINT}${roleId}`,
                {
                    method: 'PATCH',
                    body: roleData,
                }
            )

            return response
        } catch (err) {
            error.value =
                err?.message || 'Không thể cập nhật vai trò.'

            throw err
        } finally {
            submitting.value = false
        }
    }

    async function deleteRole(roleId) {
        submitting.value = true
        error.value = ''

        try {
            const response = await authStore.authorizedRequest(
                `${ROLE_ENDPOINT}${roleId}`,
                {
                    method: 'DELETE',
                }
            )

            return response
        } catch (err) {
            error.value =
                err?.message || 'Không thể xóa vai trò.'

            throw err
        } finally {
            submitting.value = false
        }
    }

    async function historyUpdateRole(roleId) {
        try {
            const response = await authStore.authorizedRequest(
                `${ROLE_ENDPOINT}${roleId}/audit-logs`, {
                method: 'GET',
            })
            historyUpdateRoles.value = response.items
        } catch (err) {
            error.value =
                err?.message || 'Không thể tải lịch sử cập nhật vai trò.'

            throw err
        }
    }

    return {
        // state
        permissions,
        roles,
        selectedPermission,
        historyUpdateRoles,

        loading,
        detailLoading,
        submitting,
        error,

        pagination,

        // computed
        hasPermissions,

        // actions
        fetchPermissions,
        createRole,
        fetchRoles,
        fetchRoleDetail,
        updateRole,
        deleteRole,
        historyUpdateRole,
    }
})