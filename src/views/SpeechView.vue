<template>
  <div class="mx-auto max-w-4xl px-6 py-10 lg:px-8">
    <div class="mb-8">
      <span class="badge-purple mb-3">Speech API</span>
      <h1 class="heading-gradient text-3xl font-black sm:text-4xl">Web Speech API Demo</h1>
      <p class="mt-2 text-sm" style="color: var(--text-muted);">Speech-to-Text (STT) và Text-to-Speech (TTS)</p>
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <!-- STT -->
      <div class="card-glass rounded-2xl p-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-semibold text-white">🎙️ Speech → Text</h2>
          <span v-if="!sttSupported" class="badge-red badge text-xs">Không hỗ trợ</span>
          <span v-else-if="isListening" class="badge-green badge animate-pulse text-xs">● Đang nghe...</span>
          <span v-else class="badge-purple badge text-xs">Sẵn sàng</span>
        </div>
        <div class="mb-4">
          <label class="label">Ngôn ngữ</label>
          <select v-model="sttLang" class="input">
            <option value="vi-VN">🇻🇳 Tiếng Việt</option>
            <option value="en-US">🇺🇸 English (US)</option>
            <option value="en-GB">🇬🇧 English (UK)</option>
            <option value="ja-JP">🇯🇵 日本語</option>
          </select>
        </div>
        <div class="mb-4 min-h-[100px] rounded-xl p-3 text-sm" style="background: var(--surface-2); border: 1px solid var(--border);">
          <span class="text-white">{{ sttTranscript }}</span>
          <span class="italic" style="color: var(--text-subtle);">{{ sttInterim }}</span>
          <span v-if="!sttTranscript && !sttInterim" style="color: var(--text-subtle);">Nhấn "Bắt đầu" rồi nói...</span>
        </div>
        <div v-if="sttResults.length" class="mb-4 max-h-28 overflow-y-auto space-y-1">
          <div v-for="(r,i) in sttResults" :key="i"
            class="flex justify-between rounded-lg px-3 py-1.5 text-xs"
            style="background: var(--surface-2); color: var(--text-muted);">
            <span>{{ r.text }}</span>
            <span>{{ Math.round(r.confidence*100) }}%</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all" style="background: var(--primary);" :disabled="!sttSupported" @click="sttToggle()">
            {{ isListening ? '⏹ Dừng' : '🎙️ Bắt đầu' }}
          </button>
          <button class="btn-outline rounded-xl px-4 text-sm" @click="sttClear()">Xóa</button>
        </div>
      </div>

      <!-- TTS -->
      <div class="card-glass rounded-2xl p-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-semibold text-white">🔊 Text → Speech</h2>
          <span v-if="!ttsSupported" class="badge-red badge text-xs">Không hỗ trợ</span>
          <span v-else-if="isSpeaking" class="badge-green badge animate-pulse text-xs">● Đang nói...</span>
          <span v-else class="badge-purple badge text-xs">Sẵn sàng</span>
        </div>
        <div class="mb-4">
          <label class="label">Văn bản cần đọc</label>
          <textarea v-model="ttsText" rows="4" class="input" placeholder="Nhập văn bản..." />
        </div>
        <div class="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label class="label">Tốc độ ({{ ttsRate }}x)</label>
            <input v-model.number="ttsRate" type="range" min="0.5" max="2" step="0.1" class="w-full accent-purple-500" />
          </div>
          <div>
            <label class="label">Cao độ ({{ ttsPitch }})</label>
            <input v-model.number="ttsPitch" type="range" min="0" max="2" step="0.1" class="w-full accent-purple-500" />
          </div>
        </div>
        <div v-if="ttsVoices.length" class="mb-4">
          <label class="label">Giọng đọc</label>
          <select v-model="selectedVoice" class="input">
            <option :value="null">Mặc định</option>
            <option v-for="v in ttsVoices" :key="v.name" :value="v">{{ v.name }} ({{ v.lang }})</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button class="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all" style="background: var(--primary);" :disabled="!ttsSupported || !ttsText" @click="handleSpeak">
            {{ isSpeaking ? '🔄 Đang nói...' : '▶ Đọc' }}
          </button>
          <button v-if="isSpeaking" class="btn-secondary rounded-xl px-4 text-sm" @click="isPaused ? ttsResume() : ttsPause()">{{ isPaused ? '▶' : '⏸' }}</button>
          <button v-if="isSpeaking" class="btn-danger rounded-xl px-4 text-sm" @click="ttsCancel()">⏹</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSpeechRecognition, useSpeechSynthesis } from '@/composables/useSpeech'

const sttLang = ref('vi-VN')
const { isSupported: sttSupported, transcript: sttTranscript, interimText: sttInterim,
  isListening, error: sttError, results: sttResults, stop: sttStop, toggle: sttToggle, clear: sttClear } =
  useSpeechRecognition({ lang: sttLang.value, continuous: true, interimResults: true })
watch(sttLang, () => sttStop())

const ttsText = ref('Xin chào! Đây là demo Web Speech API với Vue 3.')
const ttsRate = ref(1); const ttsPitch = ref(1); const selectedVoice = ref(null)
const { isSupported: ttsSupported, isSpeaking, isPaused, voices: ttsVoices,
  speak: ttsSpeak, pause: ttsPause, resume: ttsResume, cancel: ttsCancel } = useSpeechSynthesis()

function handleSpeak() {
  ttsSpeak(ttsText.value, { rate: ttsRate.value, pitch: ttsPitch.value, voice: selectedVoice.value })
}
</script>
