import { useAudioViz } from '../player/useAudioViz'

interface Props {
  audioElement: HTMLAudioElement | null
  className?: string
}

export default function Visualizer({ audioElement, className }: Props) {
  const { canvasRef, init } = useAudioViz(audioElement)

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        className="w-full h-full"
        onClick={init}
      />
      <p className="text-[10px] text-stone-600 text-center mt-1">
        点击启用可视化
      </p>
    </div>
  )
}
