import { useState, useEffect } from 'react'
import { Play, TrendingUp, Flame, Zap, Music } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import type { Track } from '@/api/types'
import { formatTime } from '@/utils/format'

import { API_BASE as API } from '@/api/config'

const RANKINGS = [
  { id: 19723756, name: '飙升榜', icon: Zap, color: 'text-orange-400' },
  { id: 3779629, name: '新歌榜', icon: Music, color: 'text-blue-400' },
  { id: 2884035, name: '热歌榜', icon: Flame, color: 'text-red-400' },
  { id: 3778678, name: '原创榜', icon: TrendingUp, color: 'text-green-400' },
]

interface Props {
  onPlayTrack: (track: Track, queue: Track[]) => void
  currentTrack: Track | null
}

function normalizeTrack(raw: any): Track {
  return {
    id: raw.id,
    name: raw.name,
    artists: (raw.ar || raw.artists || []).map((a: any) => ({ id: a.id, name: a.name })),
    album: { id: raw.al?.id || 0, name: raw.al?.name || '', picUrl: raw.al?.picUrl || '' },
    duration: raw.dt || raw.duration || 0,
  }
}

function RankingList({ id, onPlayTrack, currentTrack }: { id: number; onPlayTrack: Props['onPlayTrack']; currentTrack: Props['currentTrack'] }) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/playlist?id=${id}`)
      .then(r => r.json())
      .then(data => {
        const list = (data.playlist?.tracks || []).slice(0, 50).map(normalizeTrack)
        setTracks(list)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-6 h-4" />
            <Skeleton className="w-9 h-9 rounded" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-1 p-4">
      {tracks.map((track, i) => {
        const isActive = currentTrack?.id === track.id
        return (
          <button
            key={track.id}
            onClick={() => onPlayTrack(track, tracks)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors group cursor-pointer
              ${isActive ? 'bg-accent' : 'hover:bg-accent/50'}
            `}
          >
            <span className={`w-6 text-center text-sm font-medium tabular-nums ${i < 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
              {i + 1}
            </span>

            {track.album.picUrl && (
              <img src={track.album.picUrl + '?param=80y80'} alt="" className="w-9 h-9 rounded object-cover shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${isActive ? 'font-medium' : 'text-foreground/80'}`}>
                {track.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {track.artists.map(a => a.name).join(' / ')}
              </p>
            </div>

            <span className="text-xs text-muted-foreground tabular-nums">
              {formatTime(track.duration)}
            </span>

            <button
              onClick={e => { e.stopPropagation(); onPlayTrack(track, tracks) }}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Play className="w-4 h-4 text-foreground" />
            </button>
          </button>
        )
      })}
    </div>
  )
}

export default function RankingView({ onPlayTrack, currentTrack }: Props) {
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-4">排行榜</h1>

      <Tabs defaultValue={String(RANKINGS[0].id)} className="space-y-4">
        <TabsList className="bg-secondary/50">
          {RANKINGS.map(r => (
            <TabsTrigger key={r.id} value={String(r.id)} className="gap-1.5">
              <r.icon className={`w-3.5 h-3.5 ${r.color}`} />
              {r.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {RANKINGS.map(r => (
          <TabsContent key={r.id} value={String(r.id)}>
            <RankingList id={r.id} onPlayTrack={onPlayTrack} currentTrack={currentTrack} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
