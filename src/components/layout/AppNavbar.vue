<template>
    <nav class="navbar sticky top-0 z-50">
        <div class="mx-auto px-6 lg:px-8">
            <div class="flex h-16 items-center justify-between">

                <!-- Logo -->
                <RouterLink to="/" class="flex items-center gap-2.5">
                    <img src="@/assets/icon/logoHeader.svg" alt="Logo" />
                    <span class="font-bold text-white text-lg">
                        AI Interview Prep
                    </span>
                </RouterLink>

                <!-- Desktop Nav -->
                <div class="hidden items-center gap-1 md:flex">
                    <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-link">
                        {{ link.label }}
                    </RouterLink>
                </div>

                <!-- Right -->
                <div class="flex items-center gap-3">
                    <RouterLink to="/login" class="nav-link hidden md:block">
                        Đăng nhập
                    </RouterLink>

                    <RouterLink to="/"
                        class="hidden md:inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-200"
                        style="background: var(--primary);">
                        Bắt đầu ngay
                    </RouterLink>

                    <button class="md:hidden p-2 rounded-lg" style="color: var(--text-muted);"
                        @click="mobileMenuOpen = !mobileMenuOpen">
                        ☰
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile -->
        <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="mobileMenuOpen" class="border-t px-4 py-3 md:hidden"
                style="background: var(--bg-alt); border-color: var(--border);">
                <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to"
                    class="block py-2 px-3 rounded-lg text-sm nav-link" @click="mobileMenuOpen = false">
                    {{ link.label }}
                </RouterLink>
            </div>
        </transition>
    </nav>
</template>

<script setup>
import { ref } from "vue"
import { RouterLink } from "vue-router"

const mobileMenuOpen = ref(false)

const navLinks = [
    { to: "/", label: "Cách hoạt động" },
    { to: "/webrtc", label: "Tính năng" },
    { to: "/speech", label: "Bảng giá" },
    { to: "/about", label: "Giới thiệu" },
]
</script>