import { useRef, useEffect, useCallback } from 'react'

export function useAudioViz(audioElement: HTMLAudioElement | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number>(0)

  const init = useCallback(() => {
    if (!audioElement || analyserRef.current) return

    const ctx = new AudioContext()
    const source = ctx.createMediaElementSource(audioElement)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8

    source.connect(analyser)
    analyser.connect(ctx.destination)
    analyserRef.current = analyser
  }, [audioElement])

  useEffect(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')!
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      // 只取低频部分（前 1/3）
      const barCount = Math.floor(bufferLength / 3)
      const barWidth = width / barCount
      const centerY = height / 2

      ctx.beginPath()
      ctx.moveTo(0, centerY)

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i] / 255
        const amplitude = value * centerY * 0.8

        const x = i * barWidth
        // 对称波形：上半部分
        const y = centerY - amplitude

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          // 贝塞尔曲线平滑
          const prevX = (i - 1) * barWidth
          const cpX = (prevX + x) / 2
          ctx.quadraticCurveTo(cpX, centerY - (dataArray[i - 1] / 255) * centerY * 0.8, x, y)
        }
      }

      // 渐变描边
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, 'rgba(100, 116, 139, 0.1)')
      gradient.addColorStop(0.3, 'rgba(100, 116, 139, 0.4)')
      gradient.addColorStop(0.5, 'rgba(148, 163, 184, 0.6)')
      gradient.addColorStop(0.7, 'rgba(100, 116, 139, 0.4)')
      gradient.addColorStop(1, 'rgba(100, 116, 139, 0.1)')

      ctx.strokeStyle = gradient
      ctx.lineWidth = 1.5
      ctx.stroke()

      // 对称下半部分
      ctx.beginPath()
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i] / 255
        const amplitude = value * centerY * 0.8
        const x = i * barWidth
        const y = centerY + amplitude

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          const prevX = (i - 1) * barWidth
          const cpX = (prevX + x) / 2
          ctx.quadraticCurveTo(cpX, centerY + (dataArray[i - 1] / 255) * centerY * 0.8, x, y)
        }
      }

      ctx.strokeStyle = gradient
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [canvasRef.current, analyserRef.current])

  return { canvasRef, init }
}
