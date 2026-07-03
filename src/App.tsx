import { useState, useEffect, useCallback } from 'react'
import TopBar from '@/components/layout/TopBar'
import Sidebar, { type View } from '@/components/layout/Sidebar'
import PlayerBar from '@/components/layout/PlayerBar'
import DiscoverView from '@/components/discover/DiscoverView'
import SearchView from '@/components/search/SearchView'
import PlaylistDetail from '@/components/playlist/PlaylistDetail'
import RankingView from '@/components/ranking/RankingView'
import RecentView from '@/components/recent/RecentView'
import LyricsPanel from '@/components/lyrics/LyricsPanel'
import Login from '@/components/Login'
import { TooltipProvider } from '@/components/ui/tooltip'
import { usePlayer } from '@/player/usePlayer'
import { getLyrics, parseLRC } from '@/api/netease'
import { addRecentTrack } from '@/utils/recent'
import type { Track, Lyrics } from '@/api/types'

const API = 'http://localhost:3001/api'

function App() {
  const player = usePlayer()
  const [view, setView] = useState<View>('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [playlistId, setPlaylistId] = useState<number | null>(null)
  const [lyrics, setLyrics] = useState<Lyrics | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  // 检查登录状态
  useEffect(() => {
    fetch(`${API}/login/status`)
      .then(r => r.json())
      .then(data => setLoggedIn(data.loggedIn))
      .catch(() => setLoggedIn(false))
  }, [])

  // 加载歌词 + 记录最近播放
  useEffect(() => {
    if (player.currentTrack) {
      addRecentTrack(player.currentTrack)
      getLyrics(player.currentTrack.id)
        .then(data => {
          const lines = parseLRC(data.lrc?.lyric || '')
          const translation = data.tlyric?.lyric ? parseLRC(data.tlyric.lyric) : undefined
          setLyrics({ lines, translation })
        })
        .catch(() => setLyrics(null))
    } else {
      setLyrics(null)
    }
  }, [player.currentTrack])

  const handlePlayTrack = useCallback((track: Track, queue: Track[]) => {
    player.playTrack(track, queue)
  }, [player.playTrack])

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setView('search')
    }
  }, [searchQuery])

  const handleOpenPlaylist = useCallback((id: number) => {
    setPlaylistId(id)
    setView('playlist')
  }, [])

  if (loggedIn === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 border-2 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <TooltipProvider>
        <div className="h-screen bg-background">
          <Login onLogin={() => setLoggedIn(true)} onSkip={() => setLoggedIn(true)} />
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          loggedIn={!!loggedIn}
          onLogin={() => {}}
        />

        <div className="flex flex-1 min-h-0">
          <Sidebar activeView={view} onViewChange={setView} />

          <main className="flex-1 overflow-y-auto">
            {view === 'discover' && (
              <DiscoverView onOpenPlaylist={handleOpenPlaylist} />
            )}
            {view === 'search' && (
              <SearchView
                onPlayTrack={handlePlayTrack}
                currentTrack={player.currentTrack}
                query={searchQuery}
              />
            )}
            {view === 'ranking' && (
              <RankingView
                onPlayTrack={handlePlayTrack}
                currentTrack={player.currentTrack}
              />
            )}
            {view === 'playlist' && playlistId && (
              <PlaylistDetail
                playlistId={playlistId}
                onBack={() => setView('discover')}
                onPlayTrack={handlePlayTrack}
                currentTrack={player.currentTrack}
              />
            )}
            {view === 'recent' && (
              <RecentView
                onPlayTrack={handlePlayTrack}
                currentTrack={player.currentTrack}
              />
            )}
            {view === 'lyrics' && (
              <LyricsPanel
                lyrics={lyrics}
                currentTime={player.currentTime}
                albumCover={player.currentTrack?.album.picUrl}
              />
            )}
          </main>
        </div>

        <PlayerBar
          currentTrack={player.currentTrack}
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          volume={player.volume}
          mode={player.mode}
          onTogglePlay={player.togglePlay}
          onPrev={player.playPrev}
          onNext={player.playNext}
          onSeek={player.seek}
          onVolumeChange={player.setVolume}
          onModeChange={player.setMode}
          onToggleLyrics={() => setView(v => v === 'lyrics' ? 'discover' : 'lyrics')}
        />
      </div>
    </TooltipProvider>
  )
}

export default App
