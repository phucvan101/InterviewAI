<script setup lang="ts">
import LayoutDefaultAdmin from '../layouts/LayoutDefaultAdmin.vue';
import { reactive, computed, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter, useRoute } from 'vue-router';
import { useManagePermissionStore } from "../../../stores/admin/managePermission";

const managePermissionStore = useManagePermissionStore();
const permission1 = computed(() => managePermissionStore.permissions)

const router = useRouter();
const route = useRoute();
const roleId = computed(() => {
    const id = route.params.id;
    return Array.isArray(id) ? id[0] : id;
});

const form = reactive({
    name: "",
    description: ""
});

const selectedPermissionCodes = ref<string[]>([]);

const permissionGroups = computed(() => {
    const grouped: Record<string, any> = {};

    permission1.value.forEach((item: any) => {
        const moduleName = item.module || "other";

        if (!grouped[moduleName]) {
            grouped[moduleName] = {
                title: moduleName.toUpperCase(),
                enable: true,
                permissions: [],
            };
        }

        grouped[moduleName].permissions.push({
            id: item.id,
            label: item.name,
            description: item.description,
            code: item.code,
        });
    });

    return grouped;
});

const totalPermission = computed(() => {
    return selectedPermissionCodes.value.length;
});

const isPermissionSelected = (code: string) => {
    return selectedPermissionCodes.value.includes(code);
}

const getModulePermissionCodes = (group: any) => {
    return group.permissions.map((item: any) => item.code);
}

const isModuleFullySelected = (group: any) => {
    const codes = getModulePermissionCodes(group);
    return codes.length > 0 && codes.every((code: string) => selectedPermissionCodes.value.includes(code));
}

const isModulePartiallySelected = (group: any) => {
    const codes = getModulePermissionCodes(group);
    const selectedCount = codes.filter((code: string) => selectedPermissionCodes.value.includes(code)).length;
    return selectedCount > 0 && selectedCount < codes.length;
}

const toggleModulePermissions = (group: any, checked: boolean) => {
    const codes = getModulePermissionCodes(group);

    if (checked) {
        selectedPermissionCodes.value = Array.from(new Set([
            ...selectedPermissionCodes.value,
            ...codes,
        ]));
        return;
    }

    selectedPermissionCodes.value = selectedPermissionCodes.value.filter(
        (permissionCode) => !codes.includes(permissionCode)
    );
}

const togglePermission = (code: string, checked: boolean) => {
    if (checked) {
        if (!selectedPermissionCodes.value.includes(code)) {
            selectedPermissionCodes.value.push(code);
        }
        return;
    }

    selectedPermissionCodes.value = selectedPermissionCodes.value.filter(
        (permissionCode) => permissionCode !== code
    );
}

const isValidName = (value) => {
    return /^[a-zA-Z0-9_-]+$/.test(value)
}

const fetchRoleDetail = async (roleId) => {
    try {
        const role = await managePermissionStore.fetchRoleDetail(roleId);

        form.name = role?.name ?? "";
        form.description = role?.description ?? "";
        selectedPermissionCodes.value = Array.isArray(role?.permissions)
            ? role.permissions
                .map((permission: any) => permission?.code)
                .filter(Boolean)
            : [];
    } catch (error) {
        ElMessage.error('Không thể tải chi tiết vai trò');
    }
};

const fetchPermissions = async () => {
    try {
        await managePermissionStore.fetchPermissions();
    } catch (error) {
        console.error("Failed to fetch permissions:", error);
    }
}

const resetForm = () => {
    form.name = "";
    form.description = "";
    selectedPermissionCodes.value = [];
};

const handleCancel = () => {
    ElMessageBox.confirm(
        'Bạn có chắc chắn hủy chỉnh sửa vai trò này?',
        'Cảnh báo',
        {
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy bỏ',
            type: 'warning',
            center: true,
        }
    )
        .then(() => {
            resetForm();
            router.push({ name: 'admin-role-configuration' });
        })


};

const handleUpdateRole = async () => {
    const name = form.name.trim();
    const description = form.description.trim();
    const permissionCodes = [...selectedPermissionCodes.value];

    if (!roleId.value) {
        ElMessage.error("Không tìm thấy vai trò cần cập nhật");
        return;
    }

    if (!name) {
        ElMessage.error("Vui lòng nhập tên vai trò");
        return;
    }

    if (!isValidName(name)) {
        ElMessage.error(
            'Tên chỉ được chứa chữ, số, dấu gạch dưới (_) và gạch ngang (-)'
        )
        return
    }

    if (!permissionCodes.length) {
        ElMessage.error("Vui lòng chọn ít nhất một quyền");
        return;
    }

    try {
        await managePermissionStore.updateRole(roleId.value, {
            name,
            description,
            permission_codes: permissionCodes,
        });

        ElMessage.success("Cập nhật vai trò thành công");
        router.push({ name: 'admin-role-configuration' });
    } catch (error: any) {
        ElMessage.error(error?.message || "Không thể cập nhật vai trò");
    }
}


