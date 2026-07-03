import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const API_BASE = 'https://music.163.com'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Referer': 'https://music.163.com',
}

// 搜索歌曲
app.get('/api/search', async (req, res) => {
  try {
    const { keyword, type = 1, limit = 30, offset = 0 } = req.query
    const params = new URLSearchParams({
      s: String(keyword),
      type: String(type),
      limit: String(limit),
      offset: String(offset),
    })

    const r = await fetch(`${API_BASE}/api/search/get?${params}`, {
      headers: HEADERS,
    })
    const data = await r.json()
    res.json(data)
  } catch (e) {
    console.error('搜索失败:', e)
    res.status(500).json({ error: '搜索失败' })
  }
})

// 获取播放链接
app.post('/api/song/url', async (req, res) => {
  try {
    const { ids, br = 320000 } = req.body
    const params = new URLSearchParams({
      ids: JSON.stringify(ids),
      br: String(br),
    })

    const r = await fetch(`${API_BASE}/api/song/enhance/player/url`, {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const data = await r.json()
    res.json(data)
  } catch (e) {
    console.error('获取播放链接失败:', e)
    res.status(500).json({ error: '获取播放链接失败' })
  }
})

// 获取歌曲详情（含封面）
app.get('/api/song/detail', async (req, res) => {
  try {
    const { ids } = req.query
    const r = await fetch(`${API_BASE}/api/song/detail?ids=${ids}`, {
      headers: HEADERS,
    })
    const data = await r.json()
    res.json(data)
  } catch (e) {
    console.error('获取歌曲详情失败:', e)
    res.status(500).json({ error: '获取歌曲详情失败' })
  }
})

// 获取歌词
app.get('/api/lyric', async (req, res) => {
  try {
    const { id } = req.query
    const r = await fetch(`${API_BASE}/api/song/lyric?id=${id}&lv=1&tv=1`, {
      headers: HEADERS,
    })
    const data = await r.json()
    res.json(data)
  } catch (e) {
    console.error('获取歌词失败:', e)
    res.status(500).json({ error: '获取歌词失败' })
  }
})

// 获取歌单详情
app.get('/api/playlist', async (req, res) => {
  try {
    const { id } = req.query
    const r = await fetch(`${API_BASE}/api/playlist/detail?id=${id}`, {
      headers: HEADERS,
    })
    const data = await r.json()
    res.json(data)
  } catch (e) {
    console.error('获取歌单失败:', e)
    res.status(500).json({ error: '获取歌单失败' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
