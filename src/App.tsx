import { useState, useEffect, useRef } from 'react'

const CYAN = '#00c8f0'
const GREEN = '#00e882'
const RED = '#f05060'
const AMBER = '#f59e0b'
const BG = '#060c18'
const PANEL = 'rgba(8,15,30,0.92)'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'chat', label: 'Chat', icon: '◎' },
  { id: 'voice', label: 'Voice', icon: '◉' },
  { id: 'system', label: 'System', icon: '⬡' },
  { id: 'docker', label: 'Docker', icon: '◇' },
  { id: 'jenkins', label: 'Jenkins', icon: '⚙' },
  { id: 'azure', label: 'Azure / ADF', icon: '☁' },
  { id: 'kubernetes', label: 'Kubernetes', icon: '⎈' },
  { id: 'tableau', label: 'Tableau', icon: '▦' },
  { id: 'memory', label: 'Memory', icon: '▣' },
  { id: 'settings', label: 'Settings', icon: '◈' },
]

const QUICK_ACTIONS = [
  { label: 'help', cmd: 'help' },
  { label: 'check docker', cmd: 'check docker' },
  { label: 'system status', cmd: 'system status' },
  { label: 'open notepad', cmd: 'open notepad' },
  { label: 'create standup', cmd: 'create standup' },
  { label: 'remember this project is my JARVIS assistant', cmd: 'remember this project is my JARVIS assistant' },
  { label: 'show memory', cmd: 'show memory' },
  { label: 'azure adf help', cmd: 'azure adf help' },
  { label: 'tableau help', cmd: 'tableau help' },
  { label: 'jenkins help', cmd: 'jenkins help' },
]

type Msg = { role: 'user' | 'jarvis'; text: string; ts: string }

type StatusData = {
  status: string
  app_mode: string
  app_version: string
  integration_mode: string
  approval_required: boolean
}

type SystemInfo = {
  os?: string
  python_version?: string
  current_directory?: string
}

type Container = {
  name: string
  status: string
  port?: string
}

function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

function PulseCircle({ color, size = 7 }: { color: string; size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'inline-block',
      boxShadow: `0 0 8px ${color}`,
      animation: 'pulse 2s ease-in-out infinite',
      flexShrink: 0,
    }} />
  )
}

function CornerFrame({ color = CYAN, size = 14 }: { color?: string; size?: number }) {
  const s: React.CSSProperties = { position: 'absolute', background: color }
  return (
    <>
      <span style={{ ...s, top: 0, left: 0, width: size, height: 2 }} />
      <span style={{ ...s, top: 0, left: 0, width: 2, height: size }} />
      <span style={{ ...s, top: 0, right: 0, width: size, height: 2 }} />
      <span style={{ ...s, top: 0, right: 0, width: 2, height: size }} />
      <span style={{ ...s, bottom: 0, left: 0, width: size, height: 2 }} />
      <span style={{ ...s, bottom: 0, left: 0, width: 2, height: size }} />
      <span style={{ ...s, bottom: 0, right: 0, width: size, height: 2 }} />
      <span style={{ ...s, bottom: 0, right: 0, width: 2, height: size }} />
    </>
  )
}

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      position: 'relative', borderRadius: 10, padding: '14px 16px',
      background: PANEL, border: `1px solid rgba(0,200,240,0.12)`,
      ...style,
    }}>
      <CornerFrame />
      {children}
    </div>
  )
}