onMounted(() => {
    fetchPermissions();
    if (roleId.value) {
        fetchRoleDetail(roleId.value);
    }
});
</script>

<template>
    <LayoutDefaultAdmin>
        <div class="p-6 w-full">
            <div class="flex justify-between items-end mb-5">
                <div style="color: #DFE4FE">
                    <div class="text-3xl font-bold mb-2">Chỉnh sửa vai trò</div>
                    <p>Thiết lập quyền hạn truy cập cho nhóm người dùng mới trong hệ thống. Đảm bảo tuân thủ các quy tắc
                        bảo mật dữ liệu của Neural Interface.</p>
                </div>
            </div>

            <div class="min-h-screen text-white">
                <div class="grid grid-cols-3 gap-6">

                    <!-- LEFT -->
                    <div class="col-span-2 space-y-6">

                        <!-- FORM -->
                        <div class="bg-[#111827] p-6 rounded-2xl">
                            <div>
                                <label class="text-sm text-gray-400">Tên vai trò</label>
                                <el-input class="mt-2" v-model="form.name" placeholder="Nhập tên vai trò..." />
                            </div>

                            <div class="mt-4">
                                <label class="text-sm text-gray-400">Mô tả vai trò</label>
                                <el-input class="mt-2" type="textarea" rows="3" v-model="form.description"
                                    placeholder="Mô tả mục đích và phạm vi của vai trò này..." />
                            </div>
                        </div>

                        <!-- PERMISSION -->
                        <div>
                            <h2 class="text-lg font-semibold mb-4">
                                Phân quyền chi tiết
                            </h2>

                            <div class="grid grid-cols-2 gap-4">

                                <div v-for="(group, key) in permissionGroups" :key="key"
                                    class="bg-[#111827] rounded-2xl p-5">

                                    <div class="module-header">
                                        <div>
                                            <p class="font-semibold">
                                                {{ group.title }}
                                            </p>

                                            <span class="text-xs text-gray-400">
                                                MODULE
                                            </span>
                                        </div>

                                        <el-checkbox :model-value="isModuleFullySelected(group)"
                                            :indeterminate="isModulePartiallySelected(group)" class="module-checkbox"
                                            @change="(checked: boolean) => toggleModulePermissions(group, checked)">
                                            Tất cả
                                        </el-checkbox>
                                    </div>

                                    <div class="space-y-4">
                                        <div v-for="item in group.permissions" :key="item.code" class="permission-item">
                                            <el-checkbox :model-value="isPermissionSelected(item.code)"
                                                class="permission-checkbox"
                                                @change="(checked: boolean) => togglePermission(item.code, checked)" />

                                            <div class="permission-content">
                                                <div class="permission-title">
                                                    {{ item.label }}
                                                </div>

                                                <div class="permission-description">
                                                    {{ item.description }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>

                    </div>

                    <!-- RIGHT -->
                    <div class="bg-[#111827] p-6 rounded-2xl h-fit">
                        <h3 class="mb-4 font-semibold">Thao tác</h3>

                        <div class="d-flex gap-3">
                            <el-button color="#4f46e5"
                                class="rounded-md w-2/5 text-sm font-bold text-white transition-all duration-200 btn-common"
                                :loading="managePermissionStore.submitting" :disabled="managePermissionStore.submitting"
                                @click="handleUpdateRole">
                                Cập nhật
                            </el-button>

                            <el-button color="#dcdfe6" class="rounded-md text-sm w-2/5" @click="handleCancel">
                                Hủy
                            </el-button>
                        </div>

                        <div class="mt-4 text-sm text-gray-400">
                            <p class="font-semibold text-white mb-2">Tóm tắt quyền hạn</p>
                            <p>Tổng số quyền chọn: {{ totalPermission }}</p>

                            <div class="mt-2 p-3 bg-[#0F172A] rounded-lg text-xs">
                                Vai trò này sẽ có hiệu lực ngay lập tức sau khi lưu.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </LayoutDefaultAdmin>
</template>

<style scoped>
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
    background: #020617 !important;
    border: none;
    color: white;
}

.permission-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.module-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
}

.module-checkbox {
    flex-shrink: 0;
    margin-top: 2px;
}

.permission-checkbox {
    margin-top: 3px;
    flex-shrink: 0;
}

.permission-content {
    flex: 1;
    min-width: 0;
}

.permission-title {
    font-size: 16px;
    font-weight: 700;
    color: white;
    line-height: 1.4;
    margin-bottom: 4px;
}

.permission-description {
    font-size: 14px;
    color: #9CA3AF;
    line-height: 1.5;
    word-break: break-word;
}
</style>

<style></style>
