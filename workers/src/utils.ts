export const API_BASE = 'https://music.163.com'
export const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

export function buildHeaders(cookies: string, extra: Record<string, string> = {}): Record<string, string> {
  return {
    'User-Agent': UA,
    'Referer': 'https://music.163.com',
    ...(cookies ? { 'Cookie': cookies } : {}),
    ...extra,
  }
}

// 从 Set-Cookie 响应头中提取并合并 cookies
export function mergeCookies(existing: string, setCookieHeaders: string[]): string {
  if (setCookieHeaders.length === 0) return existing

  const newParts = setCookieHeaders.map(c => c.split(';')[0])
  const existingParts = existing ? existing.split('; ') : []
  const merged = new Map<string, string>()

  for (const p of [...existingParts, ...newParts]) {
    const key = p.split('=')[0]
    merged.set(key, p)
  }

  return [...merged.values()].join('; ')
}

// 从 Response 中提取 Set-Cookie 头
export function extractSetCookies(r: Response): string[] {
  // Workers 支持 getSetCookie()
  const raw = r.headers.get('Set-Cookie')
  if (!raw) return []
  // 单个 Set-Cookie 头可能包含多个 cookie（逗号分隔），但通常是一个
  // 多个 Set-Cookie 头会被合并为一个，用逗号分隔
  // 但 cookie 值中也可能有逗号（过期时间），所以需要更智能地拆分
  return splitSetCookie(raw)
}

function splitSetCookie(header: string): string[] {
  // 按 "xxx=xxx; " 模式拆分，保留参数部分
  const result: string[] = []
  let current = ''
  let inExpires = false

  for (let i = 0; i < header.length; i++) {
    const ch = header[i]
    if (header.substring(i, i + 8).toLowerCase() === 'expires=') {
      inExpires = true
    }
    if (inExpires && ch === ',') {
      current += ch
      // 跳过空格找到下一个字符
      i++
      // 检查下一个字符是否是日期（空格+数字）
      if (i < header.length && header[i] === ' ') {
        // 可能是 expires 的日期分隔
        current += header[i]
        continue
      }
      // 否则是新的 cookie
      result.push(current.trim())
      current = ''
      inExpires = false
      continue
    }
    current += ch
  }
  if (current.trim()) {
    result.push(current.trim())
  }
  return result
}
