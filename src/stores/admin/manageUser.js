import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

function toNumber(value, fallback = 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeStatus(user = {}) {
    if (user.is_deleted === true) return 'locked'
    if (user.is_active === false) return 'locked'

    const rawStatus = String(user.status || user.account_status || '').toLowerCase()
    if (['inactive', 'deactivated', 'locked', 'suspended', 'disabled'].includes(rawStatus)) {
        return 'locked'
    }

    return 'active'
}

function normalizePlan(user = {}) {
    const rawPlan =
        user.plan ||
        user.package ||
        user.package_name ||
        user.subscription_plan ||
        user.tier ||
        'FREE'

    return String(rawPlan || 'FREE').toUpperCase()
}

function normalizeAuthProvider(user = {}) {
    return String(
        user.auth_provider ||
        user.provider ||
        user.auth_type ||
        user.authType ||
        'password',
    ).toLowerCase()
}

function normalizeUser(user = {}) {
    return {
        id: user.id ?? user.user_id ?? user._id,
        name: user.name ?? user.full_name ?? user.username ?? 'Chưa cập nhật',
        email: user.email ?? 'Không có email',
        plan: normalizePlan(user),
        sessions: toNumber(user.sessions ?? user.session_count ?? user.sessions_count, 0),
        auth_provider: normalizeAuthProvider(user),
        status: normalizeStatus(user),
        username: user.username ?? '',
        interview_count: user.interview_count ?? 0,
        is_active: user.is_active ?? true,
        is_deleted: user.is_deleted ?? false,
        is_superuser: user.is_superuser ?? false,
        is_verified: user.is_verified ?? false,
        created_at: user.created_at ?? null,
        updated_at: user.updated_at ?? null,
        avatar_url: user.avatar_url ?? '',
        google_id: user.google_id ?? '',
        raw: user,
    }
}

function normalizeCreatePayload(payload = {}) {
    return {
        username: payload.username,
        email: payload.email,
        password: payload.password,
        full_name: payload.full_name || payload.name || '',
        is_active: payload.is_active ?? true,
        is_verified: payload.is_verified ?? false,
        auth_provider: payload.auth_provider || 'password',
    }
}

// function normalizeUpdatePayload(payload = {}) {
//     const nextPayload = { ...payload }

//     if ('name' in nextPayload && !('full_name' in nextPayload)) {
//         nextPayload.full_name = nextPayload.name
//     }
//     delete nextPayload.name

//     if ('status' in nextPayload && !('is_active' in nextPayload)) {
//         nextPayload.is_active = nextPayload.status === 'active'
//     }
//     delete nextPayload.status

//     delete nextPayload.plan

//     // Chỉ gửi password nếu người dùng có nhập, ngược lại xóa khỏi payload
//     if (!nextPayload.password) {
//         delete nextPayload.password
//     }

//     return nextPayload
// }

function extractListPayload(responseData) {
    const data = responseData?.data ?? responseData ?? {}
    if (Array.isArray(data)) {
        return {
            items: data,
            meta: {},
        }
    }

    const items = data.items || data.users || data.results || data.rows || data.data || []

    return {
        items: Array.isArray(items) ? items : [],
        meta: data,
    }
}

function extractDetailPayload(responseData) {
    const data = responseData?.data ?? responseData ?? {}
    if (data.user && typeof data.user === 'object') return data.user
    return data
}

function parsePagination(meta = {}, fallback = {}) {
    const backendPage = toNumber(
        meta.page ?? meta.current_page ?? meta.pagination?.page,
        fallback.page || 1,
    )
    const page = Math.max(1, backendPage || 1)
    const limit =
        toNumber(meta.limit ?? meta.page_size ?? meta.pagination?.limit, fallback.limit || 10) || 10
    const total = toNumber(
        meta.total ??
        meta.total_items ??
        meta.count ??
        meta.pagination?.total ??
        meta.pagination?.count,
        fallback.total || 0,
    )
    const totalPages =
        toNumber(meta.total_pages ?? meta.pagination?.total_pages, 0) ||
        Math.max(1, Math.ceil(total / Math.max(limit, 1)))

    return { page, limit, total, totalPages }
}

function toQueryString(params = {}) {
    const query = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return
        query.append(key, String(value))
    })

    const queryString = query.toString()
    return queryString ? `?${queryString}` : ''
}

