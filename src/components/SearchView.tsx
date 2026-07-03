import { useState, useCallback } from 'react'
import { searchSongs, getSongDetails } from '../api/netease'
import type { Track } from '../api/types'
import TrackList from './TrackList'

interface Props {
  onPlayTrack: (track: Track, queue: Track[]) => void
  currentTrack: Track | null
}

function normalizeSearchResult(raw: any): Track {
  return {
    id: raw.id,
    name: raw.name,
    artists: (raw.artists || []).map((a: any) => ({
      id: a.id,
      name: a.name,
    })),
    album: {
      id: raw.album?.id || 0,
      name: raw.album?.name || '',
      picUrl: '', // 后续通过详情接口获取
    },
    duration: raw.duration || 0,
    fee: raw.fee,
  }
}

function mergeDetails(tracks: Track[], details: any[]): Track[] {
  const detailMap = new Map<number, any>()
  for (const d of details) {
    detailMap.set(d.id, d)
  }

  return tracks.map(t => {
    const detail = detailMap.get(t.id)
    if (!detail) return t
    return {
      ...t,
      album: {
        ...t.album,
        picUrl: detail.album?.picUrl || '',
      },
      artists: (detail.artists || t.artists).map((a: any) => ({
        id: a.id,
        name: a.name,
      })),
    }
  })
}

export default function SearchView({ onPlayTrack, currentTrack }: Props) {
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchSongs(query.trim())
      const songs = (data.result?.songs || []).map(normalizeSearchResult)

      // 批量获取封面
      const ids = songs.map((s: Track) => s.id)
      if (ids.length > 0) {
        try {
          const detailData = await getSongDetails(ids)
          const merged = mergeDetails(songs, detailData.songs || [])
          setTracks(merged)
        } catch {
          // 详情获取失败也展示结果（无封面）
          setTracks(songs)
        }
      } else {
        setTracks(songs)
      }
    } catch (e) {
      console.error('搜索失败:', e)
    } finally {
      setLoading(false)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="px-6 pt-6 pb-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索歌曲、艺人..."
            className="w-full bg-stone-900/60 border border-stone-800 rounded-lg px-4 py-2.5
                       text-sm text-stone-300 placeholder-stone-600
                       focus:outline-none focus:border-stone-700 transition-colors"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs
                       text-stone-500 hover:text-stone-300 transition-colors"
          >
            搜索
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-stone-700 border-t-stone-400 rounded-full animate-spin" />
          </div>
        ) : searched && tracks.length === 0 ? (
          <p className="text-center text-stone-600 text-sm mt-12">未找到相关歌曲</p>
        ) : tracks.length > 0 ? (
          <TrackList
            tracks={tracks}
            currentTrack={currentTrack}
            onPlay={track => onPlayTrack(track, tracks)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-stone-700">
            <p className="text-sm">输入关键词开始探索</p>
          </div>
        )}
      </div>
    </div>
  )
}
