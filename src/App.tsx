import { useState, useEffect, useCallback } from 'react'
import Layout from './components/Layout'
import Sidebar from './components/Sidebar'
import SearchView from './components/SearchView'
import LyricsPanel from './lyrics/LyricsPanel'
import PlayerBar from './player/PlayerBar'
import Visualizer from './components/Visualizer'
import Login from './components/Login'
import { usePlayer, audio } from './player/usePlayer'
import { getLyrics, parseLRC } from './api/netease'
import type { Track, Lyrics } from './api/types'

const API = 'http://localhost:3001/api'

function App() {
  const player = usePlayer()
  const [activeView, setActiveView] = useState<'search' | 'lyrics'>('search')
  const [lyrics, setLyrics] = useState<Lyrics | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null) // null = 检查中

  // 检查登录状态
  useEffect(() => {
    fetch(`${API}/login/status`)
      .then(r => r.json())
      .then(data => setLoggedIn(data.loggedIn))
      .catch(() => setLoggedIn(false))
  }, [])

  // 加载歌词
  useEffect(() => {
    if (player.currentTrack) {
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

  const toggleLyrics = useCallback(() => {
    setActiveView(prev => prev === 'lyrics' ? 'search' : 'lyrics')
  }, [])

  // 加载中
  if (loggedIn === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-0">
        <div className="w-5 h-5 border-2 border-stone-700 border-t-stone-400 rounded-full animate-spin" />
      </div>
    )
  }

  // 未登录 — 显示登录页
  if (!loggedIn) {
    return (
      <div className="h-screen bg-surface-0 noise-overlay">
        <Login onLogin={() => setLoggedIn(true)} onSkip={() => setLoggedIn(true)} />
      </div>
    )
  }

  return (
    <Layout
      sidebar={
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      }
      visualizer={
        player.currentTrack ? (
          <Visualizer audioElement={audio} className="h-24 px-6 pt-4 shrink-0" />
        ) : undefined
      }
      playerBar={
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
          onToggleLyrics={toggleLyrics}
        />
      }
    >
      {activeView === 'search' ? (
        <SearchView
          onPlayTrack={handlePlayTrack}
          currentTrack={player.currentTrack}
        />
      ) : (
        <LyricsPanel
          lyrics={lyrics}
          currentTime={player.currentTime}
          className="flex-1"
        />
      )}
    </Layout>
  )
}

export default App
