import { useRef, useEffect } from 'react'
import type { Lyrics } from '../api/types'
import { findCurrentLine } from './parseLRC'

interface Props {
  lyrics: Lyrics | null
  currentTime: number
  className?: string
}

export default function LyricsPanel({ lyrics, currentTime, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)

  const currentIndex = lyrics ? findCurrentLine(lyrics.lines, currentTime) : -1

  // 自动滚动到当前行
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
      <div className={`flex items-center justify-center ${className || ''}`}>
        <p className="text-stone-600 text-sm">暂无歌词</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`overflow-y-auto ${className || ''}`}>
      <div className="py-24 px-4 space-y-3">
        {lyrics.lines.map((line, i) => {
          const isActive = i === currentIndex
          const translation = lyrics.translation?.[i]

          return (
            <div
              key={`${line.time}-${i}`}
              ref={isActive ? activeRef : undefined}
              className={`lyric-line ${isActive ? 'active' : 'inactive'}`}
            >
              <p className="text-base leading-relaxed">{line.text}</p>
              {translation && (
                <p className="text-xs mt-0.5 opacity-60">{translation.text}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
