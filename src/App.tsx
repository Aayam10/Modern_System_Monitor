import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

// ─── Exact colours from the original PyQt6 source (class C) ──────────────────
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

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000'
const AUTO_SEND_VOICE = false

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'user' | 'jarvis' | 'sys' | 'err' | 'file'

interface Msg {
  id: string
  role: Role
  text: string
  ts: string
}

interface Metrics {
  cpu: number; mem: number; net: number; gpu: number; tmp: number
  uptime: string; procs: number; os: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySR = any

// ─── Helpers ──────────────────────────────────────────────────────────────────
let _uid = 0
const mkMsg = (role: Role, text: string): Msg => ({
  id: String(++_uid), role, text,
  ts: new Date().toLocaleTimeString('en-US', { hour12: false }),
})

function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`
}
const rad = (d: number) => d * Math.PI / 180

// ─── HUD Canvas ───────────────────────────────────────────────────────────────
type HudState = 'IDLE' | 'LISTENING' | 'SPEAKING' | 'THINKING' | 'PROCESSING' | 'MUTED' | 'OFFLINE'

function HudCanvas({ state, muted }: { state: HudState; muted: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef(state)
  const mutedRef = useRef(muted)
  const animRef = useRef(0)
  useEffect(() => { stateRef.current = state }, [state])
  useEffect(() => { mutedRef.current = muted }, [muted])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let tick = 0
    let scale = 1.0, tgtScale = 1.0
    let halo = 55.0, tgtHalo = 55.0
    let lastStateChange = performance.now()
    let scanA = 0, scanB = 180
    const rings = [0, 120, 240]
    let pulses: number[] = [0, 50, 100]
    let blink = true, blinkTick = 0
    const particles: { x: number; y: number; vx: number; vy: number; life: number }[] = []

    function frame() {
      const c = canvasRef.current; if (!c) return
      const W = c.width, H = c.height
      const st = stateRef.current, mt = mutedRef.current
      const speaking = st === 'SPEAKING'
      const cx = W / 2, cy = H / 2
      const fw = Math.min(W, H)
      const now = performance.now()

      // lerp targets
      if (now - lastStateChange > (speaking ? 120 : 500)) {
        if (mt) { tgtScale = 0.998 + Math.random() * 0.004; tgtHalo = 15 + Math.random() * 13 }
        else if (speaking) { tgtScale = 1.06 + Math.random() * 0.08; tgtHalo = 145 + Math.random() * 45 }
        else { tgtScale = 1.001 + Math.random() * 0.007; tgtHalo = 48 + Math.random() * 20 }
        lastStateChange = now
      }
      const lerpSpeed = speaking ? 0.38 : 0.15
      scale += (tgtScale - scale) * lerpSpeed
      halo  += (tgtHalo  - halo)  * lerpSpeed

      // ring rotation
      const spds = speaking ? [1.3, -0.9, 2.0] : [0.55, -0.35, 0.9]
      for (let i = 0; i < 3; i++) rings[i] = (rings[i] + spds[i] + 360) % 360
      scanA = (scanA + (speaking ? 3.0 : 1.3)) % 360
      scanB = (scanB - (speaking ? 2.0 : 0.75) + 360) % 360

      // pulses
      const pspd = speaking ? 4.2 : 2.0
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i] += pspd
        if (pulses[i] >= fw * 0.74) pulses.splice(i, 1)
      }
      if (pulses.length < 3 && Math.random() < (speaking ? 0.07 : 0.025)) pulses.push(0)

      // particles (speaking only)
      if (speaking && Math.random() < 0.28) {
        const a = Math.random() * Math.PI * 2, rs = fw * 0.27
        particles.push({ x: cx + Math.cos(a) * rs, y: cy + Math.sin(a) * rs, vx: Math.cos(a) * (0.9 + Math.random() * 1.5), vy: Math.sin(a) * (0.9 + Math.random() * 1.5) - 0.4, life: 1.0 })
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97; p.life -= 0.028
        if (p.life <= 0) particles.splice(i, 1)
      }

      // blink
      blinkTick++; if (blinkTick >= 38) { blink = !blink; blinkTick = 0 }

      const priColor = mt ? C.MUTED_C : C.PRI

      // ── DRAW ──────────────────────────────────────────────────────────────
      ctx.fillStyle = C.BG
      ctx.fillRect(0, 0, W, H)

      // background grid dots
      ctx.fillStyle = rgba(C.PRI_GHO, 1)
      for (let x = 0; x < W; x += 48) for (let y = 0; y < H; y += 48) ctx.fillRect(x, y, 1, 1)

      // halo glow (10 concentric rings)
      const rFace = fw * 0.31
      for (let i = 0; i < 10; i++) {
        const r2 = rFace * (1.8 - i * 0.08)
        const frc = i / 10
        const a = Math.max(0, Math.min(1, halo * 0.085 * (1 - frc)))
        ctx.beginPath(); ctx.arc(cx, cy, r2, 0, Math.PI * 2)
        ctx.strokeStyle = rgba(priColor, a); ctx.lineWidth = 1.5; ctx.stroke()
      }

      // pulse rings
      for (const pr of pulses) {
        const a = Math.max(0, 230 * (1 - pr / (fw * 0.74))) / 255
        ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2)
        ctx.strokeStyle = rgba(priColor, a); ctx.lineWidth = 1.5; ctx.stroke()
      }

      // three spinning arc rings
      const ringDefs: [number, number, number, number][] = [
        [0.48, 3, 115, 78],
        [0.40, 2, 78,  55],
        [0.32, 1, 56,  40],
      ]
      for (let idx = 0; idx < 3; idx++) {
        const [rFrac, lw, arcLen, gap] = ringDefs[idx]
        const ringR = fw * rFrac, base = rings[idx]
        const a = Math.max(0, Math.min(1, halo * (1 - idx * 0.18) / 255))
        ctx.strokeStyle = rgba(priColor, a); ctx.lineWidth = lw
        let angle = base
        while (angle < base + 360) {
          ctx.beginPath(); ctx.arc(cx, cy, ringR, rad(angle), rad(angle + arcLen)); ctx.stroke()
          angle += arcLen + gap
        }
      }

      // scanner arcs
      const sr = fw * 0.50, sa = Math.min(1, halo * 1.5 / 255)
      const ext = speaking ? 75 : 44
      ctx.strokeStyle = rgba(priColor, sa); ctx.lineWidth = 2.5
      ctx.beginPath(); ctx.arc(cx, cy, sr, rad(scanA), rad(scanA + ext)); ctx.stroke()
      ctx.strokeStyle = rgba(C.ACC, sa * 0.45); ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(cx, cy, sr, rad(scanB), rad(scanB + ext)); ctx.stroke()

      // tick marks
      const tOut = fw * 0.497, tIn = fw * 0.474
      ctx.strokeStyle = rgba(C.PRI, 140 / 255); ctx.lineWidth = 1
      for (let deg = 0; deg < 360; deg += 10) {
        const r = rad(deg), inn = deg % 30 === 0 ? tIn : tIn + 6
        ctx.beginPath(); ctx.moveTo(cx + tOut * Math.cos(r), cy + tOut * Math.sin(r))
        ctx.lineTo(cx + inn * Math.cos(r), cy + inn * Math.sin(r)); ctx.stroke()
      }

      // crosshair
      const chR = fw * 0.51, gap = fw * 0.16
      ctx.strokeStyle = rgba(C.PRI, halo * 0.5 / 255); ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx - chR, cy); ctx.lineTo(cx - gap, cy)
      ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + chR, cy)
      ctx.moveTo(cx, cy - chR); ctx.lineTo(cx, cy - gap)
      ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + chR)
      ctx.stroke()

      // corner brackets
      const bl = 24
      const hl = cx - fw / 2, hr = cx + fw / 2
      const ht = cy - fw / 2, hb = cy + fw / 2
      ctx.strokeStyle = rgba(C.PRI, 210 / 255); ctx.lineWidth = 2
      for (const [bx, by, dx, dy] of [[hl, ht, 1, 1], [hr, ht, -1, 1], [hl, hb, 1, -1], [hr, hb, -1, -1]] as [number, number, number, number][]) {
        ctx.beginPath()
        ctx.moveTo(bx, by); ctx.lineTo(bx + dx * bl, by)
        ctx.moveTo(bx, by); ctx.lineTo(bx, by + dy * bl)
        ctx.stroke()
      }

      // center orb (8 layered radial gradients)
      const orbR = fw * 0.27 * scale
      for (let i = 8; i > 0; i--) {
        const r2 = orbR * i / 8, frc = i / 8
        const a = Math.max(0, Math.min(1, (mt ? 80 : halo) * 1.1 * frc / 255))
        const oc = mt ? [200, 0, 50] : speaking ? [0, 60, 110] : [0, 50, 100]
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r2)
        g.addColorStop(0, `rgba(${Math.round(oc[0] * frc * 0.5)},${Math.round(oc[1] * frc * 2.2)},${Math.round(oc[2] * frc * 3)},${a * 1.3})`)
        g.addColorStop(0.65, `rgba(${Math.round(oc[0] * frc * 0.3)},${Math.round(oc[1] * frc * 1.5)},${Math.round(oc[2] * frc * 2.2)},${a * 0.6})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath(); ctx.arc(cx, cy, r2, 0, Math.PI * 2)
        ctx.fillStyle = g; ctx.fill()
      }
      ctx.beginPath(); ctx.arc(cx, cy, orbR * 0.92, 0, Math.PI * 2)
      ctx.strokeStyle = rgba(priColor, Math.min(1, halo * 1.2 / 255))
      ctx.lineWidth = 1; ctx.stroke()

      // "J.A.R.V.I.S" text inside orb
      ctx.save()
      ctx.font = 'bold 13px "Courier New", monospace'
      ctx.fillStyle = rgba(C.PRI, Math.min(1, halo * 3 / 255))
      ctx.shadowColor = C.PRI; ctx.shadowBlur = 14
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('J.A.R.V.I.S', cx, cy)
      ctx.restore()

      // particles
      for (const p of particles) {
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = rgba(C.PRI, p.life); ctx.fill()
      }

      // status label below orb
      const sy = cy + fw * 0.40
      let stTxt = '', stCol = C.PRI
      if (mt)               { stTxt = '⊘ MUTED';                 stCol = C.MUTED_C }
      else if (speaking)    { stTxt = '● SPEAKING';              stCol = C.ACC }
      else if (st === 'THINKING')   { stTxt = (blink ? '◈' : '◇') + ' THINKING';  stCol = C.ACC2 }
      else if (st === 'PROCESSING') { stTxt = (blink ? '▷' : '▶') + ' PROCESSING'; stCol = C.ACC2 }
      else if (st === 'LISTENING')  { stTxt = (blink ? '●' : '○') + ' LISTENING';  stCol = C.GREEN }
      else if (st === 'OFFLINE')    { stTxt = (blink ? '●' : '○') + ' OFFLINE';    stCol = C.RED }
      else                  { stTxt = (blink ? '●' : '○') + ' ' + st; stCol = C.PRI }

      ctx.save()
      ctx.font = 'bold 11px "Courier New", monospace'
      ctx.fillStyle = stCol; ctx.shadowColor = stCol; ctx.shadowBlur = 10
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(stTxt, cx, sy); ctx.restore()

      // waveform bars (36 bars, 8px wide, 1px gap)
      const wy = sy + 30, N = 36, bw = 8
      const wx0 = cx - (N * bw) / 2
      for (let i = 0; i < N; i++) {
        let h: number, col: string
        if (mt) { h = 2; col = rgba(C.MUTED_C, 0.5) }
        else if (speaking) { h = 3 + Math.floor(Math.random() * 17); col = h > 12 ? C.PRI : C.PRI_DIM }
        else { h = 3 + Math.round(2 * Math.sin(tick * 0.09 + i * 0.6)); col = rgba(C.BORDER_B, 0.65) }
        ctx.fillStyle = col
        if (speaking && h > 12) { ctx.shadowColor = C.PRI; ctx.shadowBlur = 4 }
        ctx.fillRect(wx0 + i * bw, wy + 20 - h, bw - 1, h)
        ctx.shadowBlur = 0
      }

      tick++
      animRef.current = requestAnimationFrame(frame)
    }

    animRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={700} height={700}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

