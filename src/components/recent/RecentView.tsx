import { useState, useEffect } from 'react'
import { Play, Clock } from 'lucide-react'
import { getRecentTracks } from '@/utils/recent'
import type { Track } from '@/api/types'
import { formatTime } from '@/utils/format'

interface Props {
  onPlayTrack: (track: Track, queue: Track[]) => void
  currentTrack: Track | null
}

export default function RecentView({ onPlayTrack, currentTrack }: Props) {
  const [tracks, setTracks] = useState<Track[]>([])

  useEffect(() => {
    setTracks(getRecentTracks())
  }, [])

  if (tracks.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Clock className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm">还没有播放记录</p>
        <p className="text-xs text-muted-foreground/60 mt-1">播放歌曲后会自动记录</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-4">最近播放</h1>

      <div className="space-y-1">
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
              key={`${track.id}-${i}`}
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
    </div>
  )
}
