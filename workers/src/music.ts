import { Hono } from 'hono'
import { buildHeaders, API_BASE } from './utils'

type Bindings = {
  SESSION: KVNamespace
}

const music = new Hono<{ Bindings: Bindings }>()

// 搜索歌曲
music.get('/search', async (c) => {
  const cookies = await c.env.SESSION.get('cookies') || ''
  const keyword = c.req.query('keyword') || c.req.query('s') || ''
  const type = c.req.query('type') || '1'
  const limit = c.req.query('limit') || '30'
  const offset = c.req.query('offset') || '0'

  const targetUrl = `${API_BASE}/api/search/get?s=${encodeURIComponent(keyword)}&type=${type}&limit=${limit}&offset=${offset}`

  const r = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Referer': 'https://music.163.com/',
      'Origin': 'https://music.163.com',
      ...(cookies ? { 'Cookie': cookies } : {}),
    },
  })
  const data = await r.json()
  return c.json(data)
})

// 获取播放链接
music.post('/song/url', async (c) => {
  const cookies = await c.env.SESSION.get('cookies') || ''
  const body = await c.req.json() as { ids: number[]; br?: number }
  const { ids, br = 320000 } = body

  const params = new URLSearchParams({
    ids: JSON.stringify(ids),
    br: String(br),
  })

  const r = await fetch(`${API_BASE}/api/song/enhance/player/url`, {
    method: 'POST',
    headers: buildHeaders(cookies, { 'Content-Type': 'application/x-www-form-urlencoded' }),
    body: params.toString(),
  })
  const data = await r.json()
  return c.json(data)
})

// 获取歌曲详情
music.get('/song/detail', async (c) => {
  const cookies = await c.env.SESSION.get('cookies') || ''
  const ids = c.req.query('ids')

  const r = await fetch(`${API_BASE}/api/song/detail?ids=${ids}`, {
    headers: buildHeaders(cookies),
  })
  const data = await r.json()
  return c.json(data)
})

// 获取歌词
music.get('/lyric', async (c) => {
  const cookies = await c.env.SESSION.get('cookies') || ''
  const id = c.req.query('id')

  const r = await fetch(`${API_BASE}/api/song/lyric?id=${id}&lv=1&tv=1`, {
    headers: buildHeaders(cookies),
  })
  const data = await r.json()
  return c.json(data)
})

// 获取歌单详情（含全部歌曲）
music.get('/playlist', async (c) => {
  const cookies = await c.env.SESSION.get('cookies') || ''
  const id = c.req.query('id')

  // 获取歌单基本信息 + trackIds
  const r = await fetch(`${API_BASE}/api/v6/playlist/detail?id=${id}&n=100`, {
    headers: buildHeaders(cookies),
  })
  const data = await r.json() as any
  const playlist = data.playlist

  // 如果有 trackIds 但 tracks 不完整，用 trackIds 批量获取
  const trackIds = playlist.trackIds || []
  const existingTracks = playlist.tracks || []

  if (trackIds.length > existingTracks.length) {
    const ids = trackIds.map((t: any) => t.id)
    const batches: any[] = []
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100)
      const songR = await fetch(`${API_BASE}/api/song/detail?ids=${JSON.stringify(batch)}`, {
        headers: buildHeaders(cookies),
      })
      const songData = await songR.json() as any
      batches.push(...(songData.songs || []))
    }
    playlist.tracks = batches
  }

  return c.json(data)
})

// 推荐歌单
music.get('/top/playlist', async (c) => {
  const cookies = await c.env.SESSION.get('cookies') || ''
  const limit = c.req.query('limit') || '12'

  const r = await fetch(`${API_BASE}/api/personalized/playlist?limit=${limit}`, {
    headers: buildHeaders(cookies),
  })
  const data = await r.json() as any

  return c.json({
    playlists: (data.result || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      coverImgUrl: p.picUrl,
      playCount: p.playCount,
      trackCount: p.trackCount,
      description: p.copywriter || '',
    })),
  })
})

// 新歌速递
music.get('/top/song', async (c) => {
  const cookies = await c.env.SESSION.get('cookies') || ''
  const type = c.req.query('type') || '0'

  const r = await fetch(`${API_BASE}/api/top/song?type=${type}`, {
    headers: buildHeaders(cookies),
  })
  const data = await r.json()
  return c.json(data)
})

// 排行榜列表
music.get('/toplist', async (c) => {
  const cookies = await c.env.SESSION.get('cookies') || ''

  const r = await fetch(`${API_BASE}/api/toplist/detail`, {
    headers: buildHeaders(cookies),
  })
  const data = await r.json()
  return c.json(data)
})

export default music
