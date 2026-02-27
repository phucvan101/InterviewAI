<template>
  <div class="mx-auto max-w-4xl px-6 py-10 lg:px-8">
    <div class="mb-8">
      <span class="badge-purple mb-3">Giới thiệu</span>
      <h1 class="heading-gradient text-3xl font-black sm:text-4xl">Về template này</h1>
    </div>

    <!-- FAQ with Headless UI Disclosure -->
    <div class="mb-10 space-y-3">
      <h2 class="mb-5 text-xl font-bold text-white">FAQ</h2>
      <Disclosure v-for="faq in faqs" :key="faq.q" v-slot="{ open }" as="div"
        class="card-glass overflow-hidden rounded-2xl">
        <DisclosureButton class="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-white transition-colors hover:bg-white/5">
          <span>{{ faq.q }}</span>
          <svg :class="['h-5 w-5 transition-transform', open && 'rotate-180']" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: var(--text-muted);">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
          </svg>
        </DisclosureButton>
        <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
          <DisclosurePanel class="border-t px-6 py-4 text-sm leading-relaxed" style="border-color: var(--border); color: var(--text-muted);">
            {{ faq.a }}
          </DisclosurePanel>
        </transition>
      </Disclosure>
    </div>

    <!-- Headless UI Dialog -->
    <div class="card-glass rounded-2xl p-6">
      <h2 class="mb-2 font-semibold text-white">Headless UI Dialog</h2>
      <p class="mb-4 text-sm" style="color: var(--text-muted);">Modal accessible với animation mượt mà</p>
      <button class="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all" style="background: var(--primary);" @click="isModalOpen = true">
        Mở Modal
      </button>
    </div>

    <!-- Modal -->
    <TransitionRoot :show="isModalOpen" as="template">
      <Dialog @close="isModalOpen = false" class="relative z-50">
        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95 translate-y-4" enter-to="opacity-100 scale-100 translate-y-0" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="card-glass w-full max-w-md rounded-2xl p-8">
              <DialogTitle class="mb-2 text-lg font-bold text-white">🎉 Headless UI Dialog</DialogTitle>
              <p class="mb-6 text-sm leading-relaxed" style="color: var(--text-muted);">
                Fully accessible dialog với ARIA, keyboard navigation và focus trap. Đóng bằng Escape hoặc click backdrop.
              </p>
              <div class="flex justify-end gap-3">
                <button class="btn-outline rounded-xl px-4 py-2 text-sm" @click="isModalOpen = false">Đóng</button>
                <button class="rounded-xl px-5 py-2 text-sm font-semibold text-white" style="background: var(--primary);" @click="isModalOpen = false">Xác nhận</button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Disclosure, DisclosureButton, DisclosurePanel, Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
const isModalOpen = ref(false)
const faqs = [
  { q: 'Template này dùng được ngay không?', a: 'Có! Chạy npm install → npm run dev là xong. Tất cả đã được cấu hình sẵn.' },
  { q: 'WebRTC cần Signaling Server không?', a: 'Có. Cần server để trao đổi SDP và ICE. Gợi ý: Socket.io, Supabase Realtime, hoặc Firebase RTDB.' },
  { q: 'Web Speech API có hỗ trợ tiếng Việt không?', a: 'Có, trên Chrome và Edge. Composable đã set lang mặc định là vi-VN và xử lý fallback tự động.' },
  { q: 'Làm sao thêm route mới?', a: 'Thêm vào src/router/index.js và tạo file view trong src/views/. Vue Router 4 với lazy-loading đã được cấu hình sẵn.' },
]
</script>
