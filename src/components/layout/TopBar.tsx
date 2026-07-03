import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Props {
  searchQuery: string
  onSearchChange: (q: string) => void
  onSearch: () => void
  loggedIn: boolean
  onLogin: () => void
}

export default function TopBar({ searchQuery, onSearchChange, onSearch, loggedIn, onLogin }: Props) {
  return (
    <header className="h-14 border-b border-border flex items-center px-4 gap-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 w-48 shrink-0">
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-xs font-medium">沉</span>
        </div>
        <span className="text-sm font-medium tracking-wide">CHEN</span>
      </div>

      {/* 搜索框 */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && onSearch()}
          placeholder="搜索音乐、歌手、歌词..."
          className="pl-9 h-9 bg-secondary/50 border-0 text-sm placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="flex-1" />

      {/* 用户 */}
      {loggedIn ? (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-xs">♪</span>
        </div>
      ) : (
        <button
          onClick={onLogin}
          className="px-4 py-1.5 text-xs bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
        >
          登录
        </button>
      )}
    </header>
  )
}
