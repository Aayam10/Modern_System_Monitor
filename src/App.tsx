import { useState, useEffect, useRef, useReducer, useCallback } from 'react'
import './App.css'

// ─── Exact colours from original class C in ui.py ────────────────────────────
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
  RED:      '#ff3355',
  MUTED_C:  '#ff3366',
  TEXT_DIM: '#3a8a9a',
  TEXT_MED: '#5ab8cc',
  WHITE:    '#d8f8ff',
  DARK:     '#000d14',
  BAR_BG:   '#011520',
} as const

const LEFT_W   = 148
const RIGHT_W  = 340
const HEADER_H = 54
const FOOTER_H = 22
const BOTTOM_STRIP_H = 18
const API_BASE = 'http://localhost:8000'
const AUTO_SEND_VOICE = false

type Role     = 'user' | 'jarvis' | 'file' | 'err' | 'sys'
type HudState = 'INITIALISING' | 'LISTENING' | 'SPEAKING' | 'THINKING' | 'PROCESSING' | 'MUTED' | 'OFFLINE'
type LiveStatus = 'OFFLINE' | 'CONNECTING' | 'LISTENING' | 'SPEAKING' | 'ERROR'

interface LogLine { id: string; text: string; fullText: string; color: string }
interface SysMetrics { cpu: number; mem: number; net: number; gpu: number; tmp: number; uptime: string; procs: number; os: string }
interface ProcessInfo { pid: number; name: string; status: string; cpu_percent: number; memory_percent: number }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SR = any

let _uid = 0
const nid = () => String(++_uid)

