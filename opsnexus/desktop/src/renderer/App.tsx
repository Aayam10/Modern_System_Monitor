import { useState, useEffect } from 'react'
import './styles/index.css'
import TopStatusBar from './components/TopStatusBar'
import Sidebar from './components/Sidebar'
import StatusBadge from './components/StatusBadge'
import { api } from './api'
import AssistantPage from './pages/AssistantPage'
import ActionsPage from './pages/ActionsPage'
import FileAnalyzerPage from './pages/FileAnalyzerPage'
import RunbooksPage from './pages/RunbooksPage'
import MemoryPage from './pages/MemoryPage'
import ActivityLogPage from './pages/ActivityLogPage'
import SettingsPage from './pages/SettingsPage'

export type PageId = 'assistant'|'actions'|'files'|'runbooks'|'memory'|'activity'|'settings'
export type Env = 'dev'|'qa'|'prod'

export default function App() {
  const [page, setPage] = useState<PageId>('assistant')
  const [env, setEnv]   = useState<Env>('dev')
  const [online, setOnline] = useState(false)

  useEffect(() => {
    const check = () => api.health().then(() => setOnline(true)).catch(() => setOnline(false))
    check()
    const id = setInterval(check, 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--base)' }}>
      {/* Title bar */}
      <TopStatusBar backendOnline={online} />

      {/* Body */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <Sidebar active={page} onNav={setPage} />

        {/* Main content area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <StatusBadge env={env} onEnv={setEnv} backendOnline={online} />

          <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
            {page === 'assistant' && <AssistantPage env={env} />}
            {page === 'actions'   && <ActionsPage env={env} />}
            {page === 'files'     && <FileAnalyzerPage />}
            {page === 'runbooks'  && <RunbooksPage />}
            {page === 'memory'    && <MemoryPage />}
            {page === 'activity'  && <ActivityLogPage />}
            {page === 'settings'  && <SettingsPage />}
          </div>
        </div>
      </div>
    </div>
  )
}
