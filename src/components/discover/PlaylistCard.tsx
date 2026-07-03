import { Play, Headphones } from 'lucide-react'

interface Props {
  id: number
  name: string
  coverUrl: string
  playCount: number
  onClick: () => void
  onPlay: () => void
}

function formatCount(n: number): string {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}亿`
  if (n >= 10000) return `${Math.floor(n / 10000)}万`
  return String(n)
}

export default function PlaylistCard({ name, coverUrl, playCount, onClick, onPlay }: Props) {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary mb-2">
        {coverUrl ? (
          <img src={coverUrl + '?param=300y300'} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl text-muted-foreground/30">♪</span>
          </div>
        )}

        {/* 播放量 */}
        <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-white/80 bg-black/40 rounded-full px-1.5 py-0.5">
          <Headphones className="w-3 h-3" />
          {formatCount(playCount)}
        </div>

        {/* 播放按钮 */}
        <button
          onClick={e => { e.stopPropagation(); onPlay() }}
          className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-foreground text-background
                     flex items-center justify-center opacity-0 group-hover:opacity-100
                     translate-y-2 group-hover:translate-y-0 transition-all shadow-lg cursor-pointer"
        >
          <Play className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      <p className="text-sm text-foreground/80 line-clamp-2 leading-tight">{name}</p>
    </div>
  )
}
