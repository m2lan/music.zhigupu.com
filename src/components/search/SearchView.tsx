import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, Play, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchSongs, getSongDetails } from '@/api/netease'
import type { Track } from '@/api/types'
import { formatTime } from '@/utils/format'

interface Props {
  onPlayTrack: (track: Track, queue: Track[]) => void
  currentTrack: Track | null
  initialQuery?: string
}

function normalizeTrack(raw: any): Track {
  return {
    id: raw.id,
    name: raw.name,
    artists: (raw.artists || []).map((a: any) => ({ id: a.id, name: a.name })),
    album: { id: raw.album?.id || 0, name: raw.album?.name || '', picUrl: '' },
    duration: raw.duration || 0,
    fee: raw.fee,
  }
}

function mergeDetails(tracks: Track[], details: any[]): Track[] {
  const map = new Map(details.map((d: any) => [d.id, d]))
  return tracks.map(t => {
    const d = map.get(t.id)
    if (!d) return t
    return { ...t, album: { ...t.album, picUrl: d.album?.picUrl || '' }, artists: (d.artists || t.artists).map((a: any) => ({ id: a.id, name: a.name })) }
  })
}

export default function SearchView({ onPlayTrack, currentTrack, initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery || '')
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const autoSearched = useRef(false)

  // 从顶部搜索框进入时自动搜索
  useEffect(() => {
    if (initialQuery && !autoSearched.current) {
      autoSearched.current = true
      // 直接用 initialQuery 搜索，不依赖 query state
      doSearch(initialQuery)
    }
  }, [initialQuery])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchSongs(q.trim())
      const songs = (data.result?.songs || []).map(normalizeTrack)
      if (songs.length > 0) {
        const details = await getSongDetails(songs.map((s: Track) => s.id))
        setTracks(mergeDetails(songs, details.songs || []))
      } else {
        setTracks([])
      }
    } catch (e) {
      console.error('搜索失败:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = useCallback(() => doSearch(query), [query, doSearch])

  return (
    <div className="p-6 space-y-4">
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索音乐、歌手..."
          className="pl-9 h-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-5 h-5 border-2 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      ) : searched && tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
          <Search className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">未找到相关歌曲</p>
        </div>
      ) : tracks.length > 0 ? (
        <div className="space-y-1">
          {/* 表头 */}
          <div className="flex items-center px-3 py-2 text-xs text-muted-foreground border-b border-border">
            <span className="w-10 text-center">#</span>
            <span className="flex-1">标题</span>
            <span className="w-32 hidden sm:block">专辑</span>
            <span className="w-16 text-right flex items-center justify-end gap-1">
              <Clock className="w-3 h-3" />
            </span>
          </div>

          {tracks.map((track, i) => {
            const isActive = currentTrack?.id === track.id
            return (
              <button
                key={track.id}
                onClick={() => onPlayTrack(track, tracks)}
                className={`
                  w-full flex items-center px-3 py-2.5 rounded-md text-left transition-colors group cursor-pointer
                  ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}
                `}
              >
                <span className="w-10 text-center text-xs text-muted-foreground shrink-0">
                  {isActive ? (
                    <span className="inline-block w-2 h-2 rounded-full bg-foreground animate-pulse" />
                  ) : (
                    String(i + 1).padStart(2, '0')
                  )}
                </span>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {track.album.picUrl && (
                    <img src={track.album.picUrl + '?param=80y80'} alt="" className="w-9 h-9 rounded object-cover shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${isActive ? 'text-foreground font-medium' : 'text-foreground/80'}`}>
                      {track.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artists.map(a => a.name).join(' / ')}
                    </p>
                  </div>
                </div>

                <span className="w-32 text-xs text-muted-foreground truncate hidden sm:block">
                  {track.album.name}
                </span>

                <span className="w-16 text-xs text-muted-foreground text-right tabular-nums">
                  {formatTime(track.duration)}
                </span>

                <button
                  onClick={e => { e.stopPropagation(); onPlayTrack(track, tracks) }}
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Play className="w-4 h-4 text-foreground" />
                </button>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/40">
          <Search className="w-8 h-8 mb-2" />
          <p className="text-sm">输入关键词开始探索</p>
        </div>
      )}
    </div>
  )
}
