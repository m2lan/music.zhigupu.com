import { API_BASE } from './config'

// 搜索歌曲
export async function searchSongs(keyword: string, limit = 30, offset = 0) {
  const params = new URLSearchParams({
    keyword,
    type: '1',
    limit: String(limit),
    offset: String(offset),
  })
  const res = await fetch(`${API_BASE}/search?${params}`)
  if (!res.ok) throw new Error('搜索失败')
  return res.json()
}

// 获取播放链接
export async function getSongUrl(id: number, br = 320000): Promise<string | null> {
  const res = await fetch(`${API_BASE}/song/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: [id], br }),
  })
  if (!res.ok) throw new Error('获取播放链接失败')
  const data = await res.json()
  return data.data?.[0]?.url ?? null
}

// 获取歌曲详情（含封面）
export async function getSongDetails(ids: number[]) {
  const res = await fetch(`${API_BASE}/song/detail?ids=${JSON.stringify(ids)}`)
  if (!res.ok) throw new Error('获取歌曲详情失败')
  return res.json()
}

// 获取歌词
export async function getLyrics(id: number) {
  const res = await fetch(`${API_BASE}/lyric?id=${id}`)
  if (!res.ok) throw new Error('获取歌词失败')
  return res.json()
}

// 获取歌单详情
export async function getPlaylistDetail(id: number) {
  const res = await fetch(`${API_BASE}/playlist?id=${id}`)
  if (!res.ok) throw new Error('获取歌单失败')
  return res.json()
}

// 解析 LRC 歌词
export function parseLRC(text: string): { time: number; text: string }[] {
  const lines: { time: number; text: string }[] = []
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
