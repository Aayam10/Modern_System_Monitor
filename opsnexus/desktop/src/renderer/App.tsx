import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TitleBar from './components/TitleBar'
import StatusBar from './components/StatusBar'
import { api } from './api'
import DashboardPage from './pages/DashboardPage'
import AssistantPage from './pages/AssistantPage'
import ActionsPage from './pages/ActionsPage'
import FileAnalyzerPage from './pages/FileAnalyzerPage'
import RunbooksPage from './pages/RunbooksPage'
import MemoryPage from './pages/MemoryPage'
import ActivityLogPage from './pages/ActivityLogPage'
import SettingsPage from './pages/SettingsPage'

export type PageId = 'dashboard' | 'assistant' | 'actions' | 'files' | 'runbooks' | 'memory' | 'activity' | 'settings'
export type Env = 'dev' | 'qa' | 'prod'

export default function App() {
  const [page, setPage] = useState<PageId>('dashboard')
  const [env, setEnv] = useState<Env>('dev')
  const [backendOnline, setBackendOnline] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        await api.health()
        setBackendOnline(true)
      } catch {
        setBackendOnline(false)
      }
    }
    check()
    const id = setInterval(check, 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <TitleBar backendOnline={backendOnline} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={page} onNavigate={setPage} />
        <main className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
          <StatusBar env={env} onEnvChange={setEnv} backendOnline={backendOnline} />
          <div className="flex-1 overflow-y-auto">
            {page === 'dashboard' && <DashboardPage backendOnline={backendOnline} />}
            {page === 'assistant' && <AssistantPage env={env} />}
            {page === 'actions' && <ActionsPage env={env} />}
            {page === 'files' && <FileAnalyzerPage />}
            {page === 'runbooks' && <RunbooksPage />}
            {page === 'memory' && <MemoryPage />}
            {page === 'activity' && <ActivityLogPage />}
            {page === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>
    </div>
  )
}
