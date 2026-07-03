interface Props {
  activeView: 'search' | 'lyrics'
  onViewChange: (view: 'search' | 'lyrics') => void
}

export default function Sidebar({ activeView, onViewChange }: Props) {
  return (
    <aside className="w-48 shrink-0 border-r border-stone-800/50 flex flex-col">
      {/* Logo */}
      <div className="px-5 pt-6 pb-8">
        <h1 className="text-lg font-light tracking-wider text-stone-400">
          沉
        </h1>
        <p className="text-[10px] text-stone-700 mt-1">CHEN PLAYER</p>
      </div>

      {/* 导航 */}
      <nav className="flex-1 px-3 space-y-0.5">
        <button
          onClick={() => onViewChange('search')}
          className={`
            w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer
            ${activeView === 'search'
              ? 'bg-stone-800/50 text-stone-300'
              : 'text-stone-500 hover:text-stone-400 hover:bg-stone-800/20'
            }
          `}
        >
          探索
        </button>
        <button
          onClick={() => onViewChange('lyrics')}
          className={`
            w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer
            ${activeView === 'lyrics'
              ? 'bg-stone-800/50 text-stone-300'
              : 'text-stone-500 hover:text-stone-400 hover:bg-stone-800/20'
            }
          `}
        >
          歌词
        </button>
      </nav>

      {/* 底部信息 */}
      <div className="px-5 pb-5">
        <p className="text-[10px] text-stone-800">
          powered by netease cloud music
        </p>
      </div>
    </aside>
  )
}
