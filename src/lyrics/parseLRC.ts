import type { LyricLine } from '../api/types'

// 解析 LRC 格式歌词
export function parseLRC(text: string): LyricLine[] {
  const lines: LyricLine[] = []
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g

  for (const raw of text.split('\n')) {
    let match: RegExpExecArray | null
    const times: number[] = []
    let lyricText = ''

    while ((match = regex.exec(raw)) !== null) {
      const min = parseInt(match[1], 10)
      const sec = parseInt(match[2], 10)
      const ms = parseInt(match[3].padEnd(3, '0'), 10)
      times.push(min * 60 + sec + ms / 1000)
      lyricText = match[4].trim()
    }

    if (lyricText) {
      for (const time of times) {
        lines.push({ time, text: lyricText })
      }
    }
  }

  return lines.sort((a, b) => a.time - b.time)
}

// 根据时间找到当前歌词行索引
export function findCurrentLine(lines: LyricLine[], currentTime: number): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].time) return i
  }
  return 0
}
