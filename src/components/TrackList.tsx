import type { Track } from '../api/types'
import { formatTime } from '../utils/format'

interface Props {
  tracks: Track[]
  currentTrack?: Track | null
  onPlay: (track: Track) => void
}

export default function TrackList({ tracks, currentTrack, onPlay }: Props) {
  return (
    <div className="space-y-0.5">
      {tracks.map((track, i) => {
        const isActive = currentTrack?.id === track.id
        return (
          <button
            key={track.id}
            onClick={() => onPlay(track)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left
              transition-colors duration-200 group cursor-pointer
              ${isActive
                ? 'bg-stone-800/60 text-stone-200'
                : 'hover:bg-stone-800/30 text-stone-400 hover:text-stone-300'
              }
            `}
          >
            <span className="w-6 text-right text-xs text-stone-600 shrink-0">
              {isActive ? (
                <span className="inline-block w-2 h-2 rounded-full bg-stone-400 animate-pulse" />
              ) : (
                String(i + 1).padStart(2, '0')
              )}
            </span>

            {track.album.picUrl && (
              <img
                src={track.album.picUrl + '?param=80y80'}
                alt=""
                className="w-9 h-9 rounded object-cover opacity-80 group-hover:opacity-100 transition-opacity shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${isActive ? 'text-stone-200' : ''}`}>
                {track.name}
              </p>
              <p className="text-xs text-stone-600 truncate">
                {track.artists.map(a => a.name).join(' / ')}
              </p>
            </div>

            <span className="text-xs text-stone-600 shrink-0">
              {formatTime(track.duration)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
