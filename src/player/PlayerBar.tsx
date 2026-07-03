import type { Track, PlayMode } from '../api/types'
import { formatSeconds } from '../utils/format'

interface Props {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  mode: PlayMode
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onSeek: (time: number) => void
  onVolumeChange: (v: number) => void
  onModeChange: (mode: PlayMode) => void
  onToggleLyrics?: () => void
}

const modeIcons: Record<PlayMode, string> = {
  list: '↻',
  single: '⟳',
  shuffle: '⤮',
}

const modeLabels: Record<PlayMode, string> = {
  list: '列表循环',
  single: '单曲循环',
  shuffle: '随机播放',
}

export default function PlayerBar({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  mode,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onModeChange,
  onToggleLyrics,
}: Props) {
  if (!currentTrack) {
    return (
      <div className="h-20 border-t border-stone-800/50 flex items-center justify-center">
        <p className="text-stone-700 text-xs">选择一首歌曲开始播放</p>
      </div>
    )
  }

  const cycleMode = () => {
    const modes: PlayMode[] = ['list', 'single', 'shuffle']
    const idx = modes.indexOf(mode)
    onModeChange(modes[(idx + 1) % modes.length])
  }

  return (
    <div className="h-20 border-t border-stone-800/50 glass flex items-center px-4 gap-4">
      {/* 歌曲信息 */}
      <div className="flex items-center gap-3 w-56 shrink-0">
        {currentTrack.album.picUrl && (
          <img
            src={currentTrack.album.picUrl + '?param=120y120'}
            alt=""
            className="w-11 h-11 rounded object-cover"
          />
        )}
        <div className="min-w-0">
          <p className="text-sm text-stone-200 truncate">{currentTrack.name}</p>
          <p className="text-xs text-stone-500 truncate">
            {currentTrack.artists.map(a => a.name).join(' / ')}
          </p>
        </div>
      </div>

      {/* 中间控制区 */}
      <div className="flex-1 flex flex-col items-center gap-1">
        <div className="flex items-center gap-5">
          <button
            onClick={cycleMode}
            title={modeLabels[mode]}
            className="text-stone-500 hover:text-stone-300 transition-colors text-sm cursor-pointer"
          >
            {modeIcons[mode]}
          </button>
          <button
            onClick={onPrev}
            className="text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            ⏮
          </button>
          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-full border border-stone-600 flex items-center justify-center
                       text-stone-300 hover:text-stone-100 hover:border-stone-400 transition-colors cursor-pointer"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={onNext}
            className="text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            ⏭
          </button>
          {onToggleLyrics && (
            <button
              onClick={onToggleLyrics}
              className="text-stone-500 hover:text-stone-300 transition-colors text-sm cursor-pointer"
              title="歌词"
            >
              词
            </button>
          )}
        </div>

        {/* 进度条 */}
        <div className="flex items-center gap-2 w-full max-w-lg">
          <span className="text-[10px] text-stone-600 w-8 text-right">
            {formatSeconds(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={e => onSeek(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-[10px] text-stone-600 w-8">
            {formatSeconds(duration)}
          </span>
        </div>
      </div>

      {/* 音量 */}
      <div className="flex items-center gap-2 w-28 shrink-0">
        <span className="text-xs text-stone-600">🔊</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => onVolumeChange(Number(e.target.value))}
          className="flex-1"
        />
      </div>
    </div>
  )
}
