import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Color constants (mirrors ui.py C class) ────────────────────────────────
const C = {
  BG:       '#00060a',
  PANEL:    '#010d14',
  PANEL2:   '#010f18',
  BORDER:   '#0d3347',
  BORDER_B: '#1a5c7a',
  BORDER_A: '#0f4060',
  PRI:      '#00d4ff',
  PRI_DIM:  '#007a99',
  PRI_GHO:  '#001f2e',
  ACC:      '#ff6b00',
  ACC2:     '#ffcc00',
  GREEN:    '#00ff88',
  GREEN_D:  '#00aa55',
  RED:      '#ff3355',
  MUTED_C:  '#ff3366',
  TEXT:     '#8ffcff',
  TEXT_DIM: '#3a8a9a',
  TEXT_MED: '#5ab8cc',
  WHITE:    '#d8f8ff',
  DARK:     '#000d14',
  BAR_BG:   '#011520',
}

type JarvisState = 'INITIALISING' | 'LISTENING' | 'SPEAKING' | 'THINKING' | 'PROCESSING' | 'MUTED' | 'OFFLINE'
type Msg = { role: 'user' | 'jarvis' | 'sys' | 'file' | 'err'; text: string; ts: string }

function ts() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

// ─── HUD Canvas ─────────────────────────────────────────────────────────────
function HudCanvas({ state, muted }: { state: JarvisState; muted: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const stateRef = useRef(state)
  const mutedRef = useRef(muted)

  useEffect(() => { stateRef.current = state }, [state])
  useEffect(() => { mutedRef.current = muted }, [muted])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    if (!ctx) return

    let tick = 0
    let scale = 1.0, tgtScale = 1.0
    let halo = 55.0, tgtHalo = 55.0
    let lastT = performance.now()
    let scan = 0, scan2 = 180
    const rings = [0, 120, 240]
    let pulses: number[] = [0, 50, 100]
    const particles: { x: number; y: number; vx: number; vy: number; life: number }[] = []
    let blink = true, blinkTick = 0

    function step(now: DOMHighResTimeStamp) {
      const canvas2 = canvasRef.current
      if (!canvas2) return
      const W = canvas2.width, H = canvas2.height
      const st = stateRef.current
      const mt = mutedRef.current
      const speaking = st === 'SPEAKING'
      const cx = W / 2, cy = H / 2
      const fw = Math.min(W, H)

      // target scale/halo
      if (now - lastT > (speaking ? 120 : 500)) {
        if (speaking) {
          tgtScale = 1.06 + Math.random() * 0.08
          tgtHalo = 145 + Math.random() * 45
        } else if (mt) {
          tgtScale = 0.998 + Math.random() * 0.004
          tgtHalo = 15 + Math.random() * 13
        } else {
          tgtScale = 1.001 + Math.random() * 0.007
          tgtHalo = 48 + Math.random() * 20
        }
        lastT = now
      }
      const sp = speaking ? 0.38 : 0.15
      scale += (tgtScale - scale) * sp
      halo += (tgtHalo - halo) * sp

      // ring rotation
      const speeds = speaking ? [1.3, -0.9, 2.0] : [0.55, -0.35, 0.9]
      for (let i = 0; i < 3; i++) rings[i] = (rings[i] + speeds[i]) % 360
      scan = (scan + (speaking ? 3.0 : 1.3)) % 360
      scan2 = (scan2 + (speaking ? -2.0 : -0.75) + 360) % 360

      // pulses
      const pspd = speaking ? 4.2 : 2.0
      const plim = fw * 0.74
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i] += pspd
        if (pulses[i] >= plim) pulses.splice(i, 1)
      }
      if (pulses.length < 3 && Math.random() < (speaking ? 0.07 : 0.025)) {
        pulses.push(0)
      }

      // particles
      if (speaking && Math.random() < 0.28) {
        const ang = Math.random() * Math.PI * 2
        const rs = fw * 0.28
        particles.push({
          x: cx + Math.cos(ang) * rs, y: cy + Math.sin(ang) * rs,
          vx: Math.cos(ang) * (0.9 + Math.random() * 1.5),
          vy: Math.sin(ang) * (0.9 + Math.random() * 1.5) - 0.4,
          life: 1.0,
        })
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.97; p.vy *= 0.97
        p.life -= 0.028
        if (p.life <= 0) particles.splice(i, 1)
      }

      blink_tick: {
        blinkTick++
        if (blinkTick >= 38) { blink = !blink; blinkTick = 0 }
      }

      // ─── Draw ──────────────────────────────────────────────────────────
      ctx.fillStyle = C.BG
      ctx.fillRect(0, 0, W, H)

      const priColor = mt ? C.MUTED_C : C.PRI

      // grid dots
      ctx.fillStyle = C.PRI_GHO
      for (let x = 0; x < W; x += 48)
        for (let y = 0; y < H; y += 48)
          ctx.fillRect(x, y, 1, 1)

      // halo glow
      const rFace = fw * 0.31
      for (let i = 0; i < 10; i++) {
        const r = rFace * (1.8 - i * 0.08)
        const a = Math.max(0, Math.min(1, halo * 0.085 * (1 - i / 10)))
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = hexA(priColor, a)
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // pulse rings
      for (const pr of pulses) {
        const a = Math.max(0, 230 * (1 - pr / (fw * 0.74))) / 255
        ctx.beginPath()
        ctx.arc(cx, cy, pr, 0, Math.PI * 2)
        ctx.strokeStyle = hexA(priColor, a)
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // spinning arc rings
      const ringDefs: [number, number, number, number][] = [
        [0.48, 3, 115, 78], [0.40, 2, 78, 55], [0.32, 1, 56, 40]
      ]
      for (let idx = 0; idx < 3; idx++) {
        const [rFrac, lw, arcLen, gap] = ringDefs[idx]
        const ringR = fw * rFrac
        const base = rings[idx]
        const a = Math.max(0, Math.min(1, halo * (1 - idx * 0.18) / 255))
        ctx.strokeStyle = hexA(priColor, a)
        ctx.lineWidth = lw
        let angle = base
        while (angle < base + 360) {
          ctx.beginPath()
          ctx.arc(cx, cy, ringR, toRad(angle), toRad(angle + arcLen))
          ctx.stroke()
          angle += arcLen + gap
        }
      }

      // scanners
      const sr = fw * 0.50
      const sa = Math.min(1, halo * 1.5 / 255)
      const ex = speaking ? 75 : 44
      ctx.strokeStyle = hexA(priColor, sa)
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(cx, cy, sr, toRad(scan), toRad(scan + ex))
      ctx.stroke()
      ctx.strokeStyle = hexA(C.ACC, sa * 0.5)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, sr, toRad(scan2), toRad(scan2 + ex))
      ctx.stroke()

      // tick marks
      const tOut = fw * 0.497, tIn = fw * 0.474
      ctx.strokeStyle = hexA(C.PRI, 0.55)
      ctx.lineWidth = 1
      for (let deg = 0; deg < 360; deg += 10) {
        const rad = toRad(deg)
        const inn = deg % 30 === 0 ? tIn : tIn + 6
        ctx.beginPath()
        ctx.moveTo(cx + tOut * Math.cos(rad), cy - tOut * Math.sin(rad))
        ctx.lineTo(cx + inn * Math.cos(rad), cy - inn * Math.sin(rad))
        ctx.stroke()
      }

      // crosshair
      const chR = fw * 0.51, gapH = fw * 0.16
      ctx.strokeStyle = hexA(C.PRI, halo * 0.5 / 255)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx - chR, cy); ctx.lineTo(cx - gapH, cy)
      ctx.moveTo(cx + gapH, cy); ctx.lineTo(cx + chR, cy)
      ctx.moveTo(cx, cy - chR); ctx.lineTo(cx, cy - gapH)
      ctx.moveTo(cx, cy + gapH); ctx.lineTo(cx, cy + chR)
      ctx.stroke()

      // corner brackets
      const bl = 24
      const hl = cx - fw / 2, hr = cx + fw / 2
      const ht = cy - fw / 2, hb = cy + fw / 2
      ctx.strokeStyle = hexA(C.PRI, 0.82)
      ctx.lineWidth = 2
      for (const [bx, by, dx, dy] of [[hl,ht,1,1],[hr,ht,-1,1],[hl,hb,1,-1],[hr,hb,-1,-1]] as [number,number,number,number][]) {
        ctx.beginPath()
        ctx.moveTo(bx, by); ctx.lineTo(bx + dx * bl, by)
        ctx.moveTo(bx, by); ctx.lineTo(bx, by + dy * bl)
        ctx.stroke()
      }

      // face orb (no image — pure canvas)
      const orbR = fw * 0.27 * scale
      const oc = mt ? [200, 0, 50] : [0, 60, 110]
      for (let i = 8; i > 0; i--) {
        const r2 = orbR * i / 8
        const frc = i / 8
        const a = Math.max(0, Math.min(1, halo * 1.1 * frc / 255))
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r2)
        grad.addColorStop(0, `rgba(${Math.round(oc[0]*frc*1.5)},${Math.round(oc[1]*frc*2)},${Math.round(oc[2]*frc*2.5)},${a})`)
        grad.addColorStop(1, `rgba(${Math.round(oc[0]*frc)},${Math.round(oc[1]*frc)},${Math.round(oc[2]*frc)},0)`)
        ctx.beginPath()
        ctx.arc(cx, cy, r2, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }
      // J.A.R.V.I.S text inside orb
      ctx.font = `bold 14px "Courier New", monospace`
      ctx.fillStyle = hexA(C.PRI, Math.min(1, halo * 2 / 255))
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('J.A.R.V.I.S', cx, cy)

      // particles
      for (const pt of particles) {
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = hexA(C.PRI, pt.life)
        ctx.fill()
      }

      // status text
      const sy = cy + fw * 0.40
      let stTxt = '', stCol = C.PRI
      if (mt) { stTxt = '⊘ MUTED'; stCol = C.MUTED_C }
      else if (speaking) { stTxt = '● SPEAKING'; stCol = C.ACC }
      else if (st === 'THINKING') { stTxt = `${blink ? '◈' : '◇'} THINKING`; stCol = C.ACC2 }
      else if (st === 'PROCESSING') { stTxt = `${blink ? '▷' : '▶'} PROCESSING`; stCol = C.ACC2 }
      else if (st === 'LISTENING') { stTxt = `${blink ? '●' : '○'} LISTENING`; stCol = C.GREEN }
      else if (st === 'OFFLINE') { stTxt = `${blink ? '●' : '○'} OFFLINE`; stCol = C.RED }
      else { stTxt = `${blink ? '●' : '○'} ${st}`; stCol = C.PRI }

      ctx.font = `bold 12px "Courier New", monospace`
      ctx.fillStyle = stCol
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(stTxt, cx, sy)

      // waveform
      const wy = sy + 30
      const N = 36, bw = 8
      const wx0 = (W - N * bw) / 2
      for (let i = 0; i < N; i++) {
        let hgt: number, cl: string
        if (mt) { hgt = 2; cl = C.MUTED_C }
        else if (speaking) {
          hgt = 3 + Math.floor(Math.random() * 18)
          cl = hgt > 12 ? C.PRI : C.PRI_DIM
        } else {
          hgt = 3 + Math.round(2 * Math.sin(tick * 0.09 + i * 0.6))
          cl = C.BORDER_B
        }
        ctx.fillStyle = cl
        ctx.fillRect(wx0 + i * bw, wy + 20 - hgt, bw - 1, hgt)
      }

      tick++
      animRef.current = requestAnimationFrame(step)
    }

    animRef.current = requestAnimationFrame(step as FrameRequestCallback)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

