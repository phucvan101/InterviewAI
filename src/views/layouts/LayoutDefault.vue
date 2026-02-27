<template>
    <div class="min-h-screen" style="background-color: var(--bg);">
        <AppNavbar />

        <main>
            <RouterView />
        </main>

        <AppFooter />
    </div>
</template>

<script setup>
import AppNavbar from "@/components/layout/AppNavbar.vue"
import AppFooter from "@/components/layout/AppFooter.vue"
</script>