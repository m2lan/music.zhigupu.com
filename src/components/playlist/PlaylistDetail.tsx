import { useState, useEffect } from 'react'
import { Play, ArrowLeft, Clock, Headphones } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Track } from '@/api/types'
import { formatTime, formatPlayCount } from '@/utils/format'

const API = 'http://localhost:3001/api'

interface PlaylistInfo {
  id: number
  name: string
  description: string
  coverImgUrl: string
  trackCount: number
  playCount: number
  creator: { nickname: string }
  tracks: any[]
}

interface Props {
  playlistId: number
  onBack: () => void
  onPlayTrack: (track: Track, queue: Track[]) => void
  currentTrack: Track | null
}

function normalizeTrack(raw: any): Track {
  return {
    id: raw.id,
    name: raw.name,
    artists: (raw.ar || raw.artists || []).map((a: any) => ({ id: a.id, name: a.name })),
    album: { id: raw.al?.id || raw.album?.id || 0, name: raw.al?.name || raw.album?.name || '', picUrl: raw.al?.picUrl || raw.album?.picUrl || '' },
    duration: raw.dt || raw.duration || 0,
  }
}

export default function PlaylistDetail({ playlistId, onBack, onPlayTrack, currentTrack }: Props) {
  const [info, setInfo] = useState<PlaylistInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/playlist?id=${playlistId}`)
      .then(r => r.json())
      .then(data => setInfo(data.playlist))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [playlistId])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex gap-6">
          <Skeleton className="w-48 h-48 rounded-lg shrink-0" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    )
  }

  if (!info) return <div className="p-6 text-muted-foreground">歌单不存在</div>

  const tracks = (info.tracks || []).map(normalizeTrack)

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex gap-6 p-6 pb-0">
        <button onClick={onBack} className="self-start p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-48 h-48 rounded-lg overflow-hidden bg-secondary shrink-0">
          {info.coverImgUrl && (
            <img src={info.coverImgUrl + '?param=400y400'} alt={info.name} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-end">
          <p className="text-xs text-muted-foreground mb-1">歌单</p>
          <h1 className="text-2xl font-bold mb-2">{info.name}</h1>
          {info.creator?.nickname && (
            <p className="text-sm text-muted-foreground mb-1">by {info.creator.nickname}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              {formatPlayCount(info.playCount)}
            </span>
            <span>{info.trackCount} 首</span>
          </div>
          {info.description && (
            <p className="text-xs text-muted-foreground/60 mt-2 line-clamp-2">{info.description}</p>
          )}

          <div className="mt-4">
            <button
              onClick={() => {
                if (tracks.length > 0) {
                  onPlayTrack(tracks[0], tracks)
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4" />
              播放全部
            </button>
          </div>
        </div>
      </div>

      {/* 歌曲列表 */}
      <div className="px-6">
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
                  <p className={`text-sm truncate ${isActive ? 'font-medium' : 'text-foreground/80'}`}>
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
            </button>
          )
        })}
      </div>
    </div>
  )
}
