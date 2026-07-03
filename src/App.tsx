import { useState, useEffect, useCallback } from 'react'
import Layout from './components/Layout'
import Sidebar from './components/Sidebar'
import SearchView from './components/SearchView'
import LyricsPanel from './lyrics/LyricsPanel'
import PlayerBar from './player/PlayerBar'
import Visualizer from './components/Visualizer'
import { usePlayer, audio } from './player/usePlayer'
import { getLyrics } from './api/netease'
import { parseLRC } from './api/netease'
import type { Track, Lyrics } from './api/types'

function App() {
  const player = usePlayer()
  const [activeView, setActiveView] = useState<'search' | 'lyrics'>('search')
  const [lyrics, setLyrics] = useState<Lyrics | null>(null)

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