function PanelLabel({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: `rgba(0,200,240,0.55)`, marginBottom: 10 }}>
      {text}
    </div>
  )
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'jarvis', text: 'JARVIS Command Center online. All systems operational. Type "help" to see available commands.', ts: timestamp() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [containers, setContainers] = useState<Container[]>([])
  const [memoryCount, setMemoryCount] = useState(0)
  const [recentActions, setRecentActions] = useState<string[]>([])
  const [pendingApproval, setPendingApproval] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(timestamp())

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(timestamp()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    checkStatus()
    fetchSystemInfo()
    fetchContainers()
    fetchMemory()
  }, [])

  async function checkStatus() {
    try {
      const r = await fetch('http://localhost:8000/api/status')
      if (r.ok) {
        const d = await r.json()
        setStatusData(d)
        setBackendOnline(true)
      } else {
        setBackendOnline(false)
      }
    } catch {
      setBackendOnline(false)
    }
  }

  async function fetchSystemInfo() {
    try {
      const r = await fetch('http://localhost:8000/api/system/info')
      if (r.ok) setSystemInfo(await r.json())
    } catch {}
  }

  async function fetchContainers() {
    try {
      const r = await fetch('http://localhost:8000/api/docker/containers')
      if (r.ok) {
        const d = await r.json()
        setContainers(d.containers || [])
      }
    } catch {}
  }

  async function fetchMemory() {
    try {
      const r = await fetch('http://localhost:8000/api/memory')
      if (r.ok) {
        const d = await r.json()
        setMemoryCount(d.notes?.length ?? 0)
      }
    } catch {}
  }

  async function sendMessage(text: string) {
    const q = text.trim()
    if (!q || loading) return
    setInput('')
    const userMsg: Msg = { role: 'user', text: q, ts: timestamp() }
    setMessages(p => [...p, userMsg])
    setLoading(true)
    addRecentAction(q.length > 30 ? q.slice(0, 30) + '…' : q)

    try {
      const r = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      })
      if (!r.ok) throw new Error('non-ok')
      const d = await r.json()
      let reply = d.reply || 'Command acknowledged.'
      if (d.data?.examples?.length) {
        reply += '\n\nExamples:\n' + (d.data.examples as string[]).map(e => `• ${e}`).join('\n')
      }
      if (d.requires_approval) {
        setPendingApproval(d.pending_action || q)
      }
      setMessages(p => [...p, { role: 'jarvis', text: reply, ts: timestamp() }])
      if (q.toLowerCase().startsWith('remember')) fetchMemory()
      if (q.toLowerCase() === 'show memory') fetchMemory()
    } catch {
      setMessages(p => [...p, {
        role: 'jarvis',
        text: 'Backend is offline or unreachable. Start the backend:\n  cd opsnexus\n  docker run --rm -p 8000:8000 jarvis-backend',
        ts: timestamp()
      }])
    } finally {
      setLoading(false)
      setBackendOnline(backendOnline)
      inputRef.current?.focus()
    }
  }

  function addRecentAction(label: string) {
    setRecentActions(p => [label, ...p].slice(0, 8))
  }

  const sidebarW = 200

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      background: BG, color: '#dde8f2',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      overflow: 'hidden',
    }}>
      {/* SIDEBAR */}
      <aside style={{
        width: sidebarW, flexShrink: 0,
        background: 'rgba(4,8,18,0.98)',
        borderRight: `1px solid rgba(0,200,240,0.1)`,
        display: 'flex', flexDirection: 'column',
        padding: '0 0 16px',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{
          padding: '18px 16px 16px',
          borderBottom: `1px solid rgba(0,200,240,0.1)`,
          marginBottom: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: `linear-gradient(135deg, rgba(0,200,240,0.2), rgba(0,200,240,0.05))`,
              border: `1px solid rgba(0,200,240,0.45)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: CYAN, fontSize: 16, fontWeight: 800,
            }}>J</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', letterSpacing: '0.04em' }}>
                JAR<span style={{ color: CYAN }}>VIS</span>
              </div>
              <div style={{ fontSize: 9, color: `rgba(0,200,240,0.5)`, letterSpacing: '0.14em', fontWeight: 600 }}>
                COMMAND CENTER
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 8px' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                width: '100%', padding: '8px 10px', borderRadius: 7,
                marginBottom: 2, border: 'none', cursor: 'pointer',
                background: activePage === item.id ? `rgba(0,200,240,0.1)` : 'transparent',
                color: activePage === item.id ? CYAN : 'rgba(160,195,220,0.6)',
                fontSize: 12.5, fontWeight: activePage === item.id ? 600 : 400,
                transition: 'all 0.15s',
                fontFamily: 'inherit',
                borderLeft: activePage === item.id ? `2px solid ${CYAN}` : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Version */}
        <div style={{ padding: '10px 16px', borderTop: `1px solid rgba(0,200,240,0.08)` }}>
          <div style={{ fontSize: 9, color: `rgba(0,200,240,0.35)`, letterSpacing: '0.12em' }}>
            v{statusData?.app_version ?? '0.1.0'} · {statusData?.app_mode?.toUpperCase() ?? 'DEMO'}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* STATUS BAR */}
        <div style={{
          height: 40, flexShrink: 0,
          background: 'rgba(4,8,18,0.98)',
          borderBottom: `1px solid rgba(0,200,240,0.1)`,
          display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: 20,
        }}>
          <StatusPill
            label={backendOnline === null ? 'Connecting…' : backendOnline ? 'Backend Online' : 'Backend Offline'}
            color={backendOnline === null ? AMBER : backendOnline ? GREEN : RED}
          />
          <StatusPill label={`Mode: ${statusData?.app_mode?.toUpperCase() ?? 'DEMO'}`} color={CYAN} />
          <StatusPill label={`Approval: ${statusData?.approval_required ? 'ON' : 'OFF'}`} color={AMBER} />
          <StatusPill label={`Memory: ${memoryCount} notes`} color={GREEN} />
          {pendingApproval && (
            <StatusPill label="APPROVAL PENDING" color={RED} blink />
          )}
          <div style={{ marginLeft: 'auto', fontSize: 11, color: `rgba(0,200,240,0.6)`, fontFamily: 'monospace', letterSpacing: '0.06em' }}>
            {currentTime}
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* CENTER: Chat/Terminal */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px 8px 12px 12px' }}>

            {/* Chat window */}
            <Panel style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: 10, padding: 0 }}>
              {/* Terminal title bar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px',
                borderBottom: `1px solid rgba(0,200,240,0.1)`,
                background: 'rgba(0,200,240,0.03)',
                borderRadius: '10px 10px 0 0',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PulseCircle color={backendOnline ? GREEN : RED} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: `rgba(0,200,240,0.75)` }}>
                    JARVIS TERMINAL
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: `rgba(0,200,240,0.4)`, fontFamily: 'monospace' }}>
                    {messages.length} ENTRIES
                  </span>
                  <button
                    onClick={() => setMessages([{ role: 'jarvis', text: 'Terminal cleared. Ready.', ts: timestamp() }])}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`,
                      color: 'rgba(160,195,220,0.5)', borderRadius: 5, padding: '2px 8px',
                      fontSize: 10, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    CLEAR
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                {messages.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} />
                ))}
                {loading && <ThinkingBubble />}
                <div ref={chatEndRef} />
              </div>

              {/* Quick actions */}
              <div style={{
                padding: '8px 16px',
                borderTop: `1px solid rgba(0,200,240,0.07)`,
                display: 'flex', gap: 6, flexWrap: 'wrap',
                flexShrink: 0,
              }}>
                {QUICK_ACTIONS.map(a => (
                  <button
                    key={a.cmd}
                    onClick={() => sendMessage(a.cmd)}
                    disabled={loading}
                    style={{
                      padding: '3px 9px', borderRadius: 5, fontSize: 10.5, cursor: 'pointer',
                      background: 'rgba(0,200,240,0.05)', border: `1px solid rgba(0,200,240,0.15)`,
                      color: `rgba(0,200,240,0.65)`, fontFamily: 'inherit',
                      transition: 'all 0.15s', opacity: loading ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,200,240,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = CYAN } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,200,240,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,200,240,0.65)' }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{
                padding: '10px 16px',
                borderTop: `1px solid rgba(0,200,240,0.1)`,
                display: 'flex', gap: 10,
                borderRadius: '0 0 10px 10px',
                flexShrink: 0,
              }}>
                <span style={{ color: CYAN, fontSize: 13, alignSelf: 'center', fontFamily: 'monospace', flexShrink: 0 }}>
                  &gt;
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Enter command or ask JARVIS…"
                  disabled={loading}
                  style={{
                    flex: 1, background: 'rgba(4,8,18,0.9)',
                    border: `1px solid rgba(0,200,240,0.2)`,
                    borderRadius: 7, padding: '8px 12px',
                    color: 'rgba(200,220,240,0.9)', fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(0,200,240,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(0,200,240,0.2)')}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  style={{
                    padding: '8px 18px', borderRadius: 7, fontWeight: 700, fontSize: 12,
                    background: `linear-gradient(135deg, rgba(0,200,240,0.22), rgba(0,200,240,0.08))`,
                    border: `1px solid rgba(0,200,240,0.4)`, color: CYAN,
                    cursor: 'pointer', fontFamily: 'inherit',
                    opacity: loading || !input.trim() ? 0.45 : 1,
                    transition: 'opacity 0.15s',
                    letterSpacing: '0.06em',
                  }}
                >
                  SEND
                </button>
              </div>
            </Panel>
          </div>

          {/* RIGHT PANEL */}
          <div style={{
            width: 240, flexShrink: 0,
            padding: '12px 12px 12px 4px',
            display: 'flex', flexDirection: 'column', gap: 10,
            overflowY: 'auto',
          }}>

            {/* Active Modules */}
            <Panel>
              <PanelLabel text="ACTIVE MODULES" />
              {NAV_ITEMS.slice(0, 8).map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 0', borderBottom: `1px solid rgba(0,200,240,0.05)`,
                }}>
                  <span style={{ fontSize: 11, color: 'rgba(160,195,220,0.6)' }}>{item.label}</span>
                  <PulseCircle color={GREEN} size={5} />
                </div>
              ))}
            </Panel>

            {/* Docker Status */}
            <Panel>
              <PanelLabel text="DOCKER STATUS" />
              {containers.length === 0 ? (
                <div style={{ fontSize: 11, color: 'rgba(160,195,220,0.4)' }}>
                  Run "check docker" to fetch
                </div>
              ) : containers.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 0', borderBottom: `1px solid rgba(0,200,240,0.05)`,
                }}>
                  <span style={{ fontSize: 10.5, color: 'rgba(160,195,220,0.7)', fontFamily: 'monospace' }}>{c.name}</span>
                  <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: c.status === 'running' ? `rgba(0,232,130,0.1)` : `rgba(240,80,96,0.1)`, color: c.status === 'running' ? GREEN : RED, fontWeight: 700, letterSpacing: '0.06em' }}>
                    {c.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </Panel>

            {/* System Info */}
            <Panel>
              <PanelLabel text="SYSTEM INFO" />
              {systemInfo ? (
                <>
                  <InfoRow label="OS" value={systemInfo.os ?? '—'} />
                  <InfoRow label="Python" value={systemInfo.python_version ?? '—'} />
                  <InfoRow label="CWD" value={systemInfo.current_directory ? '…/' + (systemInfo.current_directory.split(/[\\/]/).pop() ?? '') : '—'} />
                </>
              ) : (
                <div style={{ fontSize: 11, color: 'rgba(160,195,220,0.4)' }}>Loading…</div>
              )}
            </Panel>

            {/* Pending Approval */}
            <Panel style={{ borderColor: pendingApproval ? `rgba(240,80,96,0.3)` : 'rgba(0,200,240,0.12)' }}>
              <PanelLabel text="PENDING APPROVAL" />
              {pendingApproval ? (
                <>
                  <div style={{ fontSize: 11, color: RED, marginBottom: 8, lineHeight: 1.5 }}>
                    {pendingApproval}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => { sendMessage('yes'); setPendingApproval(null) }}
                      style={{
                        flex: 1, padding: '5px', borderRadius: 5, fontSize: 10, cursor: 'pointer',
                        background: `rgba(0,232,130,0.1)`, border: `1px solid rgba(0,232,130,0.3)`,
                        color: GREEN, fontFamily: 'inherit', fontWeight: 700,
                      }}
                    >
                      APPROVE
                    </button>
                    <button
                      onClick={() => { setPendingApproval(null); setMessages(p => [...p, { role: 'jarvis', text: 'Action cancelled.', ts: timestamp() }]) }}
                      style={{
                        flex: 1, padding: '5px', borderRadius: 5, fontSize: 10, cursor: 'pointer',
                        background: `rgba(240,80,96,0.1)`, border: `1px solid rgba(240,80,96,0.3)`,
                        color: RED, fontFamily: 'inherit', fontWeight: 700,
                      }}
                    >
                      DENY
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: 'rgba(160,195,220,0.35)' }}>None pending</div>
              )}
            </Panel>

            {/* Memory */}
            <Panel>
              <PanelLabel text="MEMORY NOTES" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 24, fontWeight: 800, color: CYAN,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>{memoryCount}</span>
                <span style={{ fontSize: 11, color: 'rgba(160,195,220,0.5)' }}>notes stored</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(0,200,240,0.4)', marginTop: 4 }}>
                Type "show memory" to retrieve
              </div>
            </Panel>

            {/* Recent Actions */}
            <Panel style={{ flex: 1 }}>
              <PanelLabel text="RECENT ACTIONS" />
              {recentActions.length === 0 ? (
                <div style={{ fontSize: 11, color: 'rgba(160,195,220,0.35)' }}>No actions yet</div>
              ) : recentActions.map((a, i) => (
                <div key={i} style={{
                  fontSize: 10.5, color: 'rgba(160,195,220,0.55)',
                  padding: '3px 0', borderBottom: `1px solid rgba(0,200,240,0.05)`,
                  fontFamily: 'monospace',
                }}>
                  <span style={{ color: `rgba(0,200,240,0.35)`, marginRight: 5 }}>›</span>
                  {a}
                </div>
              ))}
            </Panel>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${BG}; }
        ::-webkit-scrollbar-thumb { background: rgba(0,200,240,0.18); border-radius: 2px; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
        @keyframes blinkRed { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        input::placeholder { color: rgba(100,140,170,0.4); }
      `}</style>
    </div>
  )
}

function StatusPill({ label, color, blink }: { label: string; color: string; blink?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: color,
        display: 'inline-block', boxShadow: `0 0 6px ${color}`,
        animation: blink ? 'blinkRed 1s infinite' : 'pulse 2s infinite',
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 10.5, color, fontWeight: 600, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: `1px solid rgba(0,200,240,0.05)` }}>
      <span style={{ fontSize: 10, color: 'rgba(100,140,170,0.55)', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ fontSize: 10, color: 'rgba(200,220,240,0.7)', fontFamily: 'monospace', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  )
}

function ChatBubble({ msg }: { msg: Msg }) {
  const isJarvis = msg.role === 'jarvis'
  return (
    <div style={{ display: 'flex', gap: 10, flexDirection: isJarvis ? 'row' : 'row-reverse' }}>
      <div style={{
        width: 30, height: 30, borderRadius: 7, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 800,
        background: isJarvis ? 'rgba(0,200,240,0.12)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${isJarvis ? 'rgba(0,200,240,0.3)' : 'rgba(255,255,255,0.1)'}`,
        color: isJarvis ? CYAN : 'rgba(200,220,240,0.65)',
        fontFamily: "'Space Grotesk', sans-serif",
      }}>
        {isJarvis ? 'J' : 'U'}
      </div>
      <div style={{ maxWidth: '78%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexDirection: isJarvis ? 'row' : 'row-reverse' }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: isJarvis ? CYAN : 'rgba(180,210,230,0.55)' }}>
            {isJarvis ? 'JARVIS' : 'YOU'}
          </span>
          <span style={{ fontSize: 9, color: 'rgba(100,140,170,0.4)', fontFamily: 'monospace' }}>{msg.ts}</span>
        </div>
        <div style={{
          padding: '9px 13px', borderRadius: isJarvis ? '2px 10px 10px 10px' : '10px 2px 10px 10px',
          background: isJarvis ? 'rgba(0,200,240,0.05)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isJarvis ? 'rgba(0,200,240,0.14)' : 'rgba(255,255,255,0.07)'}`,
          color: 'rgba(210,230,245,0.88)', fontSize: 12.5, lineHeight: 1.7,
          whiteSpace: 'pre-wrap', fontFamily: "'JetBrains Mono', monospace",
        }}>
          {msg.text}
        </div>
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 7, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,200,240,0.12)', border: `1px solid rgba(0,200,240,0.3)`,
        color: CYAN, fontSize: 10, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif",
      }}>J</div>
      <div style={{
        padding: '9px 14px', borderRadius: '2px 10px 10px 10px',
        background: 'rgba(0,200,240,0.05)', border: `1px solid rgba(0,200,240,0.14)`,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {[0, 1, 2].map(d => (
          <span key={d} style={{
            width: 6, height: 6, borderRadius: '50%', background: CYAN, display: 'inline-block',
            animation: `blink 1.2s ${d * 0.22}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}