function rgba(hex: string, a: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`
}

function colorForRole(role: Role): string {
  if (role === 'user')   return C.WHITE
  if (role === 'jarvis') return C.PRI
  if (role === 'err')    return C.RED
  if (role === 'file')   return C.GREEN
  return C.ACC2
}

// ─── HUD Canvas — mirrors every draw call in HudCanvas.paintEvent ────────────
function HudCanvas({ hudState, muted }: { hudState: HudState; muted: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stRef     = useRef(hudState)
  const muRef     = useRef(muted)
  useEffect(() => { stRef.current = hudState }, [hudState])
  useEffect(() => { muRef.current = muted },    [muted])

  // resize canvas to fill parent
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const obs = new ResizeObserver(() => {
      const p = canvas.parentElement; if (!p) return
      canvas.width  = p.clientWidth
      canvas.height = p.clientHeight
    })
    const p = canvas.parentElement; if (p) { canvas.width = p.clientWidth; canvas.height = p.clientHeight; obs.observe(p) }
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const D = (deg: number) => deg * Math.PI / 180

    let tick = 0
    let scale = 1.0, tgtScale = 1.004
    let halo = 55.0,  tgtHalo  = 58.0
    let lastT = performance.now()
    const rings = [0.0, 120.0, 240.0]
    let scanA = 0.0, scanB = 180.0
    const pulses: number[] = [0, 50, 100]
    let blink = true, blinkTick = 0
    const particles: number[][] = []
    let raf = 0

    function draw() {
      if (!canvas) return
      const W = canvas.width, H = canvas.height
      const st = stRef.current, mt = muRef.current
      const speaking = st === 'SPEAKING'
      const cx = W / 2, cy = H / 2, fw = Math.min(W, H)
      const now = performance.now()

      // lerp targets (mirrors _step)
      if (now - lastT > (speaking ? 120 : 500)) {
        if (mt)            { tgtScale = 0.998 + Math.random() * 0.004; tgtHalo = 15  + Math.random() * 13 }
        else if (speaking) { tgtScale = 1.06  + Math.random() * 0.08;  tgtHalo = 145 + Math.random() * 45 }
        else               { tgtScale = 1.001 + Math.random() * 0.007; tgtHalo = 48  + Math.random() * 20 }
        lastT = now
      }
      const sp = speaking ? 0.38 : 0.15
      scale += (tgtScale - scale) * sp
      halo  += (tgtHalo  - halo)  * sp

      const spds = speaking ? [1.3, -0.9, 2.0] : [0.55, -0.35, 0.9]
      for (let i = 0; i < 3; i++) rings[i] = (rings[i] + spds[i] + 360) % 360
      scanA = (scanA + (speaking ? 3.0 : 1.3)) % 360
      scanB = (scanB + (speaking ? -2.0 : -0.75) + 360) % 360

      const lim = fw * 0.74, pspd = speaking ? 4.2 : 2.0
      for (let i = pulses.length - 1; i >= 0; i--) { pulses[i] += pspd; if (pulses[i] >= lim) pulses.splice(i, 1) }
      if (pulses.length < 3 && Math.random() < (speaking ? 0.07 : 0.025)) pulses.push(0)

      if (speaking && Math.random() < 0.28) {
        const a = Math.random() * Math.PI * 2, rs = fw * 0.28
        particles.push([cx + Math.cos(a)*rs, cy + Math.sin(a)*rs, Math.cos(a)*(0.9+Math.random()*1.5), Math.sin(a)*(0.9+Math.random()*1.5)-0.4, 1.0])
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p[0]+=p[2]; p[1]+=p[3]; p[2]*=0.97; p[3]*=0.97; p[4]-=0.028
        if (p[4] <= 0) particles.splice(i, 1)
      }
      blinkTick++; if (blinkTick >= 38) { blink = !blink; blinkTick = 0 }

      const pri = mt ? C.MUTED_C : C.PRI

      // clear
      ctx.fillStyle = C.BG; ctx.fillRect(0, 0, W, H)

      // grid dots
      ctx.fillStyle = rgba(C.PRI_GHO, 1)
      for (let x = 0; x < W; x += 48) for (let y = 0; y < H; y += 48) ctx.fillRect(x, y, 1, 1)

      // halo glow (10 rings)
      const rFace = fw * 0.31
      for (let i = 0; i < 10; i++) {
        const r2 = rFace * (1.8 - i * 0.08)
        const alpha = Math.max(0, Math.min(1, halo * 0.085 * (1 - i / 10) / 255))
        ctx.beginPath(); ctx.arc(cx, cy, r2, 0, Math.PI*2)
        ctx.strokeStyle = rgba(pri, alpha); ctx.lineWidth = 1.5; ctx.stroke()
      }

      // pulse rings
      for (const pr of pulses) {
        const alpha = Math.max(0, (230 * (1 - pr / lim)) / 255)
        ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI*2)
        ctx.strokeStyle = rgba(pri, alpha); ctx.lineWidth = 1.5; ctx.stroke()
      }

      // 3 spinning arc rings — [(r_frac, lineWidth, arcLen, gap)]
      const rd: [number, number, number, number][] = [[0.48,3,115,78],[0.40,2,78,55],[0.32,1,56,40]]
      for (let idx = 0; idx < 3; idx++) {
        const [rf, lw, arcLen, gap] = rd[idx]
        const rr = fw * rf, base = rings[idx]
        const alpha = Math.max(0, Math.min(1, halo * (1 - idx*0.18) / 255))
        ctx.strokeStyle = rgba(pri, alpha); ctx.lineWidth = lw
        let ang = base
        while (ang < base + 360) {
          ctx.beginPath(); ctx.arc(cx, cy, rr, D(-ang), D(-(ang+arcLen))); ctx.stroke()
          ang += arcLen + gap
        }
      }

      // scanner arcs (primary + secondary)
      const sr = fw * 0.50, sa = Math.min(1, halo * 1.5 / 255), ext = speaking ? 75 : 44
      ctx.strokeStyle = rgba(pri, sa);              ctx.lineWidth = 2.5
      ctx.beginPath(); ctx.arc(cx, cy, sr, D(-scanA), D(-(scanA+ext))); ctx.stroke()
      ctx.strokeStyle = rgba(C.ACC, sa*0.5);        ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(cx, cy, sr, D(-scanB), D(-(scanB+ext))); ctx.stroke()

      // tick marks (every 10°, longer every 30°)
      const tOut = fw*0.497, tIn = fw*0.474
      ctx.strokeStyle = rgba(C.PRI, 140/255); ctx.lineWidth = 1
      for (let deg = 0; deg < 360; deg += 10) {
        const r = D(deg), inn = deg%30===0 ? tIn : tIn+6
        ctx.beginPath()
        ctx.moveTo(cx + tOut*Math.cos(r), cy - tOut*Math.sin(r))
        ctx.lineTo(cx + inn *Math.cos(r), cy - inn *Math.sin(r))
        ctx.stroke()
      }

      // crosshair
      const chR = fw*0.51, chG = fw*0.16
      ctx.strokeStyle = rgba(C.PRI, Math.max(0, Math.min(1, halo*0.5/255))); ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx-chR,cy); ctx.lineTo(cx-chG,cy); ctx.moveTo(cx+chG,cy); ctx.lineTo(cx+chR,cy)
      ctx.moveTo(cx,cy-chR); ctx.lineTo(cx,cy-chG); ctx.moveTo(cx,cy+chG); ctx.lineTo(cx,cy+chR)
      ctx.stroke()

      // corner brackets (bl=24)
      const bl=24, hl=cx-fw/2, hr=cx+fw/2, ht=cy-fw/2, hb=cy+fw/2
      ctx.strokeStyle = rgba(C.PRI, 210/255); ctx.lineWidth = 2
      for (const [bx,by,dx,dy] of [[hl,ht,1,1],[hr,ht,-1,1],[hl,hb,1,-1],[hr,hb,-1,-1]] as [number,number,number,number][]) {
        ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+dx*bl,by); ctx.moveTo(bx,by); ctx.lineTo(bx,by+dy*bl); ctx.stroke()
      }

      // orb — 8 layered radial gradients
      const orbR = fw * 0.27 * scale
      const oc = mt ? [200,0,50] : [0,60,110]
      for (let i = 8; i > 0; i--) {
        const r2 = orbR * i/8, frc = i/8
        const a  = Math.max(0, Math.min(255, Math.round(halo * 1.1 * frc)))
        const g  = ctx.createRadialGradient(cx,cy,0,cx,cy,r2)
        g.addColorStop(0,   `rgba(${Math.round(oc[0]*frc)},${Math.round(oc[1]*frc)},${Math.round(oc[2]*frc)},${a/255})`)
        g.addColorStop(0.65,`rgba(${Math.round(oc[0]*frc*0.4)},${Math.round(oc[1]*frc*0.4)},${Math.round(oc[2]*frc*0.4)},${a/255*0.4})`)
        g.addColorStop(1,  'rgba(0,0,0,0)')
        ctx.beginPath(); ctx.arc(cx,cy,r2,0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
      }
      // orb border + J.A.R.V.I.S text
      ctx.beginPath(); ctx.arc(cx,cy,orbR,0,Math.PI*2)
      ctx.strokeStyle=rgba(C.PRI, Math.min(1,halo*2/255)); ctx.lineWidth=1; ctx.stroke()
      ctx.save()
      ctx.font='bold 13px "Courier New",monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillStyle=rgba(C.PRI, Math.min(1,halo*2/255)); ctx.shadowColor=C.PRI; ctx.shadowBlur=10
      ctx.fillText('J.A.R.V.I.S',cx,cy)
      ctx.restore()

      // particles
      for (const p of particles) {
        ctx.beginPath(); ctx.arc(p[0],p[1],2.5,0,Math.PI*2)
        ctx.fillStyle=rgba(C.PRI,Math.max(0,Math.min(1,p[4]))); ctx.fill()
      }

      // status text (cy + fw*0.40)
      const sy = cy + fw*0.40
      let stTxt: string, stCol: string
      if (mt)                         { stTxt='⊘ MUTED';                        stCol=C.MUTED_C }
      else if (speaking)              { stTxt='● SPEAKING';                      stCol=C.ACC }
      else if (st==='THINKING')       { stTxt=(blink?'◈':'◇')+' THINKING';       stCol=C.ACC2 }
      else if (st==='PROCESSING')     { stTxt=(blink?'▷':'▶')+' PROCESSING';     stCol=C.ACC2 }
      else if (st==='LISTENING')      { stTxt=(blink?'●':'○')+' LISTENING';      stCol=C.GREEN }
      else if (st==='OFFLINE')        { stTxt=(blink?'●':'○')+' OFFLINE';        stCol=C.RED }
      else                            { stTxt=(blink?'●':'○')+' '+st;            stCol=C.PRI }
      ctx.save()
      ctx.font='bold 11px "Courier New",monospace'; ctx.textAlign='center'; ctx.textBaseline='top'
      ctx.fillStyle=stCol; ctx.shadowColor=stCol; ctx.shadowBlur=8
      ctx.fillText(stTxt,cx,sy)
      ctx.restore()

      // waveform (sy+30, 36 bars × 8px, 1px gap)
      const wy=sy+30, N=36, bw=8, wx0=(W-N*bw)/2
      for (let i=0;i<N;i++) {
        let hgt: number, col: string
        if (mt)           { hgt=2; col=rgba(C.MUTED_C,0.5) }
        else if (speaking){ hgt=3+Math.floor(Math.random()*18); col=hgt>12?C.PRI:C.PRI_DIM }
        else              { hgt=Math.round(3+2*Math.sin(tick*0.09+i*0.6)); col=rgba(C.BORDER_B,0.7) }
        ctx.fillStyle=col; ctx.fillRect(wx0+i*bw, wy+20-hgt, bw-1, hgt)
      }

      tick++
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />
}

// ─── MetricBar — mirrors MetricBar.paintEvent (38px fixed height) ─────────────
function MetricBar({ label, value, text, color }: { label: string; value: number; text: string; color: string }) {
  const col = value > 85 ? C.RED : value > 65 ? C.ACC : color
  return (
    <div style={{ height:38, position:'relative', background:C.PANEL2, border:`1px solid ${C.BORDER_A}`, borderRadius:4, flexShrink:0 }}>
      <span style={{ position:'absolute', top:5, left:8, fontSize:7, fontWeight:700, color:C.TEXT_DIM, fontFamily:'"Courier New"', letterSpacing:'0.1em' }}>{label}</span>
      <span style={{ position:'absolute', top:4, right:6, fontSize:9, fontWeight:700, color:text==='--'?C.TEXT_DIM:col, fontFamily:'"Courier New"', textShadow:text!=='--'?`0 0 5px ${col}`:'none' }}>{text}</span>
      <div style={{ position:'absolute', top:29, left:6, right:6, height:4, background:C.BAR_BG, borderRadius:2 }}>
        <div style={{ height:4, width:`${Math.max(0,Math.min(100,value))}%`, background:col, borderRadius:2, boxShadow:`0 0 4px ${col}`, transition:'width 1.5s ease' }} />
      </div>
    </div>
  )
}

// ─── LogWidget — character-by-character typing at 6ms per char ───────────────
function LogWidget({ linesRef }: { linesRef: React.MutableRefObject<LogLine[]> }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) })
  return (
    <div style={{ flex:1, minHeight:0, overflowY:'auto', background:C.PANEL, border:`1px solid ${C.BORDER}`, borderRadius:4, padding:'6px 8px' }}>
      {linesRef.current.map(l => (
        <div key={l.id} style={{ fontFamily:'"Courier New"', fontSize:9, color:l.color, lineHeight:'1.6', whiteSpace:'pre-wrap', wordBreak:'break-word', minHeight:'1.2em' }}>
          {l.text}
          {l.text.length < l.fullText.length && <span style={{ borderRight:`1px solid ${l.color}` }}>&nbsp;</span>}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}

// ─── FileDropZone — animated dashed SVG border, drag/hover/file states ────────
function FileDropZone({ onFile }: { onFile: (name: string, size: string) => void }) {
  const [dragging, setDragging] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [file, setFile]         = useState<{ name: string; size: string } | null>(null)
  const [dashOff, setDashOff]   = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setInterval(() => setDashOff(d => (d + 0.8) % 20), 40)
    return () => clearInterval(t)
  }, [])

  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`

  const handleFile = (f: File) => {
    const sz = fmtSize(f.size)
    setFile({ name: f.name, size: sz })
    onFile(f.name, sz)
  }

  const borderCol = file    ? rgba(C.GREEN, 200/255)
                  : dragging ? rgba(C.PRI,   230/255)
                  : hovering  ? rgba(C.BORDER_B, 200/255)
                  :             rgba(C.BORDER, 160/255)
  const bgCol = dragging ? rgba('#001a24', 1) : hovering ? rgba('#001218', 1) : C.PANEL

  return (
    <div style={{ height:100, position:'relative', flexShrink:0, cursor:file?'default':'pointer' }}
      onClick={() => !file && inputRef.current?.click()}
      onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); const f=e.dataTransfer.files[0]; if(f) handleFile(f) }}
    >
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', overflow:'visible' }}>
        <rect x="6" y="6" width="calc(100% - 12)" height="calc(100% - 12)" rx="6" ry="6"
          fill={bgCol} stroke={borderCol} strokeWidth="1.5" strokeDasharray="4 4" strokeDashoffset={dashOff} />
      </svg>
      <div style={{ position:'absolute', inset:6, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5 }}>
        {file ? (
          <>
            <div style={{ fontSize:9, fontWeight:700, color:C.GREEN, fontFamily:'"Courier New"', textShadow:`0 0 6px ${C.GREEN}` }}>
              ▣ {file.name.length > 34 ? file.name.slice(0,31)+'...' : file.name}
            </div>
            <div style={{ fontSize:7, color:C.TEXT_DIM, fontFamily:'"Courier New"' }}>{file.size} · loaded</div>
            <button onClick={e => { e.stopPropagation(); setFile(null) }}
              style={{ fontSize:8, color:C.RED, background:'transparent', border:`1px solid ${rgba(C.RED,0.4)}`, borderRadius:2, padding:'1px 6px', cursor:'pointer', fontFamily:'"Courier New"' }}>
              ✕ clear
            </button>
          </>
        ) : dragging ? (
          <>
            <div style={{ fontSize:20, color:C.PRI }}>⬇</div>
            <div style={{ fontSize:8, fontWeight:700, color:C.PRI, fontFamily:'"Courier New"' }}>Release to load</div>
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ opacity: hovering?0.8:0.45 }}>
              <line x1="12" y1="3" x2="12" y2="17" stroke={hovering?C.PRI:C.PRI_DIM} strokeWidth="2" strokeLinecap="round"/>
              <polyline points="7,8 12,3 17,8" fill="none" stroke={hovering?C.PRI:C.PRI_DIM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="5" y1="20" x2="19" y2="20" stroke={hovering?C.PRI:C.PRI_DIM} strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div style={{ fontSize:8, color:hovering?C.TEXT_MED:C.PRI_DIM, fontFamily:'"Courier New"', textAlign:'center' }}>Drop file here  or  Click to Browse</div>
            <div style={{ fontSize:7, color:'#1a4a5a', fontFamily:'"Courier New"' }}>Images · Video · Audio · PDF · Docs · Code · Data</div>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" style={{ display:'none' }} onChange={e => { const f=e.target.files?.[0]; if(f) handleFile(f) }} />
    </div>
  )
}

