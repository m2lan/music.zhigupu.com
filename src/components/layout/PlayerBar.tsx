import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, ListMusic } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import type { Track, PlayMode } from '@/api/types'
import { formatSeconds } from '@/utils/format'

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
  onToggleQueue?: () => void
}

const modeConfig: Record<PlayMode, { icon: typeof Repeat; label: string }> = {
  list: { icon: Repeat, label: '列表循环' },
  single: { icon: Repeat1, label: '单曲循环' },
  shuffle: { icon: Shuffle, label: '随机播放' },
}

export default function PlayerBar({
  currentTrack, isPlaying, currentTime, duration, volume, mode,
  onTogglePlay, onPrev, onNext, onSeek, onVolumeChange, onModeChange,
  onToggleLyrics, onToggleQueue,
}: Props) {
  const ModeIcon = modeConfig[mode].icon

  const cycleMode = () => {
    const modes: PlayMode[] = ['list', 'single', 'shuffle']
    onModeChange(modes[(modes.indexOf(mode) + 1) % modes.length])
  }

  if (!currentTrack) {
    return (
      <div className="h-[72px] border-t border-border flex items-center justify-center">
        <p className="text-xs text-muted-foreground/40">选择一首歌曲开始播放</p>
      </div>
    )
  }

  return (
    <div className="h-[72px] border-t border-border flex items-center px-4 gap-4 shrink-0 bg-card/80 backdrop-blur-sm">
      {/* 左：歌曲信息 */}
      <div className="flex items-center gap-3 w-64 shrink-0">
        {currentTrack.album.picUrl ? (
          <img
            src={currentTrack.album.picUrl + '?param=100y100'}
            alt=""
            className="w-12 h-12 rounded-md object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground/40 text-lg">♪</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{currentTrack.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {currentTrack.artists.map(a => a.name).join(' / ')}
          </p>
        </div>
      </div>

      {/* 中：控制区 + 进度条 */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={cycleMode} title={modeConfig[mode].label} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <ModeIcon className="w-4 h-4" />
          </button>

          <button onClick={onPrev} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button onClick={onNext} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <SkipForward className="w-4 h-4" />
          </button>

          <button onClick={onToggleLyrics} title="歌词" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <span className="text-xs font-medium">词</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] text-muted-foreground w-8 text-right tabular-nums">
            {formatSeconds(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 1}
            step={0.1}
            onValueChange={(v: number | readonly number[]) => {
              const val = Array.isArray(v) ? v[0] : v
              onSeek(val)
            }}
            className="flex-1"
          />
          <span className="text-[10px] text-muted-foreground w-8 tabular-nums">
            {formatSeconds(duration)}
          </span>
        </div>
      </div>

      {/* 右：音量 + 队列 */}
      <div className="flex items-center gap-3 w-48 shrink-0 justify-end">
        <button
          onClick={() => onVolumeChange(volume > 0 ? 0 : 0.7)}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={(v: number | readonly number[]) => {
            const val = Array.isArray(v) ? v[0] : v
            onVolumeChange(val)
          }}
          className="w-24"
        />
        <button onClick={onToggleQueue} title="播放队列" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <ListMusic className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
