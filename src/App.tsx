import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

// ─── Constants ───────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000'
const AUTO_SEND_VOICE = false // set true to auto-send voice transcript

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'user' | 'jarvis' | 'system' | 'error'

interface Msg {
  id: string
  role: Role
  text: string
  ts: string
}

interface SysMetrics {
  cpu: number
  mem: number
  net: number
  gpu: number
  tmp: number
  uptime: string
  procs: number
}

// ─── Speech Recognition types (browser API, not in TS lib) ───────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SR = any

// ─── Helpers ──────────────────────────────────────────────────────────────────
let _id = 0
function mkMsg(role: Role, text: string): Msg {
  return { id: String(++_id), role, text, ts: new Date().toLocaleTimeString('en-US', { hour12: false }) }
}

function fmtNet(mbps: number): string {
  return mbps < 1 ? `${(mbps * 1024).toFixed(0)} KB/s` : `${mbps.toFixed(1)} MB/s`
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'chat',       label: 'Chat',       icon: '💬' },
  { id: 'voice',      label: 'Voice',      icon: '🎙' },
  { id: 'system',     label: 'System',     icon: '⚙' },
  { id: 'docker',     label: 'Docker',     icon: '🐳' },
  { id: 'jenkins',    label: 'Jenkins',    icon: '🔧' },
  { id: 'azure',      label: 'Azure / ADF',icon: '☁' },
  { id: 'kubernetes', label: 'Kubernetes', icon: '⎈' },
  { id: 'tableau',    label: 'Tableau',    icon: '📊' },
  { id: 'files',      label: 'Files',      icon: '📁' },
  { id: 'screen',     label: 'Screen',     icon: '🖥' },
  { id: 'memory',     label: 'Memory',     icon: '🧠' },
  { id: 'settings',   label: 'Settings',   icon: '⚙' },
]

const QUICK_CMDS = [
  'help', 'check docker', 'system status', 'open notepad', 'open calculator',
  'create standup', 'remember this is my JARVIS assistant', 'show memory',
  'jenkins help', 'azure adf help', 'kubernetes help', 'tableau help',
  'voice help', 'screen help',
]

// ─── MicIcon ──────────────────────────────────────────────────────────────────
function MicIcon({ listening, error }: { listening: boolean; error: boolean }) {
  const color = error ? 'var(--red)' : listening ? 'var(--pri)' : 'currentColor'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  )
}

// ─── SendIcon ─────────────────────────────────────────────────────────────────
function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="msg-row">
      <div className="msg-avatar jarvis">JV</div>
      <div className="typing-indicator">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
        <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginLeft: 4 }}>
          processing
        </span>
      </div>
    </div>
  )
}

