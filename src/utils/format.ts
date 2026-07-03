// 毫秒 → mm:ss
export function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

// 秒 → mm:ss
export function formatSeconds(sec: number): string {
  const min = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${min}:${s.toString().padStart(2, '0')}`
}
