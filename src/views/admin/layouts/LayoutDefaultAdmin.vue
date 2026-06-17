<template>
    <div class="flex h-screen overflow-hidden select-none"
        style="background:#0b0e1a; font-family:'Be Vietnam Pro',system-ui,sans-serif;">

        <!-- SIDEBAR - cố định, không scroll -->
        <SideBar />

        <!-- MAIN CONTENT - chỉ vùng này scroll -->
        <main class="flex-1 overflow-y-auto h-full">
            <slot />
        </main>
    </div>
</template>

<script setup>
import SideBar from '@/components/admin/layout/SideBarAdmin.vue'
</script>