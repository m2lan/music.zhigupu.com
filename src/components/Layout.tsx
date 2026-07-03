import type { ReactNode } from 'react'

interface Props {
  sidebar: ReactNode
  children: ReactNode
  playerBar: ReactNode
  visualizer?: ReactNode
}

export default function Layout({ sidebar, children, playerBar, visualizer }: Props) {
  return (
    <div className="noise-overlay h-screen flex flex-col bg-surface-0">
      <div className="flex flex-1 min-h-0">
        {sidebar}
        <main className="flex-1 flex flex-col min-w-0">
          {visualizer}
          {children}
        </main>
      </div>
      {playerBar}
    </div>
  )
}
