import { useState, useEffect, useCallback } from 'react'
import { Music, Headphones, Disc3 } from 'lucide-react'

import { API_BASE as API } from '@/api/config'

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
      const keyRes = await fetch(`${API}/login/qrcode/key`, { method: 'POST' })
      const keyData = await keyRes.json()
      const k = keyData.unikey
      setKey(k)

      const imgRes = await fetch(`${API}/login/qrcode/img?key=${k}`)
      const imgData = await imgRes.json()
      setQrImg(imgData.qr)
      setStatus('ready')
    } catch {
      setStatus('expired')
    }
  }, [])

  useEffect(() => {
    generateQR()
  }, [generateQR])

  useEffect(() => {
    if (status !== 'ready' && status !== 'scanned') return

    const timer = setInterval(async () => {
      try {
        const r = await fetch(`${API}/login/qrcode/check?key=${key}`)
        const data = await r.json()

        if (data.code === 803) {
          clearInterval(timer)
          onLogin()
        } else if (data.code === 801) {
          setStatus('ready')
        } else if (data.code === 802) {
          setStatus('scanned')
        } else if (data.code === 800) {
          clearInterval(timer)
          setStatus('expired')
        }
      } catch {}
    }, 2000)

    return () => clearInterval(timer)
  }, [status, key, onLogin])

  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      {/* 动态背景 */}
      <div className="absolute inset-0 -z-10">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-neutral-900 to-zinc-900" />

        {/* 装饰性光晕 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-purple-500/5 via-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }} />

        {/* 网格装饰 */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo 区域 */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
            <Disc3 className="w-10 h-10 text-white/80 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <h1 className="text-5xl font-light tracking-[0.3em] text-white mb-3">沉</h1>
          <p className="text-sm text-white/40 tracking-[0.5em] uppercase">Chen Player</p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-[380px]">
          {/* 二维码区域 */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {/* 二维码外框 */}
              <div className="absolute -inset-3 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl" />
              <div className="relative bg-white rounded-xl p-3 shadow-2xl">
                {qrImg ? (
                  <img src={qrImg} alt="扫码登录" className="w-52 h-52" />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* 扫码状态指示 */}
              {status === 'scanned' && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500/90 text-white text-xs rounded-full font-medium shadow-lg">
                  已扫码
                </div>
              )}
            </div>
          </div>

          {/* 状态文字 */}
          <div className="text-center mb-6">
            {status === 'ready' && (
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">扫码登录</p>
                <p className="text-white/40 text-xs">使用网易云音乐 App 扫描二维码</p>
              </div>
            )}
            {status === 'scanned' && (
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">已扫码</p>
                <p className="text-white/40 text-xs">请在手机上确认登录</p>
              </div>
            )}
            {status === 'expired' && (
              <div>
                <p className="text-white/60 text-sm mb-3">二维码已过期</p>
                <button
                  onClick={generateQR}
                  className="px-6 py-2 text-sm text-white/80 bg-white/10 hover:bg-white/20
                             rounded-lg transition-colors border border-white/10"
                >
                  刷新二维码
                </button>
              </div>
            )}
          </div>

          {/* 分隔线 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">或</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* 跳过按钮 */}
          {onSkip && (
            <button
              onClick={onSkip}
              className="w-full py-2.5 text-sm text-white/60 hover:text-white/80 bg-white/5 hover:bg-white/10
                         rounded-lg transition-colors border border-white/10"
            >
              先逛逛，稍后登录
            </button>
          )}
        </div>

        {/* 底部提示 */}
        <div className="mt-8 flex items-center gap-6 text-white/20 text-xs">
          <div className="flex items-center gap-2">
            <Music className="w-3.5 h-3.5" />
            <span>海量曲库</span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="w-3.5 h-3.5" />
            <span>高品质音质</span>
          </div>
        </div>
      </div>
    </div>
  )
}
