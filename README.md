# Vue 3 Template ⚡

Template khởi động nhanh với đầy đủ công nghệ hiện đại.

## 🛠 Tech Stack

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| Vue 3 | ^3.4 | Composition API, `<script setup>` |
| Vite | ^5.0 | Build tool nhanh với HMR |
| TailwindCSS | ^3.4 | Utility-first CSS + Dark mode |
| Headless UI | ^1.7 | Accessible UI components |
| Pinia | ^2.1 | State management |
| Vue Router | ^4.3 | SPA routing + lazy-load |
| WebRTC | Native | P2P video/audio/data |
| Web Speech API | Native | STT + TTS |

## 🚀 Bắt đầu nhanh

```bash
# Cài dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

## 📁 Cấu trúc thư mục

```
src/
├── assets/
│   └── main.css          # TailwindCSS + custom components
├── composables/
│   ├── useDarkMode.js    # Dark/light mode toggle
│   ├── useSpeech.js      # Web Speech API (STT + TTS)
│   └── useWebRTC.js      # WebRTC peer connection
├── router/
│   └── index.js          # Vue Router 4 + guards
├── stores/
│   ├── auth.js           # Auth store (Pinia)
│   └── counter.js        # Counter store (Pinia)
├── views/
│   ├── HomeView.vue      # Trang chủ + Pinia demo
│   ├── WebRTCView.vue    # WebRTC camera/screen demo
│   ├── SpeechView.vue    # Web Speech API demo
│   ├── AboutView.vue     # Headless UI examples
│   └── NotFoundView.vue  # 404 page
├── App.vue               # Root + Navbar + Router outlet
└── main.js               # App entry point
```

## 🌐 WebRTC

Composable `useWebRTC` hỗ trợ:
- Camera + Microphone access
- Screen sharing
- RTCPeerConnection (offer/answer)
- ICE candidate exchange
- Data channel
- Mute / Camera toggle

> ⚠️ Trong production cần Signaling Server để trao đổi SDP.
> Gợi ý: Socket.io, Supabase Realtime, Firebase RTDB, Ably.

## 🎙️ Web Speech API

Composable `useSpeech` gồm:
- `useSpeechRecognition` — Nói thành chữ (STT), hỗ trợ tiếng Việt
- `useSpeechSynthesis` — Đọc chữ thành tiếng (TTS)

## 🎨 TailwindCSS Utilities

Custom classes đã có trong `main.css`:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-outline`
- `.card`, `.card-body`
- `.input`, `.label`
- `.badge`, `.badge-green`, `.badge-red`, `.badge-blue`, `.badge-yellow`

## 📄 License

MIT
# InterviewAI
