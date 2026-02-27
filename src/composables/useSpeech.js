/**
 * useSpeech - Composable for Web Speech API
 *
 * Includes:
 *  - SpeechRecognition (speech-to-text)
 *  - SpeechSynthesis  (text-to-speech)
 */

import { ref, computed, onUnmounted } from 'vue'

// ─── Speech Recognition (STT) ─────────────────────────────────────────────────

export function useSpeechRecognition(options = {}) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition

  const isSupported = !!SpeechRecognition

  const transcript    = ref('')
  const interimText   = ref('')
  const isListening   = ref(false)
  const error         = ref(null)
  const results       = ref([])

  let recognition = null

  if (isSupported) {
    recognition = new SpeechRecognition()
    recognition.continuous    = options.continuous    ?? true
    recognition.interimResults = options.interimResults ?? true
    recognition.lang          = options.lang          ?? 'vi-VN'
    recognition.maxAlternatives = options.maxAlternatives ?? 1

    recognition.onstart = () => {
      isListening.value = true
      error.value = null
    }

    recognition.onend = () => {
      isListening.value = false
      interimText.value = ''
    }

    recognition.onerror = (e) => {
      error.value = e.error
      isListening.value = false
    }

    recognition.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]
        if (result.isFinal) {
          transcript.value += result[0].transcript
          results.value.push({
            text: result[0].transcript,
            confidence: result[0].confidence,
            timestamp: Date.now(),
          })
        } else {
          interim += result[0].transcript
        }
      }
      interimText.value = interim
    }
  }

  function start() {
    if (!isSupported || isListening.value) return
    transcript.value  = ''
    interimText.value = ''
    error.value = null
    recognition.start()
  }

  function stop() {
    if (!isSupported || !isListening.value) return
    recognition.stop()
  }

  function toggle() {
    isListening.value ? stop() : start()
  }

  function clear() {
    transcript.value = ''
    interimText.value = ''
    results.value = []
  }

  onUnmounted(stop)

  return {
    isSupported, transcript, interimText,
    isListening, error, results,
    start, stop, toggle, clear,
  }
}

// ─── Speech Synthesis (TTS) ───────────────────────────────────────────────────

export function useSpeechSynthesis() {
  const isSupported = 'speechSynthesis' in window

  const isSpeaking  = ref(false)
  const isPaused    = ref(false)
  const voices      = ref([])
  const error       = ref(null)

  if (isSupported) {
    const loadVoices = () => {
      voices.value = window.speechSynthesis.getVoices()
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }

  const vietnameseVoices = computed(() =>
    voices.value.filter(v => v.lang.startsWith('vi'))
  )

  function speak(text, options = {}) {
    if (!isSupported || !text) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang   = options.lang   ?? 'vi-VN'
    utterance.rate   = options.rate   ?? 1
    utterance.pitch  = options.pitch  ?? 1
    utterance.volume = options.volume ?? 1

    if (options.voice) utterance.voice = options.voice
    else if (vietnameseVoices.value.length) {
      utterance.voice = vietnameseVoices.value[0]
    }

    utterance.onstart = () => { isSpeaking.value = true }
    utterance.onend   = () => { isSpeaking.value = false; isPaused.value = false }
    utterance.onerror = (e) => { error.value = e.error; isSpeaking.value = false }

    window.speechSynthesis.speak(utterance)
    return utterance
  }

  function pause()  { window.speechSynthesis.pause();  isPaused.value = true }
  function resume() { window.speechSynthesis.resume(); isPaused.value = false }
  function cancel() { window.speechSynthesis.cancel(); isSpeaking.value = false }

  onUnmounted(cancel)

  return {
    isSupported, isSpeaking, isPaused,
    voices, vietnameseVoices, error,
    speak, pause, resume, cancel,
  }
}
