import { Home, Search, ListMusic, Clock, Heart, TrendingUp } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export type View = 'discover' | 'search' | 'ranking' | 'playlist' | 'recent' | 'lyrics'

interface Props {
  activeView: View
  onViewChange: (view: View) => void
}

const navItems = [
  { id: 'discover' as View, label: '发现音乐', icon: Home },
  { id: 'search' as View, label: '搜索', icon: Search },
  { id: 'ranking' as View, label: '排行榜', icon: TrendingUp },
]

const libraryItems = [
  { id: 'recent' as View, label: '最近播放', icon: Clock },
  { id: 'playlist' as View, label: '我喜欢的音乐', icon: Heart },
]

export default function Sidebar({ activeView, onViewChange }: Props) {
  return (
    <aside className="w-52 border-r border-border flex flex-col shrink-0">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-6">
          {/* 主导航 */}
          <div>
            <p className="px-3 mb-2 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
              在线音乐
            </p>
            <nav className="space-y-0.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer
                    ${activeView === item.id
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 我的音乐 */}
          <div>
            <p className="px-3 mb-2 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
              我的音乐
            </p>
            <nav className="space-y-0.5">
              {libraryItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer
                    ${activeView === item.id
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 歌单列表 */}
          <div>
            <p className="px-3 mb-2 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
              创建的歌单
            </p>
            <nav className="space-y-0.5">
              <button
                onClick={() => onViewChange('playlist')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <ListMusic className="w-4 h-4" />
                默认歌单
              </button>
            </nav>
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}