// ─── Metric bar (left panel) ──────────────────────────────────────────────────
function MetricBar({ label, value, text, color }: { label: string; value: number; text: string; color: string }) {
  const col = value > 85 ? C.RED : value > 65 ? C.ACC : color
  return (
    <div style={{ marginBottom: 5, padding: '4px 7px', background: C.PANEL2, border: `1px solid ${rgba(col, 0.2)}`, borderRadius: 2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 7, fontFamily: '"Courier New"', color: C.TEXT_DIM, letterSpacing: '0.1em', fontWeight: 700 }}>{label}</span>
        <span style={{ fontSize: 9, fontFamily: '"Courier New"', color: col, fontWeight: 700, textShadow: `0 0 5px ${col}` }}>{text}</span>
      </div>
      <div style={{ height: 3, background: C.BAR_BG, borderRadius: 2 }}>
        <div style={{ height: 3, width: `${Math.min(100, value)}%`, borderRadius: 2, background: `linear-gradient(90deg,${rgba(col, 0.5)},${col})`, boxShadow: `0 0 4px ${col}`, transition: 'width 1.2s ease' }} />
      </div>
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function SLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
      <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.16em', color: C.TEXT_MED, fontFamily: '"Courier New"', whiteSpace: 'nowrap' }}>▸ {text}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${rgba(C.PRI, 0.3)},transparent)` }} />
    </div>
  )
}