function hexA(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`
}

function toRad(deg: number) { return (deg * Math.PI) / 180 }

// ─── MetricBar ───────────────────────────────────────────────────────────────
function MetricBar({ label, value, text, color }: { label: string; value: number; text: string; color: string }) {
  const col = value > 85 ? C.RED : value > 65 ? C.ACC : color
  return (
    <div style={{ background: C.PANEL2, border: `1px solid ${C.BORDER_A}`, borderRadius: 4, padding: '5px 8px', marginBottom: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 8, fontFamily: 'Courier New', color: C.TEXT_DIM, fontWeight: 700 }}>{label}</span>
        <span style={{ fontSize: 9, fontFamily: 'Courier New', color: col, fontWeight: 700 }}>{text}</span>
      </div>
      <div style={{ height: 3, background: C.BAR_BG, borderRadius: 2 }}>
        <div style={{ height: 3, width: `${value}%`, background: col, borderRadius: 2, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

// ─── LogWidget ───────────────────────────────────────────────────────────────
function LogWidget({ messages }: { messages: Msg[] }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function msgColor(role: Msg['role']) {
    if (role === 'jarvis') return C.PRI
    if (role === 'user') return C.WHITE
    if (role === 'err') return C.RED
    if (role === 'file') return C.GREEN
    return C.ACC2
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto', background: C.PANEL,
      border: `1px solid ${C.BORDER}`, borderRadius: 4,
      padding: 8, fontFamily: 'Courier New', fontSize: 11,
    }}>
      {messages.map((m, i) => (
        <div key={i} style={{ color: msgColor(m.role), marginBottom: 3, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {m.text}
        </div>
      ))}
      {messages.length === 0 && (
        <div style={{ color: C.TEXT_DIM, fontSize: 10 }}>No activity yet.</div>
      )}
      <div ref={endRef} />
    </div>
  )
}

// ─── Quick commands ──────────────────────────────────────────────────────────
const QUICK_CMDS = [
  'help', 'check docker', 'system status', 'open notepad',
  'create standup', 'remember this project is my JARVIS assistant',
  'show memory', 'azure adf help', 'tableau help', 'jenkins help',
]

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [jarvisState, setJarvisState] = useState<JarvisState>('INITIALISING')
  const [muted, setMuted] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'sys', text: 'SYS: J.A.R.V.I.S initialising…', ts: ts() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

  // sys metrics
  const [metrics, setMetrics] = useState({ cpu: 0, mem: 0, net: 0, gpu: -1, tmp: -1 })
  const [uptime, setUptime] = useState('--:--')
  const [procs, setProcs] = useState('--')

  // right panel
  const [memCount, setMemCount] = useState(0)
  const [pendingApproval, setPendingApproval] = useState<string | null>(null)

  // clock
  const [clock, setClock] = useState('')
  const [dateStr, setDateStr] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  // clock tick
  useEffect(() => {
    function tick() {
      const now = new Date()
      setClock(now.toLocaleTimeString('en-US', { hour12: false }))
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  // status poll
  useEffect(() => {
    checkBackend()
    fetchMetrics()
    fetchMemory()
    const t = setInterval(() => { fetchMetrics() }, 3000)
    return () => clearInterval(t)
  }, [])

  async function checkBackend() {
    try {
      const r = await fetch('http://localhost:8000/api/status')
      if (r.ok) {
        setBackendOnline(true)
        setJarvisState('LISTENING')
        addLog({ role: 'sys', text: 'SYS: Backend online. JARVIS ready.', ts: ts() })
      } else throw new Error()
    } catch {
      setBackendOnline(false)
      setJarvisState('OFFLINE')
      addLog({ role: 'err', text: 'ERR: Backend offline. Start Docker backend on :8000', ts: ts() })
    }
  }

  async function fetchMetrics() {
    try {
      const r = await fetch('http://localhost:8000/api/system/info')
      if (!r.ok) return
      const d = await r.json()
      if (d.cpu_percent !== undefined) setMetrics({ cpu: d.cpu_percent, mem: d.mem_percent, net: d.net_mbps ?? 0, gpu: d.gpu ?? -1, tmp: d.tmp ?? -1 })
      if (d.uptime_hm) setUptime(d.uptime_hm)
      if (d.proc_count) setProcs(String(d.proc_count))
    } catch {}
  }

  async function fetchMemory() {
    try {
      const r = await fetch('http://localhost:8000/api/memory')
      if (r.ok) { const d = await r.json(); setMemCount(d.count ?? 0) }
    } catch {}
  }

  function addLog(msg: Msg) {
    setMessages(p => [...p, msg])
  }

  const sendMessage = useCallback(async (text: string) => {
    const q = text.trim()
    if (!q || loading) return
    setInput('')
    setLoading(true)
    setJarvisState('THINKING')
    addLog({ role: 'user', text: `You: ${q}`, ts: ts() })

    try {
      const r = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      })
      if (!r.ok) throw new Error('non-ok')
      const d = await r.json()
      let reply = d.reply || 'Acknowledged.'
      if (d.data?.examples?.length) {
        reply += '\n\nExamples:\n' + (d.data.examples as string[]).map((e: string) => `• ${e}`).join('\n')
      }
      if (d.requires_approval) {
        setPendingApproval(d.pending_action ?? q)
      }
      addLog({ role: 'jarvis', text: `Jarvis: ${reply}`, ts: ts() })
      setJarvisState('LISTENING')
      if (q.toLowerCase().startsWith('remember') || q.toLowerCase() === 'show memory') {
        fetchMemory()
      }
    } catch {
      addLog({ role: 'err', text: 'ERR: Backend unreachable. Run: docker run --rm -p 8000:8000 jarvis-backend', ts: ts() })
      setJarvisState('OFFLINE')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [loading])

  function toggleMute() {
    const next = !muted
    setMuted(next)
    setJarvisState(next ? 'MUTED' : 'LISTENING')
    addLog({ role: 'sys', text: next ? 'SYS: Microphone muted.' : 'SYS: Microphone active.', ts: ts() })
  }

  const os = typeof window !== 'undefined' ? (navigator.platform.includes('Win') ? 'WIN' : navigator.platform.includes('Mac') ? 'macOS' : 'LINUX') : 'WIN'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: C.BG, color: C.TEXT, fontFamily: 'Courier New, monospace', overflow: 'hidden' }}>

      {/* HEADER */}
      <div style={{ height: 54, flexShrink: 0, background: C.DARK, borderBottom: `1px solid ${C.BORDER_B}`, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
        <span style={{ fontSize: 9, color: C.PRI_DIM, letterSpacing: '0.1em' }}>MARK XXXIX</span>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.PRI, letterSpacing: '0.12em' }}>J.A.R.V.I.S</div>
          <div style={{ fontSize: 8, color: C.PRI_DIM, letterSpacing: '0.1em' }}>Just A Rather Very Intelligent System</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.PRI }}>{clock}</div>
          <div style={{ fontSize: 8, color: C.TEXT_DIM }}>{dateStr}</div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT PANEL — sys monitor */}
        <div style={{ width: 152, flexShrink: 0, background: C.DARK, borderRight: `1px solid ${C.BORDER}`, padding: '10px 8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: C.PRI, letterSpacing: '0.12em', borderBottom: `1px solid ${C.BORDER}`, paddingBottom: 4, marginBottom: 8 }}>◈ SYS MONITOR</div>
          <MetricBar label="CPU" value={metrics.cpu} text={`${metrics.cpu.toFixed(0)}%`} color={C.PRI} />
          <MetricBar label="MEM" value={metrics.mem} text={`${metrics.mem.toFixed(0)}%`} color={C.ACC2} />
          <MetricBar label="NET" value={Math.min(100, metrics.net * 10)} text={metrics.net < 1 ? `${(metrics.net*1024).toFixed(0)}KB/s` : `${metrics.net.toFixed(1)}MB/s`} color={C.GREEN} />
          <MetricBar label="GPU" value={metrics.gpu >= 0 ? metrics.gpu : 0} text={metrics.gpu >= 0 ? `${metrics.gpu.toFixed(0)}%` : 'N/A'} color={C.ACC} />
          <MetricBar label="TMP" value={metrics.tmp >= 0 ? Math.min(100, (metrics.tmp / 100) * 100) : 0} text={metrics.tmp >= 0 ? `${metrics.tmp.toFixed(0)}°C` : 'N/A'} color="#ff6688" />

          <div style={{ background: C.PANEL2, border: `1px solid ${C.BORDER}`, borderRadius: 4, padding: '5px 7px', marginTop: 6, marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.GREEN, fontWeight: 700 }}>UP {uptime}</div>
            <div style={{ fontSize: 8, color: C.TEXT_MED, marginTop: 2 }}>PROC {procs}</div>
            <div style={{ fontSize: 8, color: C.ACC2, marginTop: 2 }}>OS {os}</div>
          </div>

          <div style={{ flex: 1 }} />

          {[
            ['AI CORE\nACTIVE', C.GREEN],
            ['SEC\nCLEARED', C.PRI],
            ['PROTOCOL\nXXXIX', C.TEXT_DIM],
          ].map(([txt, col]) => (
            <div key={txt} style={{
              fontSize: 8, fontWeight: 700, color: col, textAlign: 'center',
              background: C.PANEL2, border: `1px solid ${C.BORDER_A}`,
              borderRadius: 3, padding: 4, marginBottom: 5, lineHeight: 1.5, whiteSpace: 'pre',
            }}>{txt}</div>
          ))}
        </div>

        {/* CENTER — HUD */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: C.BG }}>
          <HudCanvas state={loading ? 'THINKING' : jarvisState} muted={muted} />
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width: 340, flexShrink: 0, background: C.DARK, borderLeft: `1px solid ${C.BORDER}`, padding: '8px', display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>

          {/* Activity log */}
          <div style={{ fontSize: 8, fontWeight: 700, color: C.TEXT_MED, marginBottom: 4 }}>▸ ACTIVITY LOG</div>
          <LogWidget messages={messages} />

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${C.BORDER}`, margin: '6px 0' }} />

          {/* Pending approval */}
          {pendingApproval && (
            <>
              <div style={{ fontSize: 8, fontWeight: 700, color: C.RED, marginBottom: 4 }}>▸ PENDING APPROVAL</div>
              <div style={{ background: '#140006', border: `1px solid ${C.RED}`, borderRadius: 4, padding: '6px 8px', marginBottom: 6 }}>
                <div style={{ fontSize: 10, color: C.RED, marginBottom: 6, lineHeight: 1.5 }}>{pendingApproval}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setPendingApproval(null); sendMessage('yes') }} style={{ flex: 1, padding: '4px', fontSize: 10, fontWeight: 700, cursor: 'pointer', background: 'rgba(0,255,136,0.1)', border: `1px solid ${C.GREEN}`, color: C.GREEN, borderRadius: 3, fontFamily: 'Courier New' }}>APPROVE</button>
                  <button onClick={() => { setPendingApproval(null); addLog({ role: 'sys', text: 'SYS: Action cancelled.', ts: ts() }) }} style={{ flex: 1, padding: '4px', fontSize: 10, fontWeight: 700, cursor: 'pointer', background: 'rgba(255,51,85,0.1)', border: `1px solid ${C.RED}`, color: C.RED, borderRadius: 3, fontFamily: 'Courier New' }}>DENY</button>
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${C.BORDER}`, margin: '2px 0 6px' }} />
            </>
          )}

          {/* Memory count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 8, color: C.TEXT_MED }}>▸ MEMORY</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.PRI }}>{memCount}</span>
            <span style={{ fontSize: 9, color: C.TEXT_DIM }}>notes</span>
          </div>

          <div style={{ borderTop: `1px solid ${C.BORDER}`, margin: '2px 0 6px' }} />

          {/* Quick commands */}
          <div style={{ fontSize: 8, fontWeight: 700, color: C.TEXT_MED, marginBottom: 4 }}>▸ QUICK COMMANDS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
            {QUICK_CMDS.map(cmd => (
              <button
                key={cmd}
                onClick={() => sendMessage(cmd)}
                disabled={loading}
                style={{
                  padding: '2px 7px', fontSize: 9, cursor: 'pointer',
                  background: C.PRI_GHO, border: `1px solid ${C.BORDER_B}`,
                  color: C.TEXT_MED, borderRadius: 3, fontFamily: 'Courier New',
                  opacity: loading ? 0.5 : 1, transition: 'all 0.1s',
                }}
                onMouseEnter={e => { if (!loading) { (e.currentTarget).style.color = C.PRI; (e.currentTarget).style.borderColor = C.PRI } }}
                onMouseLeave={e => { (e.currentTarget).style.color = C.TEXT_MED; (e.currentTarget).style.borderColor = C.BORDER_B }}
              >
                {cmd}
              </button>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${C.BORDER}`, margin: '2px 0 6px' }} />

          {/* Command input */}
          <div style={{ fontSize: 8, fontWeight: 700, color: C.TEXT_MED, marginBottom: 4 }}>▸ COMMAND INPUT</div>
          <div style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Type a command or question…"
              disabled={loading}
              style={{
                flex: 1, height: 30, background: '#000d14', color: C.WHITE,
                border: `1px solid ${C.BORDER}`, borderRadius: 3,
                padding: '3px 7px', fontSize: 10, fontFamily: 'Courier New', outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = C.PRI)}
              onBlur={e => (e.target.style.borderColor = C.BORDER)}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 30, height: 30, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: C.PANEL, color: C.PRI, border: `1px solid ${C.PRI_DIM}`,
                borderRadius: 3, fontFamily: 'Courier New',
                opacity: loading || !input.trim() ? 0.4 : 1,
              }}
            >▸</button>
          </div>

          {/* Mute button */}
          <button
            onClick={toggleMute}
            style={{
              height: 30, fontSize: 9, fontWeight: 700, cursor: 'pointer', borderRadius: 3,
              background: muted ? '#140006' : '#00140a',
              color: muted ? C.MUTED_C : C.GREEN,
              border: `1px solid ${muted ? C.MUTED_C : C.GREEN}`,
              fontFamily: 'Courier New', marginBottom: 4,
            }}
          >
            {muted ? '🔇 MICROPHONE MUTED' : '🎙 MICROPHONE ACTIVE'}
          </button>

          {/* Backend status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
              background: backendOnline === null ? C.ACC : backendOnline ? C.GREEN : C.RED,
              boxShadow: `0 0 6px ${backendOnline === null ? C.ACC : backendOnline ? C.GREEN : C.RED}`,
            }} />
            <span style={{ fontSize: 8, color: backendOnline ? C.GREEN : C.RED }}>
              {backendOnline === null ? 'CONNECTING…' : backendOnline ? 'BACKEND ONLINE' : 'BACKEND OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ height: 22, flexShrink: 0, background: C.DARK, borderTop: `1px solid ${C.BORDER}`, display: 'flex', alignItems: 'center', padding: '0 14px', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 8, color: C.TEXT_MED }}>[F4] Mute · Type command and press Enter</span>
        <span style={{ fontSize: 8, color: C.TEXT_DIM }}>FatihMakes Industries · MARK XXXIX · CloudOps Edition</span>
        <span style={{ fontSize: 8, color: C.PRI_DIM }}>© STARK INDUSTRIES</span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; overflow: hidden; }
        body { background: #00060a; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #00060a; }
        ::-webkit-scrollbar-thumb { background: #1a5c7a; border-radius: 2px; }
        input::placeholder { color: #3a8a9a; }
        button:focus { outline: none; }
      `}</style>
    </div>
  )
}
