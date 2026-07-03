import { Hono } from 'hono'
import { buildHeaders, mergeCookies, extractSetCookies, API_BASE } from './utils'

type Bindings = {
  SESSION: KVNamespace
}

const auth = new Hono<{ Bindings: Bindings }>()

// 获取二维码 key
auth.post('/login/qrcode/key', async (c) => {
  const cookies = await c.env.SESSION.get('cookies') || ''
  const r = await fetch(`${API_BASE}/api/login/qrcode/unikey?type=1`, {
    method: 'POST',
    headers: buildHeaders(cookies, { 'Content-Type': 'application/x-www-form-urlencoded' }),
  })
  const data = await r.json()
  return c.json(data)
})

// 生成二维码图片（base64）
auth.get('/login/qrcode/img', async (c) => {
  const key = c.req.query('key')
  if (!key) return c.json({ error: '缺少 key 参数' }, 400)

  // 用 QR Server API 生成二维码（Workers 兼容，无需 npm 包）
  const url = `https://music.163.com/login?codekey=${key}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(url)}`

  // 返回 URL 让前端直接展示（或转 base64）
  // 为了兼容原有前端（期望 base64 data URL），我们用 qrserver 的 base64 接口
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&format=png&data=${encodeURIComponent(url)}`

  try {
    const qrRes = await fetch(qrApiUrl)
    const buffer = await qrRes.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    return c.json({ qr: `data:image/png;base64,${base64}`, url })
  } catch {
    // fallback: 返回 URL 让前端自行处理
    return c.json({ qr: '', url })
  }
})

// 轮询扫码状态
auth.get('/login/qrcode/check', async (c) => {
  const key = c.req.query('key')
  if (!key) return c.json({ error: '缺少 key 参数' }, 400)

  let cookies = await c.env.SESSION.get('cookies') || ''

  const r = await fetch(`${API_BASE}/api/login/qrcode/client/login?type=1&key=${key}`, {
    method: 'POST',
    headers: buildHeaders(cookies, { 'Content-Type': 'application/x-www-form-urlencoded' }),
  })

  // 提取并合并 cookies
  const setCookies = extractSetCookies(r)
  if (setCookies.length > 0) {
    cookies = mergeCookies(cookies, setCookies)
    await c.env.SESSION.put('cookies', cookies, { expirationTtl: 604800 }) // 7 天
    console.log('已更新 cookies')
  }

  const data = await r.json() as any

  // 如果 API 返回成功或已有 cookies，验证登录状态
  if (data.code === 803 || cookies.includes('MUSIC_U')) {
    const checkR = await fetch(`${API_BASE}/api/nuser/account/get`, {
      headers: buildHeaders(cookies),
    })
    const checkData = await checkR.json() as any
    if (checkData.code === 200 && checkData.account?.status === 0) {
      return c.json({ code: 803, message: '登录成功' })
    }
  }

  return c.json(data)
})

// 检查登录状态
auth.get('/login/status', async (c) => {
  const cookies = await c.env.SESSION.get('cookies') || ''
  try {
    const r = await fetch(`${API_BASE}/api/nuser/account/get`, {
      headers: buildHeaders(cookies),
    })
    const data = await r.json() as any
    const loggedIn = data.code === 200 && data.account?.status === 0
    return c.json({ loggedIn, profile: data.profile || null })
  } catch {
    return c.json({ loggedIn: false })
  }
})

export default auth
