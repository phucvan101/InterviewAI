<template>
  <div class="flex min-h-[65vh] flex-col items-center justify-center px-4 text-center">
    <div class="mb-3 text-8xl font-black" style="color: rgba(109,67,245,0.25);">404</div>
    <h1 class="heading-gradient mb-2 text-2xl font-bold">Không tìm thấy trang</h1>
    <p class="mb-8 text-sm" style="color: var(--text-muted);">Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.</p>
    <RouterLink to="/" class="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all" style="background: var(--primary);">
      ← Về trang chủ
    </RouterLink>
  </div>
</template>
<script setup>
import { RouterLink } from 'vue-router'
</script>