export const useManageUserStore = defineStore('manage-user', () => {
    const authStore = useAuthStore()

    const users = ref([])
    const selectedUser = ref(null)

    const loading = ref(false)
    const detailLoading = ref(false)
    const submitting = ref(false)
    const roleLoading = ref(false)
    const error = ref('')

    const pagination = ref({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    })

    const hasUsers = computed(() => users.value.length > 0)

    function upsertUserInList(nextUser) {
        if (!nextUser?.id) return
        const index = users.value.findIndex((user) => user.id === nextUser.id)
        if (index === -1) return
        users.value[index] = { ...users.value[index], ...nextUser }
    }

    async function fetchUsers(filters = {}) {
        loading.value = true
        error.value = ''

        try {
            const params = {
                page: filters.page ?? pagination.value.page,
                page_size: filters.limit ?? pagination.value.limit,
                username: filters.username || '',
                email: filters.email || '',
                is_active: filters.is_active,
                auth_provider: filters.auth || filters.auth_provider || undefined,
                status: filters.status || undefined,
            }

            console.log('Fetching users with params:', params)

            const response = await authStore.authorizedRequest(
                `/api/v1/admin/users/${toQueryString(params)}`,
            )

            const { items, meta } = extractListPayload(response)
            users.value = items.map(normalizeUser)
            pagination.value = parsePagination(meta, {
                page: params.page,
                limit: params.page_size,
                total: users.value.length,
            })

            return users.value
        } catch (err) {
            error.value = err?.message || 'Không thể tải danh sách người dùng.'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function getUserDetail(userId) {
        detailLoading.value = true
        error.value = ''

        try {
            const response = await authStore.authorizedRequest(`/api/v1/admin/users/${userId}`)
            const user = normalizeUser(extractDetailPayload(response))
            selectedUser.value = user
            upsertUserInList(user)
            return user
        } catch (err) {
            error.value = err?.message || 'Không thể tải chi tiết người dùng.'
            throw err
        } finally {
            detailLoading.value = false
        }
    }

    async function createUser(payload) {
        submitting.value = true
        error.value = ''

        try {
            const response = await authStore.authorizedRequest(
                `/api/v1/admin/users/`,
                {
                    method: 'POST',
                    body: normalizeCreatePayload(payload),
                }
            )

            const user = normalizeUser(extractDetailPayload(response))
            users.value.unshift(user)
            pagination.value.total += 1

            ElMessage({
                type: 'success',
                message: 'Tạo người dùng thành công',
            })

            return user
        } catch (err) {
            error.value = err?.message || 'Không thể tạo người dùng.'
            throw err
        } finally {
            submitting.value = false
        }
    }

    async function getRoleUser(userId) {
        roleLoading.value = true
        error.value = ''

        try {
            const response = await authStore.authorizedRequest(`/api/v1/admin/users/${userId}/roles`)
            const roles = extractListPayload(response)
            return roles
        } catch (err) {
            error.value = err?.message || 'Không thể tải vai trò người dùng.'
            throw err
        } finally {
            roleLoading.value = false
        }
    }

    async function updateUser(userId, payload) {
        submitting.value = true
        error.value = ''

        try {
            const response = await authStore.authorizedRequest(`/api/v1/admin/users/${userId}`, {
                method: 'PATCH',
                body: payload,
            })

            const user = normalizeUser(extractDetailPayload(response))
            selectedUser.value = user
            upsertUserInList(user)
            return user
        } catch (err) {
            error.value = err?.message || 'Không thể cập nhật người dùng.'
            throw err
        } finally {
            submitting.value = false
        }
    }

    async function deactivateUser(userId) {
        submitting.value = true
        error.value = ''

        try {
            const response = await authStore.authorizedRequest(`/api/v1/admin/users/${userId}/deactivate`, {
                method: 'PATCH',
            })

            const user = normalizeUser(extractDetailPayload(response))
            selectedUser.value = user
            upsertUserInList(user)
            return user
        } catch (err) {
            error.value = err?.message || 'Không thể vô hiệu hóa người dùng.'
            throw err
        } finally {
            submitting.value = false
        }
    }

    async function softDeleteUser(userId) {
        submitting.value = true
        error.value = ''

        try {
            await authStore.authorizedRequest(`/api/v1/admin/users/${userId}`, {
                method: 'DELETE',
            })

            users.value = users.value.filter((user) => user.id !== userId)
            pagination.value.total = Math.max(0, pagination.value.total - 1)
        } catch (err) {
            error.value = err?.message || 'Không thể xóa người dùng.'
            throw err
        } finally {
            submitting.value = false
        }
    }

    async function assignRoleToUser(userId, roleIds) {
        submitting.value = true
        error.value = ''

        try {
            await authStore.authorizedRequest(`/api/v1/admin/users/${userId}/roles`, {
                method: 'PATCH',
                body: { role_ids: roleIds },
            })

            // ElMessage({
            //     type: 'success',
            //     message: 'Gán vai trò cho người dùng thành công',
            // })
        } catch (err) {
            error.value = err?.message || 'Không thể gán vai trò cho người dùng.'
            throw err
        } finally {
            submitting.value = false
        }
    }

    return {
        users,
        selectedUser,
        loading,
        detailLoading,
        submitting,
        error,
        pagination,
        hasUsers,
        fetchUsers,
        getUserDetail,
        createUser,
        updateUser,
        deactivateUser,
        softDeleteUser,
        assignRoleToUser,
        getRoleUser,
    }
})