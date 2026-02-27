/**
 * useWebRTC - Composable for WebRTC peer-to-peer video/audio
 *
 * Supports:
 *  - getUserMedia (camera + mic)
 *  - RTCPeerConnection (offer/answer flow)
 *  - ICE candidate exchange
 *  - Screen sharing
 *  - Mute / Camera toggle
 */

import { ref, shallowRef, onUnmounted } from 'vue'

const DEFAULT_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export function useWebRTC(iceServers = DEFAULT_ICE_SERVERS) {
  const localStream     = shallowRef(null)
  const remoteStream    = shallowRef(null)
  const peerConnection  = shallowRef(null)
  const isConnected     = ref(false)
  const isMuted         = ref(false)
  const isCameraOff     = ref(false)
  const connectionState = ref('new')
  const error           = ref(null)

  // ─── Media ────────────────────────────────────────────────────────────────

  async function startLocalStream(constraints = { video: true, audio: true }) {
    try {
      localStream.value = await navigator.mediaDevices.getUserMedia(constraints)
      return localStream.value
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const videoTrack = screenStream.getVideoTracks()[0]

      // Replace video track in peer connection
      if (peerConnection.value) {
        const sender = peerConnection.value
          .getSenders()
          .find(s => s.track?.kind === 'video')
        if (sender) await sender.replaceTrack(videoTrack)
      }

      // Replace in local stream
      if (localStream.value) {
        const oldTrack = localStream.value.getVideoTracks()[0]
        if (oldTrack) {
          localStream.value.removeTrack(oldTrack)
          oldTrack.stop()
        }
        localStream.value.addTrack(videoTrack)
      }

      videoTrack.onended = () => startLocalStream()
      return screenStream
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  function toggleMute() {
    if (!localStream.value) return
    localStream.value.getAudioTracks().forEach(t => {
      t.enabled = !t.enabled
    })
    isMuted.value = !isMuted.value
  }

  function toggleCamera() {
    if (!localStream.value) return
    localStream.value.getVideoTracks().forEach(t => {
      t.enabled = !t.enabled
    })
    isCameraOff.value = !isCameraOff.value
  }

  // ─── Peer Connection ───────────────────────────────────────────────────────

  function createPeerConnection(onIceCandidate, onRemoteTrack) {
    const pc = new RTCPeerConnection({ iceServers })

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) onIceCandidate?.(candidate)
    }

    pc.ontrack = ({ streams }) => {
      remoteStream.value = streams[0]
      onRemoteTrack?.(streams[0])
    }

    pc.onconnectionstatechange = () => {
      connectionState.value = pc.connectionState
      isConnected.value = pc.connectionState === 'connected'
    }

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        pc.restartIce()
      }
    }

    // Add local tracks
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => {
        pc.addTrack(track, localStream.value)
      })
    }

    peerConnection.value = pc
    return pc
  }

  async function createOffer(onIceCandidate, onRemoteTrack) {
    const pc = createPeerConnection(onIceCandidate, onRemoteTrack)
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    return offer
  }

  async function createAnswer(offer, onIceCandidate, onRemoteTrack) {
    const pc = createPeerConnection(onIceCandidate, onRemoteTrack)
    await pc.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    return answer
  }

  async function setRemoteAnswer(answer) {
    await peerConnection.value?.setRemoteDescription(new RTCSessionDescription(answer))
  }

  async function addIceCandidate(candidate) {
    await peerConnection.value?.addIceCandidate(new RTCIceCandidate(candidate))
  }

  // ─── Data Channel ─────────────────────────────────────────────────────────

  function createDataChannel(label = 'chat') {
    if (!peerConnection.value) throw new Error('No peer connection')
    return peerConnection.value.createDataChannel(label)
  }

  function onDataChannel(callback) {
    if (!peerConnection.value) return
    peerConnection.value.ondatachannel = ({ channel }) => callback(channel)
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  function stopLocalStream() {
    localStream.value?.getTracks().forEach(t => t.stop())
    localStream.value = null
  }

  function closePeerConnection() {
    peerConnection.value?.close()
    peerConnection.value = null
    isConnected.value = false
    connectionState.value = 'closed'
  }

  function cleanup() {
    stopLocalStream()
    closePeerConnection()
    remoteStream.value = null
  }

  onUnmounted(cleanup)

  return {
    localStream, remoteStream, peerConnection,
    isConnected, isMuted, isCameraOff, connectionState, error,
    startLocalStream, startScreenShare,
    toggleMute, toggleCamera,
    createOffer, createAnswer,
    setRemoteAnswer, addIceCandidate,
    createDataChannel, onDataChannel,
    cleanup, stopLocalStream, closePeerConnection,
  }
}