// ─── Section label (▸ LABEL) ──────────────────────────────────────────────────
function SLabel({ text }: { text: string }) {
  return <div style={{ fontFamily:'"Courier New"', fontSize:7, fontWeight:700, color:C.TEXT_MED, letterSpacing:'0.14em', flexShrink:0 }}>▸ {text}</div>
}
function Sep() {
  return <div style={{ height:1, background:C.BORDER, margin:'2px 0', flexShrink:0 }} />
}

// ─── ProcessesPanel — floating overlay for process management ────────────────
function ProcessesPanel({
  processes,
  onClose,
  onKill,
  onRefresh
}: {
  processes: ProcessInfo[];
  onClose: () => void;
  onKill: (pid: number) => void;
  onRefresh: () => void;
}) {
  return (
    <div style={{
      position: 'fixed',
      bottom: FOOTER_H + BOTTOM_STRIP_H + 16,
      right: RIGHT_W + 16,
      width: 420,
      maxHeight: 400,
      background: C.PANEL,
      border: `2px solid ${C.PRI}`,
      borderRadius: 6,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      boxShadow: `0 0 16px ${rgba(C.PRI, 0.3)}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: `1px solid ${C.BORDER}`, flexShrink: 0 }}>
        <div style={{ fontFamily: '"Courier New"', fontSize: 9, fontWeight: 700, color: C.PRI, letterSpacing: '0.08em' }}>PROCESSES</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onRefresh}
            style={{ fontSize: 8, color: C.TEXT_MED, background: 'transparent', border: `1px solid ${C.TEXT_MED}`, borderRadius: 2, padding: '2px 6px', cursor: 'pointer', fontFamily: '"Courier New"', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.PRI; (e.currentTarget as HTMLElement).style.borderColor = C.PRI }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.TEXT_MED; (e.currentTarget as HTMLElement).style.borderColor = C.TEXT_MED }}>
            ⟳ Refresh
          </button>
          <button onClick={onClose}
            style={{ fontSize: 8, color: C.RED, background: 'transparent', border: `1px solid ${C.RED}`, borderRadius: 2, padding: '2px 6px', cursor: 'pointer', fontFamily: '"Courier New"' }}>
            ✕ Close
          </button>
        </div>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {processes.length === 0 ? (
          <div style={{ padding: '12px', color: C.TEXT_DIM, fontSize: 8, textAlign: 'center', fontFamily: '"Courier New"' }}>No processes</div>
        ) : (
          processes.map(p => (
            <div key={p.pid} style={{ padding: '8px 12px', borderBottom: `1px solid ${C.BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: '"Courier New"', fontSize: 8, color: C.PRI, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.pid} · {p.name}
                </div>
                <div style={{ fontFamily: '"Courier New"', fontSize: 7, color: C.TEXT_DIM, marginTop: 2 }}>
                  CPU {p.cpu_percent.toFixed(1)}% · MEM {p.memory_percent.toFixed(1)}%
                </div>
              </div>
              <button onClick={() => onKill(p.pid)}
                style={{ fontSize: 7, color: C.RED, background: 'transparent', border: `1px solid ${C.RED}`, borderRadius: 2, padding: '2px 4px', cursor: 'pointer', fontFamily: '"Courier New"', flexShrink: 0 }}>
                Kill
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // typing-animated log (ref + forceUpdate instead of state to avoid stale closures)
  const logRef   = useRef<LogLine[]>([])
  const [, bump] = useReducer((n:number)=>n+1, 0)
  const queueRef = useRef<{ text:string; color:string }[]>([])
  const typingRef   = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null)

  function processQueue() {
    if (queueRef.current.length === 0) { typingRef.current = false; return }
    typingRef.current = true
    const item = queueRef.current.shift()!
    const id = nid()
    logRef.current = [...logRef.current, { id, text:'', fullText:item.text, color:item.color }]
    bump()
    let pos = 0
    intervalRef.current = setInterval(() => {
      pos++
      const idx = logRef.current.findIndex(l => l.id === id)
      if (idx >= 0) {
        const updated = [...logRef.current]
        updated[idx] = { ...updated[idx], text: item.text.slice(0, pos) }
        logRef.current = updated
        bump()
      }
      if (pos >= item.text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setTimeout(processQueue, 20)
      }
    }, 6)
  }

  function appendLog(text: string, role: Role) {
    queueRef.current.push({ text, color: colorForRole(role) })
    if (!typingRef.current) processQueue()
  }

  // state
  const [muted,           setMuted]           = useState(false)
  const [hudState,        setHudState]        = useState<HudState>('INITIALISING')
  const [backendOnline,   setBackendOnline]   = useState<boolean|null>(null)
  const [metrics,         setMetrics]         = useState<SysMetrics>({ cpu:0,mem:0,net:0,gpu:-1,tmp:-1,uptime:'--:--',procs:0,os:'WIN' })
  const [clock,           setClock]           = useState('')
  const [dateStr,         setDateStr]         = useState('')
  const [inputVal,        setInputVal]        = useState('')
  const [loading,         setLoading]         = useState(false)
  const [fileHint,        setFileHint]        = useState('No file loaded — drop or click above to upload')
  const [isListening,     setIsListening]     = useState(false)
  const [voiceSupported,  setVoiceSupported]  = useState(false)
  const [liveRunning,     setLiveRunning]     = useState(false)
  const [liveStatus,      setLiveStatus]      = useState<LiveStatus>('OFFLINE')
  const [ttsEnabled,      setTtsEnabled]      = useState(false)
  const [showProcesses,   setShowProcesses]   = useState(false)
  const [processes,       setProcesses]       = useState<ProcessInfo[]>([])
  const [pendingApproval, setPendingApproval] = useState<string | null>(null)

  const mutedRef  = useRef(muted);   useEffect(() => { mutedRef.current = muted },   [muted])
  const loadRef   = useRef(loading); useEffect(() => { loadRef.current  = loading }, [loading])
  const onlineRef = useRef(backendOnline); useEffect(() => { onlineRef.current = backendOnline }, [backendOnline])
  const liveRunRef = useRef(liveRunning); useEffect(() => { liveRunRef.current = liveRunning }, [liveRunning])
  const recRef    = useRef<SR>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // init
  useEffect(() => {
    const tick = () => {
      setClock(new Date().toLocaleTimeString('en-US',{hour12:false}))
      setDateStr(new Date().toLocaleDateString('en-US',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}))
    }
    tick(); const t = setInterval(tick, 1000)
    const SR2 = (window as SR).SpeechRecognition || (window as SR).webkitSpeechRecognition
    setVoiceSupported(!!SR2)
    checkBackend(); fetchMetrics()
    const poll = setInterval(fetchMetrics, 2000)
    return () => { clearInterval(t); clearInterval(poll); if(intervalRef.current) clearInterval(intervalRef.current); recRef.current?.abort() }
  }, [])

  // live voice state polling
  useEffect(() => {
    if (!liveRunRef.current) return
    const pollLogs = setInterval(async () => {
      try {
        const r = await fetch(`${API_BASE}/api/live/logs`); if (!r.ok) return
        const d = await r.json()
        if (d.logs && Array.isArray(d.logs)) {
          d.logs.forEach((log: string) => appendLog(log, 'sys'))
        }
      } catch { /* silent */ }
    }, 2000)
    return () => clearInterval(pollLogs)
  }, [liveRunning])

  // live state polling
  useEffect(() => {
    const pollState = setInterval(async () => {
      try {
        const r = await fetch(`${API_BASE}/api/live/state`); if (!r.ok) return
        const d = await r.json()
        if (d.status) setLiveStatus(d.status)
      } catch { /* silent */ }
    }, 3000)
    return () => clearInterval(pollState)
  }, [])

  async function checkBackend() {
    try {
      const r = await fetch(`${API_BASE}/api/status`); if (!r.ok) throw new Error()
      setBackendOnline(true); setHudState('LISTENING')
      appendLog('SYS: Backend connected. JARVIS online.', 'sys')
    } catch {
      setBackendOnline(false); setHudState('OFFLINE')
      appendLog('SYS: Backend offline. Start the backend service.', 'err')
    }
  }

  async function fetchMetrics() {
    try {
      const r = await fetch(`${API_BASE}/api/system/info`); if (!r.ok) return
      const d = await r.json()
      setMetrics({ cpu:d.cpu_percent??0, mem:d.mem_percent??0, net:d.net_mbps??0, gpu:d.gpu??-1, tmp:d.tmp??-1, uptime:d.uptime_hm??'--:--', procs:d.proc_count??0, os:d.os??'WIN' })
    } catch { /* silent */ }
  }

  async function fetchProcesses() {
    try {
      const r = await fetch(`${API_BASE}/api/processes`); if (!r.ok) return
      const d = await r.json()
      if (d.processes && Array.isArray(d.processes)) {
        setProcesses(d.processes)
      }
    } catch { /* silent */ }
  }

  const sendMessage = useCallback(async (text: string) => {
    const q = text.trim(); if (!q || loadRef.current) return
    setInputVal(''); setLoading(true); setHudState('THINKING')
    appendLog(`You: ${q}`, 'user')
    try {
      const r = await fetch(`${API_BASE}/api/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:q}) })
      if (!r.ok) throw new Error()
      const d = await r.json()

      // Check for approval requirement
      if (d.requires_approval) {
        setPendingApproval(d.pending_action || 'Awaiting approval')
      }

      let reply: string = d.reply || 'Acknowledged.'
      if (d.data?.examples?.length) reply += '\n' + (d.data.examples as string[]).map((e:string)=>`  › ${e}`).join('\n')
      setHudState('SPEAKING')
      appendLog(`Jarvis: ${reply}`, 'jarvis')

      // Text-to-speech if enabled
      if (ttsEnabled && window.speechSynthesis) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(reply)
        utterance.rate = 1.0
        window.speechSynthesis.speak(utterance)
      }

      setTimeout(() => setHudState(mutedRef.current ? 'MUTED' : 'LISTENING'), 2200)
    } catch {
      setHudState(onlineRef.current ? 'LISTENING' : 'OFFLINE')
      appendLog('ERR: Backend unreachable.', 'err')
      setBackendOnline(false)
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttsEnabled])

  // voice
  function toggleMic() {
    if (!voiceSupported) { appendLog('SYS: Speech recognition unavailable in this runtime.', 'err'); return }
    if (isListening) { recRef.current?.stop(); setIsListening(false); return }
    const SRClass = (window as SR).SpeechRecognition || (window as SR).webkitSpeechRecognition
    const rec: SR = new SRClass()
    rec.lang='en-US'; rec.interimResults=false; rec.maxAlternatives=1
    rec.onstart   = () => { setIsListening(true); setHudState('LISTENING'); appendLog('SYS: Listening…', 'sys') }
    rec.onresult  = (e: SR) => {
      const t: string = e.results[0][0].transcript
      setInputVal(t); appendLog(`SYS: Voice captured: "${t}"`, 'sys')
      if (AUTO_SEND_VOICE) sendMessage(t)
    }
    rec.onerror   = (e: SR) => {
      setIsListening(false); setHudState(mutedRef.current?'MUTED':'LISTENING')
      const m: Record<string,string> = { 'not-allowed':'ERR: Microphone access denied.','no-speech':'SYS: No speech detected.','audio-capture':'ERR: Microphone unavailable.' }
      appendLog(m[e.error as string] ?? `ERR: Voice error: ${e.error as string}`, 'err')
    }
    rec.onend = () => { setIsListening(false); setHudState(mutedRef.current?'MUTED':'LISTENING'); recRef.current=null }
    recRef.current = rec; rec.start()
  }

  function toggleMute() {
    const next = !muted; setMuted(next)
    if (next) { setHudState('MUTED'); appendLog('SYS: Microphone muted.', 'sys') }
    else      { setHudState('LISTENING'); appendLog('SYS: Microphone active.', 'sys') }
  }

  async function toggleLiveVoice() {
    if (liveRunning) {
      try {
        await fetch(`${API_BASE}/api/live/stop`, { method: 'POST' })
        setLiveRunning(false)
        setLiveStatus('OFFLINE')
        appendLog('SYS: Live voice stopped.', 'sys')
      } catch {
        appendLog('ERR: Failed to stop live voice.', 'err')
      }
    } else {
      try {
        setLiveRunning(true)
        setLiveStatus('CONNECTING')
        const r = await fetch(`${API_BASE}/api/live/start`, { method: 'POST' })
        if (r.ok) {
          setLiveStatus('LISTENING')
          appendLog('SYS: Live voice started.', 'sys')
        } else {
          setLiveRunning(false)
          setLiveStatus('ERROR')
          appendLog('ERR: Failed to start live voice.', 'err')
        }
      } catch {
        setLiveRunning(false)
        setLiveStatus('ERROR')
        appendLog('ERR: Live voice connection failed.', 'err')
      }
    }
  }

  function toggleTts() {
    const next = !ttsEnabled
    setTtsEnabled(next)
    if (next) {
      appendLog('SYS: Text-to-speech enabled.', 'sys')
    } else {
      window.speechSynthesis?.cancel()
      appendLog('SYS: Text-to-speech disabled.', 'sys')
    }
  }

  function stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      appendLog('SYS: Speaking stopped.', 'sys')
    }
  }

  async function killProcess(pid: number) {
    try {
      await fetch(`${API_BASE}/api/process/kill`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pid }) })
      appendLog(`SYS: Process ${pid} killed.`, 'sys')
      await fetchProcesses()
    } catch {
      appendLog(`ERR: Failed to kill process ${pid}.`, 'err')
    }
  }

  async function approveAction() {
    try {
      const r = await fetch(`${API_BASE}/api/approve`, { method: 'POST' })
      if (r.ok) {
        setPendingApproval(null)
        appendLog('SYS: Action approved.', 'sys')
      }
    } catch {
      appendLog('ERR: Failed to approve action.', 'err')
    }
  }

  async function cancelApproval() {
    try {
      const r = await fetch(`${API_BASE}/api/cancel-approval`, { method: 'POST' })
      if (r.ok) {
        setPendingApproval(null)
        appendLog('SYS: Approval cancelled.', 'sys')
      }
    } catch {
      appendLog('ERR: Failed to cancel approval.', 'err')
    }
  }

  // F4 / F11 shortcuts (mirrors QShortcut in original)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key==='F4')  { e.preventDefault(); toggleMute() }
      if (e.key==='F11') { e.preventDefault(); document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen() }
      if (e.key==='p' || e.key==='P') { e.preventDefault(); setShowProcesses(s => !s) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted])

  const netStr = metrics.net < 1 ? `${(metrics.net*1024).toFixed(0)}KB/s` : `${metrics.net.toFixed(1)}MB/s`

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', width:'100%', background:C.BG, overflow:'hidden', fontFamily:'"Courier New",monospace' }}>

      {/* ── HEADER 54px ── mirrors _build_header() */}
      <div style={{ height:HEADER_H, flexShrink:0, background:C.DARK, borderBottom:`1px solid ${C.BORDER_B}`, display:'flex', alignItems:'center', padding:'0 16px' }}>
        <div style={{ minWidth:110 }} />
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
          <div style={{ fontFamily:'"Courier New"', fontSize:17, fontWeight:700, color:C.PRI, letterSpacing:'0.2em', textShadow:`0 0 16px ${C.PRI}, 0 0 30px ${rgba(C.PRI,0.28)}` }}>J.A.R.V.I.S</div>
          <div style={{ fontFamily:'"Courier New"', fontSize:7, color:C.PRI_DIM, letterSpacing:'0.1em' }}>Just A Rather Very Intelligent System</div>
        </div>
        <div style={{ flex:1 }} />
        <div style={{ minWidth:110, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
          <div style={{ fontFamily:'"Courier New"', fontSize:14, fontWeight:700, color:C.PRI, letterSpacing:'0.1em', textShadow:`0 0 10px ${rgba(C.PRI,0.5)}` }}>{clock}</div>
          <div style={{ fontFamily:'"Courier New"', fontSize:7, color:C.TEXT_DIM, letterSpacing:'0.06em' }}>{dateStr}</div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>

        {/* LEFT PANEL 148px — mirrors _build_left_panel() */}
        <div style={{ width:LEFT_W, flexShrink:0, background:C.DARK, borderRight:`1px solid ${C.BORDER}`, display:'flex', flexDirection:'column', padding:'10px 8px', gap:6, overflow:'hidden' }}>
          <div style={{ fontFamily:'"Courier New"', fontSize:7, fontWeight:700, color:C.PRI, letterSpacing:'0.12em', borderBottom:`1px solid ${C.BORDER}`, paddingBottom:4, flexShrink:0 }}>◈ SYS MONITOR</div>
          <MetricBar label="CPU" value={metrics.cpu} text={`${metrics.cpu.toFixed(0)}%`} color={C.PRI} />
          <MetricBar label="MEM" value={metrics.mem} text={`${metrics.mem.toFixed(0)}%`} color={C.ACC2} />
          <MetricBar label="NET" value={Math.min(100,metrics.net*10)} text={netStr} color={C.GREEN} />
          <MetricBar label="GPU" value={metrics.gpu>=0?metrics.gpu:0} text={metrics.gpu>=0?`${metrics.gpu.toFixed(0)}%`:'N/A'} color={C.ACC} />
          <MetricBar label="TMP" value={metrics.tmp>=0?Math.min(100,metrics.tmp):0} text={metrics.tmp>=0?`${metrics.tmp.toFixed(0)}°C`:'N/A'} color="#ff6688" />
          <div style={{ background:C.PANEL2, border:`1px solid ${C.BORDER}`, borderRadius:4, padding:'5px 6px', display:'flex', flexDirection:'column', gap:3, flexShrink:0 }}>
            <div style={{ fontFamily:'"Courier New"', fontSize:8, fontWeight:700, color:C.GREEN }}>UP {metrics.uptime}</div>
            <div style={{ fontFamily:'"Courier New"', fontSize:8, color:C.TEXT_MED }}>PROC {metrics.procs||'--'}</div>
            <div style={{ fontFamily:'"Courier New"', fontSize:8, color:C.ACC2 }}>OS {metrics.os}</div>
          </div>
          <div style={{ flex:1 }} />
          {([['AI CORE\nACTIVE',C.GREEN],['SEC\nCLEARED',C.PRI],['PROTOCOL\nXXXVIII',C.TEXT_DIM]] as [string,string][]).map(([txt,col])=>(
            <div key={txt} style={{ fontFamily:'"Courier New"', fontSize:7, fontWeight:700, color:col, textAlign:'center', whiteSpace:'pre', letterSpacing:'0.08em', lineHeight:'1.6', background:C.PANEL2, border:`1px solid ${C.BORDER_A}`, borderRadius:3, padding:'4px', textShadow:`0 0 6px ${col}`, flexShrink:0 }}>{txt}</div>
          ))}
        </div>

        {/* CENTER — HUD canvas */}
        <div style={{ flex:1, minWidth:0, position:'relative', background:`radial-gradient(ellipse at center,rgba(0,18,34,0.5) 0%,${C.BG} 72%)` }}>
          <HudCanvas hudState={hudState} muted={muted} />
        </div>

        {/* RIGHT PANEL 340px — mirrors _build_right_panel() */}
        <div style={{ width:RIGHT_W, flexShrink:0, background:C.DARK, borderLeft:`1px solid ${C.BORDER}`, display:'flex', flexDirection:'column', padding:'8px', gap:6, overflow:'hidden' }}>
          <SLabel text="ACTIVITY LOG" />
          <LogWidget linesRef={logRef} />
          <Sep />

          {/* Approval Banner */}
          {pendingApproval && (
            <div style={{ background: rgba(C.ACC2, 0.15), border: `1px solid ${C.ACC2}`, borderRadius: 4, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
              <div style={{ fontFamily: '"Courier New"', fontSize: 7, fontWeight: 700, color: C.ACC2, letterSpacing: '0.08em' }}>⚠ APPROVAL REQUIRED</div>
              <div style={{ fontFamily: '"Courier New"', fontSize: 8, color: C.WHITE, lineHeight: '1.4' }}>{pendingApproval}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={approveAction}
                  style={{ flex: 1, fontSize: 8, fontWeight: 700, color: C.GREEN, background: 'transparent', border: `1px solid ${C.GREEN}`, borderRadius: 2, padding: '4px', cursor: 'pointer', fontFamily: '"Courier New"', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = rgba(C.GREEN, 0.1) }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  ✓ YES
                </button>
                <button onClick={cancelApproval}
                  style={{ flex: 1, fontSize: 8, fontWeight: 700, color: C.RED, background: 'transparent', border: `1px solid ${C.RED}`, borderRadius: 2, padding: '4px', cursor: 'pointer', fontFamily: '"Courier New"', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = rgba(C.RED, 0.1) }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  ✕ NO
                </button>
              </div>
            </div>
          )}

          <SLabel text="FILE UPLOAD" />
          <FileDropZone onFile={(name,size) => {
            setFileHint(`${name} · ${size} · Tell JARVIS what to do with it`)
            appendLog(`FILE: ${name} (${size}) loaded`, 'file')
            sendMessage(`[FILE_UPLOADED] name=${name} size=${size} — Briefly acknowledge the file was uploaded and ask what to do with it.`)
          }} />
          <div style={{ fontFamily:'"Courier New"', fontSize:7, color:C.TEXT_MED, lineHeight:'1.4', flexShrink:0 }}>{fileHint}</div>
          <Sep />

          <SLabel text="LIVE VOICE" />
          <button
            onClick={toggleLiveVoice}
            style={{ height:30, flexShrink:0, background:liveRunning?rgba(C.GREEN,0.15):'transparent', color:liveRunning?C.GREEN:C.TEXT_MED, border:`1px solid ${liveRunning?C.GREEN:C.TEXT_MED}`, borderRadius:3, fontFamily:'"Courier New"', fontSize:8, fontWeight:700, letterSpacing:'0.08em', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { if (!liveRunning) { (e.currentTarget as HTMLElement).style.borderColor = C.PRI; (e.currentTarget as HTMLElement).style.color = C.PRI } }}
            onMouseLeave={e => { if (!liveRunning) { (e.currentTarget as HTMLElement).style.borderColor = C.TEXT_MED; (e.currentTarget as HTMLElement).style.color = C.TEXT_MED } }}
          >
            {liveRunning ? '■ STOP LIVE VOICE' : '▸ START LIVE VOICE'}
          </button>
          <div style={{ fontFamily:'"Courier New"', fontSize:8, color:liveStatus==='OFFLINE'?C.TEXT_DIM:liveStatus==='ERROR'?C.RED:liveStatus==='LISTENING'?C.GREEN:liveStatus==='SPEAKING'?C.ACC:C.PRI, fontWeight:700, letterSpacing:'0.08em', flexShrink:0 }}>
            ● {liveStatus}
          </div>
          <Sep />

          <SLabel text="TEXT-TO-SPEECH" />
          <button
            onClick={toggleTts}
            style={{ height:30, flexShrink:0, background:ttsEnabled?rgba(C.ACC,0.15):'transparent', color:ttsEnabled?C.ACC:C.TEXT_MED, border:`1px solid ${ttsEnabled?C.ACC:C.TEXT_MED}`, borderRadius:3, fontFamily:'"Courier New"', fontSize:8, fontWeight:700, letterSpacing:'0.08em', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { if (!ttsEnabled) { (e.currentTarget as HTMLElement).style.borderColor = C.PRI; (e.currentTarget as HTMLElement).style.color = C.PRI } }}
            onMouseLeave={e => { if (!ttsEnabled) { (e.currentTarget as HTMLElement).style.borderColor = C.TEXT_MED; (e.currentTarget as HTMLElement).style.color = C.TEXT_MED } }}
          >
            🔊 {ttsEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
          {ttsEnabled && (
            <button
              onClick={stopSpeaking}
              style={{ height:26, flexShrink:0, background:'transparent', color:C.RED, border:`1px solid ${C.RED}`, borderRadius:3, fontFamily:'"Courier New"', fontSize:7, fontWeight:700, letterSpacing:'0.08em', cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.ACC }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.RED }}
            >
              ■ STOP SPEAKING
            </button>
          )}
          <Sep />

          <SLabel text="COMMAND INPUT" />
          <div style={{ display:'flex', gap:5, flexShrink:0 }}>
            <input
              ref={inputRef} type="text" value={inputVal} disabled={loading}
              onChange={e=>setInputVal(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') sendMessage(inputVal) }}
              placeholder="Type a command or question…"
              style={{ flex:1, height:30, background:'#000d14', color:C.WHITE, border:`1px solid ${C.BORDER}`, borderRadius:3, padding:'3px 7px', fontFamily:'"Courier New"', fontSize:9, outline:'none' }}
              onFocus={e=>(e.currentTarget.style.borderColor=C.PRI)}
              onBlur={e=>(e.currentTarget.style.borderColor=C.BORDER)}
            />
            <button
              onClick={()=>sendMessage(inputVal)} disabled={loading||!inputVal.trim()}
              style={{ width:30, height:30, background:C.PANEL, color:C.PRI, border:`1px solid ${C.PRI_DIM}`, borderRadius:3, fontSize:11, fontWeight:700, fontFamily:'"Courier New"', flexShrink:0, opacity:loading||!inputVal.trim()?0.4:1, cursor:loading||!inputVal.trim()?'not-allowed':'pointer' }}
              onMouseEnter={e=>{ if(!loading){(e.currentTarget as HTMLElement).style.background=C.PRI_GHO;(e.currentTarget as HTMLElement).style.borderColor=C.PRI} }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background=C.PANEL;(e.currentTarget as HTMLElement).style.borderColor=C.PRI_DIM }}
            >▸</button>
          </div>

          <button
            onClick={voiceSupported ? toggleMic : toggleMute}
            style={{ height:30, flexShrink:0, background:muted?'#140006':isListening?rgba(C.PRI_GHO,1):'#00140a', color:muted?C.MUTED_C:isListening?C.PRI:C.GREEN, border:`1px solid ${muted?C.MUTED_C:isListening?C.PRI:C.GREEN}`, borderRadius:3, fontFamily:'"Courier New"', fontSize:8, fontWeight:700, letterSpacing:'0.08em', cursor:'pointer', transition:'background 0.2s' }}
          >{muted ? '🔇 MICROPHONE MUTED' : isListening ? '🎙 LISTENING…' : '🎙 MICROPHONE ACTIVE'}</button>

          <button
            onClick={() => { setShowProcesses(true); fetchProcesses() }}
            style={{ height:26, flexShrink:0, background:'transparent', color:C.TEXT_MED, border:`1px solid ${C.BORDER}`, borderRadius:3, fontSize:7, fontFamily:'"Courier New"', letterSpacing:'0.1em', cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=C.PRI;(e.currentTarget as HTMLElement).style.borderColor=C.BORDER_B }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=C.TEXT_MED;(e.currentTarget as HTMLElement).style.borderColor=C.BORDER }}
          >▸ PROCESSES [P]</button>

          <button
            onClick={()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}
            style={{ height:26, flexShrink:0, background:'transparent', color:C.TEXT_MED, border:`1px solid ${C.BORDER}`, borderRadius:3, fontSize:7, fontFamily:'"Courier New"', letterSpacing:'0.1em', cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=C.PRI;(e.currentTarget as HTMLElement).style.borderColor=C.BORDER_B }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=C.TEXT_MED;(e.currentTarget as HTMLElement).style.borderColor=C.BORDER }}
          >⛶ FULLSCREEN [F11]</button>
        </div>
      </div>

      {/* ── BOTTOM STRIP 18px — API status, mode, live status, approval indicator ── */}
      <div style={{ height:BOTTOM_STRIP_H, flexShrink:0, background:C.DARK, borderTop:`1px solid ${C.BORDER}`, display:'flex', alignItems:'center', padding:'0 12px', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:backendOnline?C.GREEN:backendOnline===false?C.RED:C.ACC2, boxShadow:`0 0 6px ${backendOnline?C.GREEN:backendOnline===false?C.RED:C.ACC2}` }} />
          <span style={{ fontFamily:'"Courier New"', fontSize:7, color:C.TEXT_DIM, letterSpacing:'0.08em' }}>API</span>
        </div>
        <span style={{ fontFamily:'"Courier New"', fontSize:7, color:C.TEXT_MED, letterSpacing:'0.08em' }}>{hudState}</span>
        {liveRunning && <span style={{ fontFamily:'"Courier New"', fontSize:7, color:C.GREEN, letterSpacing:'0.08em', fontWeight:700 }}>● LIVE</span>}
        {pendingApproval && <span style={{ fontFamily:'"Courier New"', fontSize:7, color:C.ACC2, letterSpacing:'0.08em', fontWeight:700 }}>⚠ APPROVAL</span>}
        <div style={{ flex:1 }} />
        <span style={{ fontFamily:'"Courier New"', fontSize:7, color:C.PRI_DIM, letterSpacing:'0.08em' }}>© STARK INDUSTRIES</span>
      </div>

      {/* ── FOOTER 22px ── */}
      <div style={{ height:FOOTER_H, flexShrink:0, background:C.DARK, borderTop:`1px solid ${C.BORDER}`, display:'flex', alignItems:'center', padding:'0 14px' }}>
        <span style={{ fontFamily:'"Courier New"', fontSize:7, color:C.TEXT_MED, letterSpacing:'0.08em' }}>[F4] Mute · [F11] Fullscreen · [P] Processes</span>
        <div style={{ flex:1 }} />
        <span style={{ fontFamily:'"Courier New"', fontSize:7, color:C.TEXT_MED, letterSpacing:'0.06em' }}>J.A.R.V.I.S · MARK XXXIX · CLASSIFIED</span>
      </div>

      {/* ── Floating Processes Panel ── */}
      {showProcesses && (
        <ProcessesPanel
          processes={processes}
          onClose={() => setShowProcesses(false)}
          onKill={killProcess}
          onRefresh={fetchProcesses}
        />
      )}

      <style>{`input::placeholder{color:${rgba(C.TEXT_DIM,0.5)};}`}</style>
    </div>
  )
}
