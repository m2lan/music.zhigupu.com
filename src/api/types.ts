// 网易云 API 类型

export interface Artist {
  id: number
  name: string
  picUrl?: string
}

export interface Album {
  id: number
  name: string
  picUrl: string
  picId?: number
  artist?: Artist
}

export interface Track {
  id: number
  name: string
  artists: Artist[]
  album: Album
  duration: number // ms
  url?: string // 播放链接
  fee?: number // 0:免费 1:VIP 8:付费
}

export interface Playlist {
  id: number
  name: string
  description: string
  coverImgUrl: string
  trackCount: number
  playCount: number
  tracks: Track[]
}

export interface SearchResult {
  result: {
    songs: Track[]
    songCount: number
    hasMore: boolean
  }
}

export interface LyricLine {
  time: number // 秒
  text: string
}

export interface Lyrics {
  lines: LyricLine[]
  translation?: LyricLine[]
}

export type PlayMode = 'list' | 'single' | 'shuffle'

export interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: Track[]
  currentIndex: number
  mode: PlayMode
}
