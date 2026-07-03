import { useRef, useEffect } from 'react'
import { Music } from 'lucide-react'
import type { Lyrics } from '@/api/types'
import { findCurrentLine } from '@/lyrics/parseLRC'

interface Props {
  lyrics: Lyrics | null
  currentTime: number
  albumCover?: string
}

export default function LyricsPanel({ lyrics, currentTime, albumCover }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)

  const currentIndex = lyrics ? findCurrentLine(lyrics.lines, currentTime) : -1

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current
      const active = activeRef.current
      const offset = active.offsetTop - container.offsetTop - container.clientHeight / 2 + active.clientHeight / 2
      container.scrollTo({ top: offset, behavior: 'smooth' })
    }
  }, [currentIndex])

  if (!lyrics || lyrics.lines.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground/40">
          {albumCover ? (
            <img src={albumCover} alt="" className="w-48 h-48 rounded-lg mx-auto mb-4 opacity-30" />
          ) : (
            <Music className="w-16 h-16 mx-auto mb-4" />
          )}
          <p className="text-sm">暂无歌词</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="py-32 px-8 max-w-lg mx-auto space-y-4">
        {lyrics.lines.map((line, i) => {
          const isActive = i === currentIndex
          const translation = lyrics.translation?.[i]

          return (
            <div
              key={`${line.time}-${i}`}
              ref={isActive ? activeRef : undefined}
              className={`lyric-line ${isActive ? 'active' : 'inactive'}`}
            >
              <p className={`text-lg leading-relaxed transition-all ${isActive ? 'font-medium' : ''}`}>
                {line.text}
              </p>
              {translation && (
                <p className="text-sm mt-0.5 opacity-50">{translation.text}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
