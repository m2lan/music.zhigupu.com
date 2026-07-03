import { useState, useRef, useCallback, useEffect } from 'react'
import type { Track, PlayMode, PlayerState } from '../api/types'
import { getSongUrl } from '../api/netease'

export const audio = new Audio()
audio.preload = 'auto'

export function usePlayer() {
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    queue: [],
    currentIndex: -1,
    mode: 'list',
  })

  const loadingRef = useRef(false)

  useEffect(() => {
    audio.volume = state.volume
  }, [state.volume])

  useEffect(() => {
    const onTime = () => setState(s => ({ ...s, currentTime: audio.currentTime }))
    const onDuration = () => setState(s => ({ ...s, duration: audio.duration }))
    const onEnded = () => playNext()
    const onPlay = () => setState(s => ({ ...s, isPlaying: true }))
    const onPause = () => setState(s => ({ ...s, isPlaying: false }))

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onDuration)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onDuration)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [state.queue, state.currentIndex, state.mode])

  const playTrack = useCallback(async (track: Track, queue?: Track[]) => {
    if (loadingRef.current) return
    loadingRef.current = true

    try {
      const url = await getSongUrl(track.id)
      if (!url) {
        console.warn('无法获取播放链接:', track.name)
        return
      }

      audio.src = url
      await audio.play()

      const newQueue = queue || [track]
      const idx = newQueue.findIndex(t => t.id === track.id)

      setState(s => ({
        ...s,
        currentTrack: track,
        isPlaying: true,
        currentTime: 0,
        queue: newQueue,
        currentIndex: idx >= 0 ? idx : 0,
      }))
    } catch (e) {
      console.error('播放失败:', e)
    } finally {
      loadingRef.current = false
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (!state.currentTrack) return
    audio.paused ? audio.play() : audio.pause()
  }, [state.currentTrack])

  const playPrev = useCallback(() => {
    const { queue, currentIndex, mode } = state
    if (queue.length === 0) return
    const idx = mode === 'shuffle'
      ? Math.floor(Math.random() * queue.length)
      : (currentIndex - 1 + queue.length) % queue.length
    playTrack(queue[idx], queue)
  }, [state, playTrack])

  const playNext = useCallback(() => {
    const { queue, currentIndex, mode } = state
    if (queue.length === 0) return
    let idx: number
    if (mode === 'shuffle') idx = Math.floor(Math.random() * queue.length)
    else if (mode === 'single') idx = currentIndex
    else idx = (currentIndex + 1) % queue.length
    playTrack(queue[idx], queue)
  }, [state, playTrack])

  const seek = useCallback((time: number) => {
    audio.currentTime = time
    setState(s => ({ ...s, currentTime: time }))
  }, [])

  const setVolume = useCallback((v: number) => {
    const vol = Math.max(0, Math.min(1, v))
    audio.volume = vol
    setState(s => ({ ...s, volume: vol }))
  }, [])

  const setMode = useCallback((mode: PlayMode) => {
    setState(s => ({ ...s, mode }))
  }, [])

  return {
    ...state,
    playTrack,
    togglePlay,
    playPrev,
    playNext,
    seek,
    setVolume,
    setMode,
  }
}