// ─── Activity log ─────────────────────────────────────────────────────────────
function LogWidget({ messages }: { messages: Msg[] }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  const colFor = (r: Role) =>
    r === 'jarvis' ? C.PRI : r === 'user' ? C.WHITE : r === 'err' ? C.RED : r === 'file' ? C.GREEN : C.ACC2
  return (
    <div style={{
      flex: 1, overflowY: 'auto', minHeight: 0,
      background: rgba(C.DARK, 0.8),
      border: `1px solid ${rgba(C.BORDER_B, 0.2)}`,
      borderRadius: 2, padding: '7px 9px',
    }}>
      {messages.map(m => (
        <div key={m.id} style={{
          color: colFor(m.role), fontSize: 9, fontFamily: '"Courier New"',
          lineHeight: 1.6, marginBottom: 1,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          textShadow: m.role === 'err' ? `0 0 6px ${C.RED}` : m.role === 'jarvis' ? `0 0 4px ${rgba(C.PRI, 0.35)}` : 'none',
        }}>
          {m.text}
        </div>
      ))}
      {messages.length === 0 && <div style={{ color: C.TEXT_DIM, fontSize: 8, fontFamily: '"Courier New"' }}>No activity.</div>}
      <div ref={endRef} />
    </div>
  )
}

// ─── File drop zone ───────────────────────────────────────────────────────────
function FileDropZone({ onFile }: { onFile: (name: string) => void }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<{ name: string; size: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`

  const handleFile = (f: File) => { setFile({ name: f.name, size: fmtSize(f.size) }); onFile(f.name) }

  return (
    <div
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      style={{
        height: 100, borderRadius: 3, cursor: file ? 'default' : 'pointer',
        background: dragging ? rgba(C.PRI, 0.06) : rgba(C.DARK, 0.8),
        border: `1px dashed ${dragging ? rgba(C.PRI, 0.65) : rgba(C.BORDER_B, 0.4)}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
        transition: 'all 0.2s',
      }}
    >
      {file ? (
        <>
          <div style={{ fontSize: 10, color: C.GREEN, fontFamily: '"Courier New"', textShadow: `0 0 6px ${C.GREEN}` }}>
            ▣ {file.name}
          </div>
          <div style={{ fontSize: 8, color: C.TEXT_DIM, fontFamily: '"Courier New"' }}>{file.size} · loaded</div>
          <button
            onClick={e => { e.stopPropagation(); setFile(null) }}
            style={{ fontSize: 8, color: C.RED, background: 'transparent', border: `1px solid ${rgba(C.RED, 0.4)}`, borderRadius: 2, padding: '1px 6px', cursor: 'pointer', fontFamily: '"Courier New"' }}
          >✕ clear</button>
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.45 }}>
            <path d="M12 3v12M7 8l5-5 5 5M5 20h14" stroke={C.PRI} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 8, color: rgba(C.TEXT_MED, 0.65), fontFamily: '"Courier New"', textAlign: 'center' }}>
            Drop file here  or  Click to Browse
          </div>
          <div style={{ fontSize: 7, color: rgba(C.TEXT_DIM, 0.5), fontFamily: '"Courier New"' }}>
            Images · Video · Audio · PDF · Docs · Code · Data
          </div>
        </>
      )}
      <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState<Msg[]>([mkMsg('sys', 'SYS: JARVIS online.')])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [muted, setMuted] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [metrics, setMetrics] = useState<Metrics>({ cpu: 0, mem: 0, net: 0, gpu: -1, tmp: -1, uptime: '--:--', procs: 0, os: 'WIN' })
  const [clock, setClock] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [fileLoaded, setFileLoaded] = useState<string | null>(null)

  // Voice
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const recognitionRef = useRef<AnySR>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  // ─── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      setClock(new Date().toLocaleTimeString('en-US', { hour12: false }))
      setDateStr(new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }))
    }
    tick(); const t = setInterval(tick, 1000)

    const SR = (window as AnySR).SpeechRecognition || (window as AnySR).webkitSpeechRecognition
    setVoiceSupported(!!SR)

    checkBackend()
    fetchMetrics()
    const poll = setInterval(fetchMetrics, 5000)

    return () => { clearInterval(t); clearInterval(poll); recognitionRef.current?.abort() }
  }, [])

  // ─── Backend ──────────────────────────────────────────────────────────────
  async function checkBackend() {
    try {
      const r = await fetch(`${API_BASE}/api/status`)
      if (!r.ok) throw new Error()
      setBackendOnline(true)
      addMsg(mkMsg('sys', 'SYS: Backend connected.'))
    } catch {
      setBackendOnline(false)
      addMsg(mkMsg('err', 'ERR: Backend offline. Run: docker run --rm -p 8000:8000 jarvis-backend'))
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
        os:     d.os ?? 'WIN',
      })
    } catch { /* silent */ }
  }

  function addMsg(m: Msg) { setMessages(p => [...p, m]) }

  // ─── Send ─────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const q = text.trim(); if (!q || loading) return
    setInput(''); setLoading(true)
    addMsg(mkMsg('user', `You: ${q}`))
    try {
      const r = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      })
      if (!r.ok) throw new Error()
      const d = await r.json()
      let reply = d.reply || 'Acknowledged.'
      if (d.data?.examples?.length) reply += '\n\n' + (d.data.examples as string[]).map((e: string) => `  › ${e}`).join('\n')
      addMsg(mkMsg('jarvis', `Jarvis: ${reply}`))
    } catch {
      addMsg(mkMsg('err', 'ERR: Backend unreachable.'))
      setBackendOnline(false)
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [loading])

  // ─── Voice ────────────────────────────────────────────────────────────────
  function toggleMic() {
    if (!voiceSupported) {
      setVoiceError('Speech recognition unavailable in this runtime.')
      return
    }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }

    setVoiceError(null)
    const SR = (window as AnySR).SpeechRecognition || (window as AnySR).webkitSpeechRecognition
    const rec: AnySR = new SR()
    rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1; rec.continuous = false

    rec.onstart = () => { setIsListening(true); addMsg(mkMsg('sys', 'Voice: Listening…')) }
    rec.onresult = (e: AnySR) => {
      const t: string = e.results[0][0].transcript
      setInput(t); addMsg(mkMsg('sys', `Voice: "${t}"`))
      if (AUTO_SEND_VOICE) sendMessage(t)
    }
    rec.onerror = (e: AnySR) => {
      setIsListening(false)
      const errMap: Record<string, string> = {
        'not-allowed': 'Microphone access denied. Allow permission in browser.',
        'no-speech':   'No speech detected. Try again.',
        'audio-capture': 'Microphone unavailable. Check audio device.',
        'network':     'Network error during voice recognition.',
      }
      setVoiceError(errMap[e.error as string] ?? `Voice error: ${e.error as string}`)
    }
    rec.onend = () => { setIsListening(false); recognitionRef.current = null }
    recognitionRef.current = rec
    rec.start()
  }

  function toggleMute() {
    const next = !muted; setMuted(next)
    addMsg(mkMsg('sys', next ? 'SYS: Microphone muted.' : 'SYS: Microphone active.'))
  }

  // ─── Derived HUD state ────────────────────────────────────────────────────
  const hudState: HudState = muted
    ? 'MUTED'
    : loading
    ? 'THINKING'
    : isListening
    ? 'LISTENING'
    : backendOnline === false
    ? 'OFFLINE'
    : 'IDLE'

  // ─── Layout constants (match original PyQt sizes) ─────────────────────────
  const LEFT_W  = 'clamp(140px, 11vw, 160px)'
  const RIGHT_W = 'clamp(300px, 26vw, 360px)'

  const panelStyle: React.CSSProperties = {
    background: C.PANEL,
    border: `1px solid ${C.BORDER}`,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', background: C.BG, overflow: 'hidden', fontFamily: '"Courier New", monospace' }}>

      {/* ── HEADER (54px) ─────────────────────────────────────────────── */}
      <div style={{
        height: 54, flexShrink: 0,
        background: rgba(C.PANEL, 0.98),
        borderBottom: `1px solid ${C.BORDER_B}`,
        display: 'flex', alignItems: 'center', padding: '0 16px',
        position: 'relative', zIndex: 10,
        boxShadow: `0 1px 20px ${rgba(C.PRI, 0.07)}`,
      }}>
        {/* left */}
        <div style={{ minWidth: 110 }}>
          <div style={{ fontSize: 8, color: C.PRI_DIM, letterSpacing: '0.15em', fontWeight: 700 }}>MARK XXXIX</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: backendOnline ? C.GREEN : backendOnline === null ? C.ACC2 : C.RED,
              display: 'inline-block',
              boxShadow: `0 0 7px ${backendOnline ? C.GREEN : backendOnline === null ? C.ACC2 : C.RED}`,
            }} />
            <span style={{ fontSize: 7, color: C.TEXT_DIM, letterSpacing: '0.1em' }}>
              {backendOnline === null ? 'CONNECTING' : backendOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* center */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            fontSize: 'clamp(16px, 1.4vw, 20px)', fontWeight: 700, color: C.PRI,
            letterSpacing: '0.22em',
            textShadow: `0 0 18px ${C.PRI}, 0 0 36px ${rgba(C.PRI, 0.3)}`,
          }}>J.A.R.V.I.S</div>
          <div style={{ fontSize: 7, color: rgba(C.PRI, 0.4), letterSpacing: '0.14em', marginTop: 2 }}>
            Just A Rather Very Intelligent System
          </div>
        </div>

        {/* right */}
        <div style={{ minWidth: 110, textAlign: 'right' }}>
          <div style={{
            fontSize: 'clamp(13px, 1.1vw, 16px)', fontWeight: 700, color: C.PRI,
            letterSpacing: '0.1em', textShadow: `0 0 12px ${C.PRI}`,
          }}>{clock}</div>
          <div style={{ fontSize: 7, color: C.TEXT_DIM, letterSpacing: '0.06em', marginTop: 2 }}>{dateStr}</div>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT PANEL (148px) */}
        <div style={{
          width: LEFT_W, flexShrink: 0,
          ...panelStyle,
          borderTop: 'none', borderLeft: 'none', borderBottom: 'none',
          display: 'flex', flexDirection: 'column',
          padding: '10px 8px',
          zIndex: 5,
        }}>
          <SLabel text="SYS MONITOR" />

          <MetricBar label="CPU" value={metrics.cpu} text={`${metrics.cpu.toFixed(0)}%`}  color={C.PRI} />
          <MetricBar label="MEM" value={metrics.mem} text={`${metrics.mem.toFixed(0)}%`}  color={C.ACC2} />
          <MetricBar
            label="NET"
            value={Math.min(100, metrics.net * 10)}
            text={metrics.net < 1 ? `${(metrics.net * 1024).toFixed(0)}KB/s` : `${metrics.net.toFixed(1)}MB/s`}
            color={C.GREEN}
          />
          <MetricBar label="GPU" value={metrics.gpu >= 0 ? metrics.gpu : 0} text={metrics.gpu >= 0 ? `${metrics.gpu.toFixed(0)}%` : 'N/A'} color={C.ACC} />
          <MetricBar label="TMP" value={metrics.tmp >= 0 ? Math.min(100, metrics.tmp) : 0} text={metrics.tmp >= 0 ? `${metrics.tmp.toFixed(0)}°C` : 'N/A'} color="#ff6688" />

          {/* info box */}
          <div style={{
            background: C.PANEL2, border: `1px solid ${C.BORDER_A}`,
            borderRadius: 2, padding: '6px 7px', marginTop: 4, marginBottom: 8,
          }}>
            <div style={{ fontSize: 8, color: C.GREEN, fontWeight: 700, textShadow: `0 0 7px ${C.GREEN}`, letterSpacing: '0.06em' }}>UP {metrics.uptime}</div>
            <div style={{ fontSize: 8, color: C.TEXT_MED, marginTop: 2, letterSpacing: '0.05em' }}>PROC {metrics.procs || '--'}</div>
            <div style={{ fontSize: 8, color: C.ACC2, marginTop: 2, letterSpacing: '0.05em' }}>OS {metrics.os}</div>
          </div>

          <div style={{ flex: 1 }} />

          {/* 3 status badges */}
          {[
            { txt: 'AI CORE\nACTIVE', col: C.GREEN },
            { txt: 'SEC\nCLEARED', col: C.PRI },
            { txt: 'PROTOCOL\nXXXIX', col: C.TEXT_DIM },
          ].map(b => (
            <div key={b.txt} style={{
              fontSize: 7, fontWeight: 700, color: b.col, textAlign: 'center',
              whiteSpace: 'pre', letterSpacing: '0.08em', lineHeight: 1.55,
              background: C.PANEL2, border: `1px solid ${C.BORDER_A}`,
              borderRadius: 2, padding: '5px 4px', marginBottom: 5,
              boxShadow: `0 0 7px ${rgba(b.col, 0.1)}`,
              textShadow: `0 0 7px ${b.col}`,
            }}>{b.txt}</div>
          ))}
        </div>

        {/* CENTER — HUD Canvas */}
        <div style={{
          flex: 1, overflow: 'hidden', position: 'relative',
          background: `radial-gradient(ellipse at center, rgba(0,18,32,0.45) 0%, ${C.BG} 70%)`,
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${rgba(C.PRI, 0.25)},transparent)` }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${rgba(C.PRI, 0.12)},transparent)` }} />
          <HudCanvas state={hudState} muted={muted} />
        </div>

        {/* RIGHT PANEL (340px) — exact 3-section layout from original */}
        <div style={{
          width: RIGHT_W, flexShrink: 0,
          ...panelStyle,
          borderTop: 'none', borderRight: 'none', borderBottom: 'none',
          display: 'flex', flexDirection: 'column',
          padding: '10px 10px 8px',
          zIndex: 5,
        }}>

          {/* SECTION 1: Activity Log */}
          <SLabel text="ACTIVITY LOG" />
          <LogWidget messages={messages} />

          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${rgba(C.PRI, 0.15)},transparent)`, margin: '8px 0' }} />

          {/* SECTION 2: File Upload */}
          <SLabel text="FILE UPLOAD" />
          <FileDropZone onFile={name => {
            setFileLoaded(name)
            addMsg(mkMsg('file', `FILE: ${name} loaded`))
          }} />
          <div style={{ fontSize: 7, color: rgba(C.TEXT_MED, 0.45), fontFamily: '"Courier New"', marginTop: 4, marginBottom: 8 }}>
            {fileLoaded ? `${fileLoaded} — ready` : 'No file loaded — drop or click above to upload'}
          </div>

          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${rgba(C.PRI, 0.15)},transparent)`, margin: '0 0 8px' }} />

          {/* SECTION 3: Command Input */}
          <SLabel text="COMMAND INPUT" />
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(input) }}
              placeholder={isListening ? 'Listening…' : 'Type a command or question…'}
              disabled={loading}
              style={{
                flex: 1, height: 30,
                background: rgba(C.DARK, 0.9),
                color: C.WHITE, border: `1px solid ${rgba(C.BORDER_B, 0.5)}`,
                borderRadius: 2, padding: '0 8px',
                fontSize: 9, fontFamily: '"Courier New"',
                outline: 'none',
                boxShadow: isListening ? `0 0 12px ${rgba(C.PRI, 0.25)}` : 'none',
                transition: 'box-shadow 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = rgba(C.PRI, 0.7) }}
              onBlur={e => { e.target.style.borderColor = rgba(C.BORDER_B, 0.5) }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 32, height: 30,
                background: rgba(C.PRI, 0.1), color: C.PRI,
                border: `1px solid ${rgba(C.PRI, 0.5)}`,
                borderRadius: 2, fontSize: 11, fontWeight: 700,
                fontFamily: '"Courier New"', cursor: 'pointer',
                opacity: loading || !input.trim() ? 0.3 : 1,
                transition: 'opacity 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.boxShadow = `0 0 10px ${rgba(C.PRI, 0.25)}` }}
              onMouseLeave={e => { (e.target as HTMLElement).style.boxShadow = 'none' }}
            >▸</button>
          </div>

          {/* Mic button */}
          <button
            onClick={() => { if (voiceSupported) toggleMic(); else toggleMute() }}
            style={{
              height: 30, width: '100%', borderRadius: 2, cursor: 'pointer',
              background: (muted || (!voiceSupported && muted)) ? rgba('#140006', 1) : isListening ? rgba(C.PRI, 0.1) : rgba('#00140a', 1),
              border: `1px solid ${muted ? rgba(C.MUTED_C, 0.6) : isListening ? rgba(C.PRI, 0.7) : rgba(C.GREEN, 0.55)}`,
              color: muted ? C.MUTED_C : isListening ? C.PRI : C.GREEN,
              fontSize: 9, fontWeight: 700, fontFamily: '"Courier New"',
              letterSpacing: '0.1em',
              boxShadow: isListening ? `0 0 14px ${rgba(C.PRI, 0.25)}` : `0 0 8px ${rgba(C.GREEN, 0.08)}`,
              transition: 'all 0.2s',
              marginBottom: 4,
            }}
          >
            {muted ? '🔇 MICROPHONE MUTED' : isListening ? '🎙 LISTENING…' : '🎙 MICROPHONE ACTIVE'}
          </button>

          {/* Voice error */}
          {voiceError && (
            <div style={{
              fontSize: 8, color: C.RED, fontFamily: '"Courier New"',
              background: rgba(C.RED, 0.06), border: `1px solid ${rgba(C.RED, 0.25)}`,
              borderRadius: 2, padding: '4px 7px', marginBottom: 4, lineHeight: 1.5,
            }}>{voiceError}</div>
          )}

          {/* Fullscreen hint */}
          <button
            onClick={() => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen() }}
            style={{
              height: 26, width: '100%', borderRadius: 2, cursor: 'pointer',
              background: 'transparent', border: `1px solid ${C.BORDER}`,
              color: C.TEXT_DIM, fontSize: 7, fontFamily: '"Courier New"',
              letterSpacing: '0.1em', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = rgba(C.PRI, 0.3); (e.target as HTMLElement).style.color = C.TEXT_MED }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = C.BORDER; (e.target as HTMLElement).style.color = C.TEXT_DIM }}
          >⛶ FULLSCREEN [F11]</button>
        </div>
      </div>

      {/* ── FOOTER (22px) ─────────────────────────────────────────────── */}
      <div style={{
        height: 22, flexShrink: 0,
        background: rgba(C.PANEL, 0.98),
        borderTop: `1px solid ${C.BORDER}`,
        display: 'flex', alignItems: 'center',
        padding: '0 14px',
        zIndex: 10,
      }}>
        <span style={{ fontSize: 7, color: C.TEXT_MED, letterSpacing: '0.08em' }}>[F4] Mute · [F11] Fullscreen</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 7, color: C.TEXT_MED, letterSpacing: '0.06em' }}>FatihMakes Industries · MARK XXXIX · CLASSIFIED</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 7, color: C.PRI_DIM, letterSpacing: '0.08em' }}>© STARK INDUSTRIES</span>
      </div>

      <style>{`
        input::placeholder { color: ${rgba(C.TEXT_DIM, 0.5)}; }
        button { cursor: pointer; }
        @keyframes glowPulse { 0%,100% { opacity:1 } 50% { opacity:0.45 } }
      `}</style>
    </div>
  )
}
