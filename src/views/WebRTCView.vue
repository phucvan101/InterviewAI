<template>
  <div class="mx-auto max-w-7xl px-6 py-10 lg:px-8">
    <div class="mb-8">
      <span class="badge-purple mb-3">WebRTC</span>
      <h1 class="heading-gradient text-3xl font-black sm:text-4xl">Video Call Demo</h1>
      <p class="mt-2 text-sm" style="color: var(--text-muted);">Camera preview, screen sharing, mute/camera toggle</p>
    </div>

    <!-- Status bar -->
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <span :class="statusClass" class="badge text-xs px-3 py-1.5">
        ● {{ connectionState }}
      </span>
      <span v-if="error" class="badge-red badge text-xs">{{ error }}</span>
    </div>

    <!-- Video Grid -->
    <div class="mb-6 grid gap-4 lg:grid-cols-2">
      <div v-for="(vid, i) in videoSlots" :key="i"
        class="card-glass overflow-hidden rounded-2xl"
        style="border-color: rgba(255,255,255,0.08);">
        <div class="relative aspect-video bg-[#080c20]">
          <video :ref="vid.ref" autoplay playsinline :muted="vid.muted"
            class="h-full w-full object-cover transition-opacity"
            :class="{ 'opacity-0': !vid.stream.value }" />
          <div v-if="!vid.stream.value"
            class="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style="color: var(--text-subtle);">
            <span class="text-4xl">{{ vid.emptyIcon }}</span>
            <p class="text-xs">{{ vid.emptyLabel }}</p>
          </div>
          <div class="absolute bottom-3 left-3">
            <span class="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
              style="background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);">
              {{ vid.label }}
            </span>
          </div>
          <div v-if="vid.muted && isCameraOff"
            class="absolute inset-0 flex items-center justify-center"
            style="background: rgba(8,12,32,0.85);">
            <span class="text-4xl">🚫</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="card-glass rounded-2xl p-6">
      <h2 class="mb-4 font-semibold text-white">Controls</h2>
      <div class="flex flex-wrap gap-3">
        <button v-if="!localStream" class="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold" @click="startLocalStream()">
          📷 Bật Camera
        </button>
        <template v-if="localStream">
          <button class="btn-secondary rounded-xl px-4 py-2.5 text-sm" @click="toggleMute()">{{ isMuted ? '🔇 Unmute' : '🎙️ Mute' }}</button>
          <button class="btn-secondary rounded-xl px-4 py-2.5 text-sm" @click="toggleCamera()">{{ isCameraOff ? '📷 Bật' : '🚫 Tắt camera' }}</button>
          <button class="btn-outline rounded-xl px-4 py-2.5 text-sm" @click="startScreenShare()">🖥️ Screen Share</button>
          <button class="btn-danger rounded-xl px-4 py-2.5 text-sm" @click="cleanup()">⏹ Dừng</button>
        </template>
      </div>
    </div>

    <!-- SDP Panel -->
    <div v-if="localStream" class="mt-5 card-glass rounded-2xl p-6">
      <h2 class="mb-2 font-semibold text-white">SDP Exchange</h2>
      <p class="mb-4 text-xs" style="color: var(--text-muted);">Trong production, SDP trao đổi qua Signaling Server (WebSocket).</p>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="label">1. Tạo Offer</label>
          <button class="btn-primary mb-2 rounded-lg px-3 py-1.5 text-xs" @click="handleCreateOffer">Tạo Offer</button>
          <textarea v-if="localSdp" v-model="localSdp" readonly rows="4" class="input font-mono text-xs" />
        </div>
        <div>
          <label class="label">2. Paste Remote SDP</label>
          <textarea v-model="remoteSdpInput" rows="4" class="input font-mono text-xs" placeholder="Paste SDP..." />
          <button class="btn-secondary mt-2 rounded-lg px-3 py-1.5 text-xs" @click="handleSetRemote">Set Remote SDP</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useWebRTC } from '@/composables/useWebRTC'

const localVideoEl  = ref(null)
const remoteVideoEl = ref(null)
const localSdp      = ref('')
const remoteSdpInput = ref('')

const { localStream, remoteStream, isConnected, isMuted, isCameraOff, connectionState, error,
  startLocalStream, startScreenShare, toggleMute, toggleCamera, createOffer, setRemoteAnswer, cleanup } = useWebRTC()

watch(localStream,  s => { if (localVideoEl.value)  localVideoEl.value.srcObject  = s })
watch(remoteStream, s => { if (remoteVideoEl.value) remoteVideoEl.value.srcObject = s })

const videoSlots = [
  { ref: localVideoEl,  label: 'You (Local)', emptyIcon: '📷', emptyLabel: 'Camera chưa bật', muted: true,  stream: localStream },
  { ref: remoteVideoEl, label: 'Remote',       emptyIcon: '👤', emptyLabel: 'Chưa có kết nối', muted: false, stream: remoteStream },
]

const statusClass = computed(() => ({
  'badge-green':  isConnected.value,
  'badge-yellow': connectionState.value === 'connecting',
  'badge-red':    connectionState.value === 'failed',
  'badge-purple': !isConnected.value && connectionState.value !== 'failed',
}))

async function handleCreateOffer() {
  const offer = await createOffer(c => console.log('ICE:', c), () => {})
  localSdp.value = JSON.stringify(offer)
}
async function handleSetRemote() {
  if (!remoteSdpInput.value) return
  try { await setRemoteAnswer(JSON.parse(remoteSdpInput.value)) } catch(e) { console.error(e) }
}
</script>
