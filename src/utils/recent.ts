import type { Track } from '@/api/types'

const KEY = 'recent_tracks'
const MAX = 50

export function getRecentTracks(): Track[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function addRecentTrack(track: Track) {
  const list = getRecentTracks().filter(t => t.id !== track.id)
  list.unshift(track)
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
}