// ─── MetricMini ───────────────────────────────────────────────────────────────
function MetricMini({ label, value, text, color }: { label: string; value: number; text: string; color: string }) {
  const c = value > 85 ? 'var(--red)' : value > 65 ? 'var(--amber)' : color
  return (
    <div className="metric-mini">
      <div className="metric-mini-header">
        <span className="metric-mini-label">{label}</span>
        <span className="metric-mini-val" style={{ color: c }}>{text}</span>
      </div>
      <div className="metric-mini-bar">
        <div className="metric-mini-fill" style={{ width: `${value}%`, background: c, boxShadow: `0 0 4px ${c}` }} />
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  // Core state
  const [messages, setMessages] = useState<Msg[]>([
    mkMsg('system', 'J.A.R.V.I.S Mark XXXIX initialising…'),
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeNav, setActiveNav] = useState('chat')

  // Backend state
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [memCount, setMemCount] = useState(0)
  const [pendingApproval, setPendingApproval] = useState<string | null>(null)
  const [recentActions, setRecentActions] = useState<{ text: string; ts: string; color: string }[]>([])

  // System metrics
  const [metrics, setMetrics] = useState<SysMetrics>({ cpu: 0, mem: 0, net: 0, gpu: -1, tmp: -1, uptime: '--:--', procs: 0 })

  // Voice state
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const recognitionRef = useRef<SR>(null)

  // Clock
  const [clock, setClock] = useState('')
  const [dateStr, setDateStr] = useState('')

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ─── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Clock
    const tick = () => {
      setClock(new Date().toLocaleTimeString('en-US', { hour12: false }))
      setDateStr(new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }))
    }
    tick()
    const t = setInterval(tick, 1000)

    // Check voice support
    const SR = (window as SR).SpeechRecognition || (window as SR).webkitSpeechRecognition
    setVoiceSupported(!!SR)

    // Backend check
    checkBackend()
    fetchMetrics()
    fetchMemory()
    const poll = setInterval(fetchMetrics, 5000)

    return () => { clearInterval(t); clearInterval(poll) }
  }, [])

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  // ─── Backend calls ─────────────────────────────────────────────────────────
  async function checkBackend() {
    try {
      const r = await fetch(`${API_BASE}/api/status`)
      if (!r.ok) throw new Error('non-ok')
      setBackendOnline(true)
      addMsg(mkMsg('system', 'SYS: Backend online. JARVIS Mark XXXIX ready.'))
    } catch {
      setBackendOnline(false)
      addMsg(mkMsg('error', 'ERR: Backend offline. Start with: docker run --rm -p 8000:8000 jarvis-backend'))
    }
  }

  async function fetchMetrics() {
    try {
      const r = await fetch(`${API_BASE}/api/system/info`)
      if (!r.ok) return
      const d = await r.json()
      setMetrics({
        cpu:    d.cpu_percent ?? 0,
        mem:    d.mem_percent ?? 0,
        net:    d.net_mbps ?? 0,
        gpu:    d.gpu ?? -1,
        tmp:    d.tmp ?? -1,
        uptime: d.uptime_hm ?? '--:--',
        procs:  d.proc_count ?? 0,
      })
    } catch { /* ignore */ }
  }

  async function fetchMemory() {
    try {
      const r = await fetch(`${API_BASE}/api/memory`)
      if (r.ok) { const d = await r.json(); setMemCount(d.count ?? 0) }
    } catch { /* ignore */ }
  }

  function addMsg(msg: Msg) {
    setMessages(p => [...p, msg])
  }

  function addAction(text: string, color = 'var(--text-dim)') {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false })
    setRecentActions(p => [{ text, ts, color }, ...p].slice(0, 8))
  }

  // ─── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const q = text.trim()
    if (!q || loading) return
    setInput('')
    setLoading(true)
    addMsg(mkMsg('user', q))
    addAction(`Sent: ${q.slice(0, 40)}${q.length > 40 ? '…' : ''}`, 'var(--text-med)')

    try {
      const r = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      })
      if (!r.ok) throw new Error('non-ok')
      const d = await r.json()
      let reply = d.reply || 'Acknowledged.'
      if (d.data?.examples?.length) {
        reply += '\n\n' + (d.data.examples as string[]).map((e: string) => `  › ${e}`).join('\n')
      }
      if (d.requires_approval) setPendingApproval(d.pending_action ?? q)
      addMsg(mkMsg('jarvis', reply))
      addAction(`JARVIS: ${reply.slice(0, 40)}…`, 'var(--pri)')
      if (q.toLowerCase().startsWith('remember') || q.toLowerCase() === 'show memory') fetchMemory()
    } catch {
      if (backendOnline === false) {
        addMsg(mkMsg('error', 'Backend is offline. Please start the backend service.'))
      } else {
        addMsg(mkMsg('error', 'ERR: Backend unreachable. Run: docker run --rm -p 8000:8000 jarvis-backend'))
        setBackendOnline(false)
      }
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [loading, backendOnline])

  // ─── Voice recognition ────────────────────────────────────────────────────
  function startListening() {
    if (!voiceSupported) {
      setVoiceError('Speech recognition is not available in this browser/runtime.')
      return
    }
    if (isListening) {
      stopListening()
      return
    }

    setVoiceError(null)
    const SR = (window as SR).SpeechRecognition || (window as SR).webkitSpeechRecognition
    const recognition: SR = new SR()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => {
      setIsListening(true)
      addMsg(mkMsg('system', 'Voice: Listening… speak now.'))
    }

    recognition.onresult = (event: SR) => {
      const transcript: string = event.results[0][0].transcript
      setInput(transcript)
      addMsg(mkMsg('system', `Voice captured: "${transcript}"`))
      if (AUTO_SEND_VOICE) {
        sendMessage(transcript)
      }
    }

    recognition.onerror = (event: SR) => {
      setIsListening(false)
      const code: string = event.error
      if (code === 'not-allowed' || code === 'permission-denied') {
        setVoiceError('Microphone access denied. Please allow microphone permission.')
      } else if (code === 'no-speech') {
        setVoiceError('No speech detected. Please try again.')
      } else if (code === 'audio-capture') {
        setVoiceError('Microphone not available. Check your audio device.')
      } else if (code === 'network') {
        setVoiceError('Network error during voice recognition.')
      } else {
        setVoiceError(`Voice error: ${code}`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }

  // ─── Derived status ────────────────────────────────────────────────────────
  const statusLabel = loading
    ? 'PROCESSING'
    : isListening
    ? 'LISTENING'
    : backendOnline === null
    ? 'CONNECTING'
    : backendOnline
    ? 'ONLINE'
    : 'OFFLINE'

  const statusDotClass = loading
    ? 'thinking'
    : backendOnline
    ? ''
    : 'offline'

  return (
    <div className="app-shell">
      <div className="scanline" />

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <header className="topbar">
        <span className="topbar-brand">J.A.R.V.I.S</span>
        <div className="topbar-sep" />
        <div className="topbar-badges">
          <div className={`topbar-badge ${backendOnline === true ? 'online' : backendOnline === false ? 'offline' : ''}`}>
            <span className={`dot ${backendOnline === true ? 'pulse' : ''}`} />
            {backendOnline === null ? 'CONNECTING' : backendOnline ? 'BACKEND ONLINE' : 'BACKEND OFFLINE'}
          </div>
          {voiceSupported && (
            <div className={`topbar-badge ${isListening ? 'listening' : ''}`}>
              <span className={`dot ${isListening ? 'pulse' : ''}`} />
              {isListening ? 'LISTENING' : 'VOICE READY'}
            </div>
          )}
          <div className="topbar-badge">
            <span className="dot" style={{ background: 'var(--amber)' }} />
            APPROVAL {pendingApproval ? 'PENDING' : 'IDLE'}
          </div>
          <div className="topbar-badge" style={{ color: 'var(--pri)' }}>
            MEM {memCount}
          </div>
          <div className="topbar-badge">DESKTOP</div>
        </div>
        <div className="topbar-right">
          <span className="topbar-date">{dateStr}</span>
          <span className="topbar-clock">{clock}</span>
        </div>
      </header>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-head">
          <div className="sidebar-title">J.A.R.V.I.S</div>
          <div className="sidebar-sub">MARK XXXIX · CLOUDOPS</div>
          <div className="sidebar-status">
            <div className={`sidebar-status-dot ${statusDotClass}`} />
            <span className="sidebar-status-label">{statusLabel}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Modules</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-btn ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveNav(item.id)
                if (item.id !== 'chat' && item.id !== 'voice') {
                  sendMessage(`${item.label.toLowerCase()} help`)
                }
              }}
            >
              <span style={{ fontSize: 11, flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-section-label" style={{ paddingTop: 0 }}>System</div>
          {[
            { label: 'CPU',  val: metrics.cpu,  text: `${metrics.cpu.toFixed(0)}%`,  color: 'var(--pri)' },
            { label: 'MEM',  val: metrics.mem,  text: `${metrics.mem.toFixed(0)}%`,  color: 'var(--amber)' },
            { label: 'GPU',  val: metrics.gpu >= 0 ? metrics.gpu : 0, text: metrics.gpu >= 0 ? `${metrics.gpu.toFixed(0)}%` : 'N/A', color: 'var(--green)' },
          ].map(m => (
            <div key={m.label} className="sidebar-metric">
              <span className="sidebar-metric-label">{m.label}</span>
              <span className={`sidebar-metric-val ${m.val > 85 ? 'hi' : ''}`}>{m.text}</span>
            </div>
          ))}
          <div className="sidebar-metric" style={{ marginTop: 4 }}>
            <span className="sidebar-metric-label">UPTIME</span>
            <span className="sidebar-metric-val" style={{ color: 'var(--green)' }}>{metrics.uptime}</span>
          </div>
          <div className="sidebar-metric">
            <span className="sidebar-metric-label">PROCS</span>
            <span className="sidebar-metric-val">{metrics.procs}</span>
          </div>
        </div>
      </aside>

      {/* ── CENTER CONSOLE ───────────────────────────────────────────────── */}
      <main className="console-wrap">
        <div className="console-header">
          <span className="console-header-title">JARVIS COMMAND INTERFACE</span>
          <span className="console-header-tag">
            {loading ? '● PROCESSING…' : isListening ? '🎙 LISTENING…' : `SESSION · ${new Date().toLocaleDateString()}`}
          </span>
        </div>

        <div className="chat-area">
          {backendOnline === false && (
            <div className="offline-banner">
              <span style={{ fontSize: 14 }}>⚠</span>
              <span>
                Backend offline. Start with:{' '}
                <code style={{ opacity: 0.8 }}>docker run --rm -p 8000:8000 jarvis-backend</code>
              </span>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id} className={`msg-row ${m.role === 'user' ? 'user' : ''}`}>
              <div className={`msg-avatar ${m.role === 'error' ? 'system' : m.role}`}>
                {m.role === 'user' ? 'YOU' : m.role === 'jarvis' ? 'JV' : m.role === 'error' ? '!' : '⚙'}
              </div>
              <div>
                <div className={`msg-bubble ${m.role}`}>{m.text}</div>
                <div className={`msg-meta ${m.role === 'user' ? 'user' : ''}`}>{m.ts}</div>
              </div>
            </div>
          ))}

          {loading && <TypingIndicator />}

          {voiceError && (
            <div className="voice-error">{voiceError}</div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="input-bar">
          <div className="input-wrap">
            <span className="input-prefix">›</span>
            <input
              ref={inputRef}
              className={`cmd-input ${isListening ? 'listening' : ''}`}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              placeholder={isListening ? 'Listening… speak now' : 'Type a command or question…'}
              disabled={loading}
              autoFocus
            />
          </div>
          <button
            className={`input-btn mic ${isListening ? 'active' : ''} ${voiceError ? 'error' : ''}`}
            onClick={startListening}
            title={
              !voiceSupported ? 'Speech recognition not supported'
              : isListening ? 'Click to stop listening'
              : 'Click to start voice input'
            }
          >
            <MicIcon listening={isListening} error={!!voiceError && !isListening} />
          </button>
          <button
            className="input-btn send"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
          >
            <SendIcon /> &nbsp;Send
          </button>
        </div>
      </main>

      {/* ── QUICK BAR ────────────────────────────────────────────────────── */}
      <div className="quick-bar">
        <span className="quick-label">QUICK ›</span>
        {QUICK_CMDS.map(cmd => (
          <button
            key={cmd}
            className="quick-btn"
            disabled={loading}
            onClick={() => sendMessage(cmd)}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <aside className="right-panel">

        {/* Pending approval */}
        {pendingApproval && (
          <div className="rpanel-section">
            <div className="rpanel-label">APPROVAL REQUIRED</div>
            <div className="approval-card">
              <div className="approval-text">{pendingApproval}</div>
              <div className="approval-btns">
                <button
                  className="approval-btn approve"
                  onClick={() => { setPendingApproval(null); sendMessage('yes') }}
                >
                  ▸ APPROVE
                </button>
                <button
                  className="approval-btn deny"
                  onClick={() => {
                    setPendingApproval(null)
                    addMsg(mkMsg('system', 'SYS: Action denied.'))
                  }}
                >
                  ✕ DENY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* System metrics */}
        <div className="rpanel-section">
          <div className="rpanel-label">SYSTEM STATUS</div>
          <MetricMini label="CPU" value={metrics.cpu} text={`${metrics.cpu.toFixed(0)}%`} color="var(--pri)" />
          <MetricMini label="MEM" value={metrics.mem} text={`${metrics.mem.toFixed(0)}%`} color="var(--amber)" />
          <MetricMini
            label="NET"
            value={Math.min(100, metrics.net * 10)}
            text={fmtNet(metrics.net)}
            color="var(--green)"
          />
          {metrics.gpu >= 0 && (
            <MetricMini label="GPU" value={metrics.gpu} text={`${metrics.gpu.toFixed(0)}%`} color="var(--pri)" />
          )}
          {metrics.tmp >= 0 && (
            <MetricMini
              label="TMP"
              value={Math.min(100, (metrics.tmp / 100) * 100)}
              text={`${metrics.tmp.toFixed(0)}°C`}
              color="var(--red)"
            />
          )}
          <div style={{ marginTop: 8 }}>
            {[
              { k: 'UPTIME',   v: metrics.uptime,      cls: 'green' },
              { k: 'PROCS',    v: String(metrics.procs), cls: '' },
              { k: 'BACKEND',  v: backendOnline === null ? 'CHECKING' : backendOnline ? 'ONLINE' : 'OFFLINE',
                cls: backendOnline ? 'green' : backendOnline === null ? 'amber' : 'red' },
              { k: 'MEMORY',   v: `${memCount} notes`, cls: 'pri' },
            ].map(row => (
              <div key={row.k} className="stat-row">
                <span className="stat-key">{row.k}</span>
                <span className={`stat-val ${row.cls}`}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Voice status */}
        <div className="rpanel-section">
          <div className="rpanel-label">VOICE MODULE</div>
          <div className="stat-row">
            <span className="stat-key">ENGINE</span>
            <span className={`stat-val ${voiceSupported ? 'green' : 'red'}`}>
              {voiceSupported ? 'AVAILABLE' : 'UNAVAILABLE'}
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-key">STATUS</span>
            <span className={`stat-val ${isListening ? 'pri' : ''}`}>
              {isListening ? 'LISTENING' : 'IDLE'}
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-key">AUTO-SEND</span>
            <span className={`stat-val ${AUTO_SEND_VOICE ? 'green' : ''}`}>
              {AUTO_SEND_VOICE ? 'ON' : 'OFF'}
            </span>
          </div>
          {!voiceSupported && (
            <div className="voice-error" style={{ marginTop: 8 }}>
              Browser speech recognition is unavailable in this runtime.
              Use the Electron desktop build for microphone support.
            </div>
          )}
          {voiceError && (
            <div className="voice-error" style={{ marginTop: 8 }}>{voiceError}</div>
          )}
        </div>

        {/* Recent actions */}
        <div className="rpanel-section" style={{ flex: 1 }}>
          <div className="rpanel-label">RECENT ACTIONS</div>
          {recentActions.length === 0 && (
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No actions yet.
            </div>
          )}
          {recentActions.map((a, i) => (
            <div key={i} className="action-item">
              <div className="action-bullet" style={{ background: a.color }} />
              <span className="action-text">{a.text}</span>
              <span className="action-time">{a.ts}</span>
            </div>
          ))}
        </div>

        {/* Mark info */}
        <div className="rpanel-section">
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 8,
            color: 'var(--text-muted)', letterSpacing: '0.1em',
            lineHeight: 1.8,
          }}>
            <div>FatihMakes Industries</div>
            <div>MARK XXXIX · CloudOps Edition</div>
            <div style={{ color: 'var(--border-hi)', marginTop: 2 }}>© STARK INDUSTRIES</div>
          </div>
        </div>
      </aside>
    </div>
  )
}
