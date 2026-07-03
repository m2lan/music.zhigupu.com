import { useState, useEffect, useCallback } from 'react'
import PlaylistCard from './PlaylistCard'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight } from 'lucide-react'

import { API_BASE as API } from '@/api/config'

interface Playlist {
  id: number
  name: string
  coverImgUrl: string
  playCount: number
  description: string
}

interface Props {
  onOpenPlaylist: (id: number) => void
}

export default function DiscoverView({ onOpenPlaylist }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetch(`${API}/top/playlist?limit=12`)
      .then(r => r.json())
      .then(data => setPlaylists(data.playlists || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadMore = useCallback(async () => {
    setLoadingMore(true)
    try {
      const res = await fetch(`${API}/top/playlist?limit=30`)
      const data = await res.json()
      setPlaylists(data.playlists || [])
      setShowAll(true)
    } catch (e) {
      console.error('加载更多失败:', e)
    } finally {
      setLoadingMore(false)
    }
  }, [])

  return (
    <div className="p-6 space-y-8">
      {/* 推荐歌单 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">推荐歌单</h2>
            <p className="text-xs text-muted-foreground mt-0.5">根据你的喜好推荐</p>
          </div>
          {!showAll && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingMore ? '加载中...' : '查看更多'}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {playlists.map(p => (
              <PlaylistCard
                key={p.id}
                id={p.id}
                name={p.name}
                coverUrl={p.coverImgUrl}
                playCount={p.playCount}
                onClick={() => onOpenPlaylist(p.id)}
                onPlay={() => onOpenPlaylist(p.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
