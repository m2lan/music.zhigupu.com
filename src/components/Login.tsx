import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:3001/api'

interface Props {
  onLogin: () => void
  onSkip?: () => void
}

export default function Login({ onLogin, onSkip }: Props) {
  const [qrImg, setQrImg] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'scanned' | 'expired'>('loading')
  const [key, setKey] = useState('')

  const generateQR = useCallback(async () => {
    setStatus('loading')
    try {
      // 获取 key
      const keyRes = await fetch(`${API}/login/qrcode/key`, { method: 'POST' })
      const keyData = await keyRes.json()
      const k = keyData.unikey
      setKey(k)

      // 生成二维码
      const imgRes = await fetch(`${API}/login/qrcode/img?key=${k}`)
      const imgData = await imgRes.json()
      setQrImg(imgData.qr)
      setStatus('ready')
    } catch {
      setStatus('expired')
    }
  }, [])

  // 生成二维码
  useEffect(() => {
    generateQR()
  }, [generateQR])

  // 轮询扫码状态
  useEffect(() => {
    if (status !== 'ready' && status !== 'scanned') return

    const timer = setInterval(async () => {
      try {
        const r = await fetch(`${API}/login/qrcode/check?key=${key}`)
        const data = await r.json()

        if (data.code === 803) {
          // 登录成功
          clearInterval(timer)
          onLogin()
        } else if (data.code === 801) {
          // 等待扫码
          setStatus('ready')
        } else if (data.code === 802) {
          // 已扫码，等待确认
          setStatus('scanned')
        } else if (data.code === 800) {
          // 二维码过期
          clearInterval(timer)
          setStatus('expired')
        }
      } catch {
        // 忽略轮询错误
      }
    }, 2000)

    return () => clearInterval(timer)
  }, [status, key, onLogin])

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-light tracking-wider text-stone-400 mb-2">沉</h1>
        <p className="text-xs text-stone-600">CHEN PLAYER</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {qrImg ? (
          <img src={qrImg} alt="扫码登录" className="w-48 h-48 rounded-lg bg-white p-2" />
        ) : (
          <div className="w-48 h-48 rounded-lg bg-stone-800 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-stone-600 border-t-stone-400 rounded-full animate-spin" />
          </div>
        )}

        <div className="text-center">
          {status === 'ready' && (
            <p className="text-sm text-stone-400">打开网易云音乐 App 扫码登录</p>
          )}
          {status === 'scanned' && (
            <p className="text-sm text-stone-300">已扫码，请在手机上确认</p>
          )}
          {status === 'expired' && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-stone-500">二维码已过期</p>
              <button
                onClick={generateQR}
                className="px-4 py-1.5 text-xs text-stone-400 border border-stone-700
                           rounded-full hover:text-stone-200 hover:border-stone-500 transition-colors"
              >
                刷新二维码
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-center space-y-3">
        <p className="text-[10px] text-stone-700 max-w-xs">
          登录后可播放 VIP 歌曲
        </p>
        {onSkip && (
          <button
            onClick={onSkip}
            className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
          >
            跳过，先逛逛
          </button>
        )}
      </div>
    </div>
  )
}
