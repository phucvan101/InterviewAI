<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from "vue-router"

// App.vue
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  if (auth.isLoggedIn) {
    await auth.fetchProfile()
  }
})
</script>