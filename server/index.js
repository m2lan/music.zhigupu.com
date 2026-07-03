import express from 'express'
import cors from 'cors'
import QRCode from 'qrcode'

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const API_BASE = 'https://music.163.com'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

// 全局 cookies 存储（单用户）
let cookies = ''

function getHeaders(extra = {}) {
  return {
    'User-Agent': UA,
    'Referer': 'https://music.163.com',
    ...(cookies ? { 'Cookie': cookies } : {}),
    ...extra,
  }
}

// ── 登录相关 ──

// 获取二维码 key
app.post('/api/login/qrcode/key', async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/api/login/qrcode/unikey?type=1`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    })
    const data = await r.json()
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: '获取二维码失败' })
  }
})

// 生成二维码图片（base64）
app.get('/api/login/qrcode/img', async (req, res) => {
  try {
    const { key } = req.query
    const url = `https://music.163.com/login?codekey=${key}`
    const qr = await QRCode.toDataURL(url, { width: 256, margin: 2 })
    res.json({ qr, url })
  } catch (e) {
    res.status(500).json({ error: '生成二维码失败' })
  }
})

// 轮询扫码状态
app.get('/api/login/qrcode/check', async (req, res) => {
  try {
    const { key } = req.query
    const r = await fetch(`${API_BASE}/api/login/qrcode/client/login?type=1&key=${key}`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    })

    // 从响应中提取 cookies（兼容不同 Node 版本）
    let setCookies = []
    try {
      setCookies = r.headers.getSetCookie?.() || []
    } catch {
      // getSetCookie 不可用时，从 raw headers 提取
      const raw = r.headers.raw?.() || {}
      setCookies = raw['set-cookie'] || []
    }

    // 保存 cookies（合并已有 cookies）
    if (setCookies.length > 0) {
      const newParts = setCookies.map(c => c.split(';')[0])
      const existingParts = cookies ? cookies.split('; ') : []
      const merged = [...new Map([...existingParts, ...newParts].map(p => [p.split('=')[0], p])).values()]
      cookies = merged.join('; ')
      console.log('已更新 cookies')
    }

    const data = await r.json()

    // 如果 API 返回成功或已有 cookies，验证登录状态
    if (data.code === 803 || cookies.includes('MUSIC_U')) {
      // 验证登录
      const checkR = await fetch(`${API_BASE}/api/nuser/account/get`, {
        headers: getHeaders(),
      })
      const checkData = await checkR.json()
      if (checkData.code === 200 && checkData.account?.status === 0) {
        return res.json({ code: 803, message: '登录成功' })
      }
    }

    res.json(data)
  } catch (e) {
    res.status(500).json({ error: '检查扫码状态失败' })
  }
})

// 检查登录状态
app.get('/api/login/status', async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/api/nuser/account/get`, {
      headers: getHeaders(),
    })
    const data = await r.json()
    const loggedIn = data.code === 200 && data.account?.status === 0
    res.json({ loggedIn, profile: data.profile || null })
  } catch (e) {
    res.json({ loggedIn: false })
  }
})

// ── 音乐 API ──

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
      headers: getHeaders(),
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
      headers: getHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      body: params.toString(),
    })
    const data = await r.json()
    res.json(data)
  } catch (e) {
    console.error('获取播放链接失败:', e)
    res.status(500).json({ error: '获取播放链接失败' })
  }
})

// 获取歌曲详情
app.get('/api/song/detail', async (req, res) => {
  try {
    const { ids } = req.query
    const r = await fetch(`${API_BASE}/api/song/detail?ids=${ids}`, {
      headers: getHeaders(),
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
      headers: getHeaders(),
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
      headers: getHeaders(),
    })
    const data = await r.json()
    res.json(data)
  } catch (e) {
    console.error('获取歌单失败:', e)
    res.status(500).json({ error: '获取歌单失败' })
  }
})

// 推荐歌单
app.get('/api/top/playlist', async (req, res) => {
  try {
    const { limit = 12, order = 'hot', offset = 0 } = req.query
    const r = await fetch(`${API_BASE}/api/top/playlist?limit=${limit}&order=${order}&offset=${offset}`, {
      headers: getHeaders(),
    })
    const data = await r.json()
    res.json(data)
  } catch (e) {
    console.error('获取推荐歌单失败:', e)
    res.status(500).json({ error: '获取推荐歌单失败' })
  }
})

// 新歌速递
app.get('/api/top/song', async (req, res) => {
  try {
    const { type = 0 } = req.query
    const r = await fetch(`${API_BASE}/api/top/song?type=${type}`, {
      headers: getHeaders(),
    })
    const data = await r.json()
    res.json(data)
  } catch (e) {
    console.error('获取新歌失败:', e)
    res.status(500).json({ error: '获取新歌失败' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
