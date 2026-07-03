import { useRef, useEffect } from 'react'
import { Music } from 'lucide-react'
import type { Lyrics } from '@/api/types'
import { findCurrentLine } from '@/lyrics/parseLRC'

interface Props {
  lyrics: Lyrics | null
  currentTime: number
  albumCover?: string
  trackName?: string
  artistName?: string
}

export default function LyricsPanel({ lyrics, currentTime, albumCover, trackName, artistName }: Props) {
  const activeRef = useRef<HTMLDivElement>(null)

  const currentIndex = lyrics ? findCurrentLine(lyrics.lines, currentTime) : -1

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentIndex])

  // 无歌词状态
  if (!lyrics || lyrics.lines.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* 背景：封面铺满 + 暗色叠加 */}
        {albumCover && (
          <div className="absolute inset-0 -z-10">
            <img src={albumCover} alt="" className="w-full h-full object-cover blur-2xl scale-125 brightness-[0.3]" />
          </div>
        )}

        <div className="text-center">
          {albumCover ? (
            <img src={albumCover} alt="" className="w-56 h-56 rounded-2xl mx-auto mb-6 shadow-2xl" />
          ) : (
            <div className="w-56 h-56 rounded-2xl mx-auto mb-6 bg-secondary flex items-center justify-center">
              <Music className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
          {trackName && <p className="text-lg font-medium mb-1">{trackName}</p>}
          {artistName && <p className="text-sm text-muted-foreground">{artistName}</p>}
          <p className="text-xs text-muted-foreground/40 mt-4">暂无歌词</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* 背景：封面铺满 + 暗色叠加 */}
      {albumCover && (
        <div className="absolute inset-0 -z-10">
          <img src={albumCover} alt="" className="w-full h-full object-cover blur-2xl scale-125 brightness-[0.2]" />
        </div>
      )}

      {/* 顶部渐变 */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />

      {/* 歌词滚动区 */}
      <div className="h-full overflow-y-auto">
        <div className="min-h-[30vh]" />
        <div className="px-12 max-w-2xl mx-auto space-y-1">
          {lyrics.lines.map((line, i) => {
            const isActive = i === currentIndex
            const isPast = i < currentIndex
            const translation = lyrics.translation?.[i]

            return (
              <div
                key={`${line.time}-${i}`}
                ref={isActive ? activeRef : undefined}
                className={`py-3 transition-all duration-500 ease-out ${
                  isActive
                    ? 'scale-[1.03] origin-left'
                    : isPast
                      ? 'opacity-30 scale-100'
                      : 'opacity-40 scale-100'
                }`}
              >
                <p
                  className={`leading-relaxed transition-all duration-500 ${
                    isActive
                      ? 'text-2xl font-bold text-white'
                      : 'text-xl text-white/50'
                  }`}
                >
                  {line.text}
                </p>
                {translation && (
                  <p
                    className={`mt-1 transition-all duration-500 ${
                      isActive
                        ? 'text-base text-white/70'
                        : 'text-sm text-white/30'
                    }`}
                  >
                    {translation.text}
                  </p>
                )}
              </div>
            )
          })}
        </div>
        <div className="min-h-[30vh]" />
      </div>

      {/* 底部渐变 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
    </div>
  )
}
