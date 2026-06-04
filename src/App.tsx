import { useState, useEffect, useRef, useCallback } from 'react'

const C = {
  BG:       '#00060a',
  PANEL:    'rgba(0,18,28,0.85)',
  PANEL2:   'rgba(0,12,20,0.9)',
  BORDER:   '#0d3347',
  BORDER_B: '#00d4ff',
  PRI:      '#00d4ff',
  PRI_DIM:  '#007a99',
  PRI_GHO:  '#001f2e',
  ACC:      '#ff6b00',
  ACC2:     '#ffcc00',
  GREEN:    '#00ff88',
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

function ts() { return new Date().toLocaleTimeString('en-US', { hour12: false }) }
function hexA(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${Math.max(0,Math.min(1,alpha))})`
}
function toRad(deg: number) { return deg * Math.PI / 180 }

// ─── HUD Canvas ──────────────────────────────────────────────────────────────
function HudCanvas({ state, muted }: { state: JarvisState; muted: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)
  const stateRef  = useRef(state)
  const mutedRef  = useRef(muted)
  useEffect(() => { stateRef.current = state }, [state])
  useEffect(() => { mutedRef.current = muted },  [muted])

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
    const particles: {x:number;y:number;vx:number;vy:number;life:number}[] = []
    let blink = true, blinkTick = 0
    // extra data stream lines
    const dataLines: {angle:number; speed:number; len:number; r:number}[] = Array.from({length:12},(_,i)=>({
      angle: i*30, speed: 0.4+Math.random()*0.6, len: 20+Math.random()*40, r: 0.55+Math.random()*0.15
    }))

    function step(now: DOMHighResTimeStamp) {
      const c = canvasRef.current; if (!c) return
      const W = c.width, H = c.height
      const st = stateRef.current, mt = mutedRef.current
      const speaking = st === 'SPEAKING'
      const cx = W/2, cy = H/2, fw = Math.min(W,H)

      if (now - lastT > (speaking ? 120 : 500)) {
        tgtScale = speaking ? 1.06+Math.random()*0.08 : mt ? 0.998+Math.random()*0.004 : 1.001+Math.random()*0.007
        tgtHalo  = speaking ? 145+Math.random()*45    : mt ? 15+Math.random()*13        : 48+Math.random()*20
        lastT = now
      }
      scale += (tgtScale - scale) * (speaking ? 0.38 : 0.15)
      halo  += (tgtHalo  - halo)  * (speaking ? 0.38 : 0.15)

      const spds = speaking ? [1.3,-0.9,2.0] : [0.55,-0.35,0.9]
      for (let i=0;i<3;i++) rings[i]=(rings[i]+spds[i]+360)%360
      scan  = (scan  + (speaking?3.0:1.3)) % 360
      scan2 = (scan2 + (speaking?-2.0:-0.75)+360) % 360

      const pspd = speaking?4.2:2.0, plim=fw*0.74
      for (let i=pulses.length-1;i>=0;i--) { pulses[i]+=pspd; if(pulses[i]>=plim) pulses.splice(i,1) }
      if (pulses.length<3 && Math.random()<(speaking?0.07:0.025)) pulses.push(0)

      if (speaking && Math.random()<0.28) {
        const ang=Math.random()*Math.PI*2, rs=fw*0.28
        particles.push({x:cx+Math.cos(ang)*rs, y:cy+Math.sin(ang)*rs, vx:Math.cos(ang)*(0.9+Math.random()*1.5), vy:Math.sin(ang)*(0.9+Math.random()*1.5)-0.4, life:1.0})
      }
      for (let i=particles.length-1;i>=0;i--) {
        const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vx*=0.97; p.vy*=0.97; p.life-=0.028
        if(p.life<=0) particles.splice(i,1)
      }

      for (const dl of dataLines) dl.angle=(dl.angle+dl.speed)%360

      blinkTick++; if(blinkTick>=38){blink=!blink;blinkTick=0}

      // ── DRAW ──────────────────────────────────────────────────────────────
      ctx.fillStyle = C.BG
      ctx.fillRect(0,0,W,H)

      const priColor = mt ? C.MUTED_C : C.PRI

      // grid dots
      ctx.fillStyle = hexA(C.PRI, 0.07)
      for(let x=0;x<W;x+=40) for(let y=0;y<H;y+=40) ctx.fillRect(x,y,1,1)

      // hex grid faint overlay
      ctx.strokeStyle = hexA(C.PRI, 0.04)
      ctx.lineWidth = 0.5
      const hexS = 44
      for(let row=0;row*hexS*1.5<H+hexS;row++) {
        for(let col=0;col*hexS*1.732<W+hexS;col++) {
          const hx = col*hexS*1.732 + (row%2===1?hexS*0.866:0)
          const hy = row*hexS*1.5
          ctx.beginPath()
          for(let i=0;i<6;i++) {
            const a=toRad(60*i-30)
            i===0?ctx.moveTo(hx+hexS*0.5*Math.cos(a),hy+hexS*0.5*Math.sin(a)):ctx.lineTo(hx+hexS*0.5*Math.cos(a),hy+hexS*0.5*Math.sin(a))
          }
          ctx.closePath(); ctx.stroke()
        }
      }

      // outer diagnostic ring with data points
      const diagR = fw*0.52
      ctx.strokeStyle = hexA(priColor, 0.15)
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(cx,cy,diagR,0,Math.PI*2); ctx.stroke()
      for(let i=0;i<24;i++){
        const a=toRad(i*15+(tick*0.3))
        const dot = i%6===0?5:i%3===0?3:1.5
        ctx.beginPath(); ctx.arc(cx+diagR*Math.cos(a),cy+diagR*Math.sin(a),dot,0,Math.PI*2)
        ctx.fillStyle = i%6===0?hexA(priColor,0.8):hexA(priColor,0.3)
        ctx.fill()
      }

      // data stream lines (radial)
      for(const dl of dataLines){
        const a=toRad(dl.angle)
        const r1=fw*dl.r, r2=r1+dl.len
        const grad=ctx.createLinearGradient(cx+r1*Math.cos(a),cy+r1*Math.sin(a),cx+r2*Math.cos(a),cy+r2*Math.sin(a))
        grad.addColorStop(0,'transparent')
        grad.addColorStop(0.5,hexA(priColor,0.6))
        grad.addColorStop(1,'transparent')
        ctx.strokeStyle=grad; ctx.lineWidth=1.5
        ctx.beginPath(); ctx.moveTo(cx+r1*Math.cos(a),cy+r1*Math.sin(a)); ctx.lineTo(cx+r2*Math.cos(a),cy+r2*Math.sin(a)); ctx.stroke()
      }

      // halo glow rings
      const rFace=fw*0.31
      for(let i=0;i<10;i++){
        const r=rFace*(1.8-i*0.08)
        const a=Math.max(0,Math.min(1,halo*0.085*(1-i/10)))
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2)
        ctx.strokeStyle=hexA(priColor,a); ctx.lineWidth=1.5; ctx.stroke()
      }

      // pulse rings
      for(const pr of pulses){
        const a=Math.max(0,230*(1-pr/(fw*0.74)))/255
        ctx.beginPath(); ctx.arc(cx,cy,pr,0,Math.PI*2)
        ctx.strokeStyle=hexA(priColor,a); ctx.lineWidth=1.5; ctx.stroke()
      }

      // spinning arc rings
      const ringDefs:[number,number,number,number][] = [[0.48,3,115,78],[0.40,2,78,55],[0.32,1,56,40]]
      for(let idx=0;idx<3;idx++){
        const [rFrac,lw,arcLen,gap]=ringDefs[idx]
        const ringR=fw*rFrac, base=rings[idx]
        const a=Math.max(0,Math.min(1,halo*(1-idx*0.18)/255))
        ctx.strokeStyle=hexA(priColor,a); ctx.lineWidth=lw
        let angle=base
        while(angle<base+360){
          ctx.beginPath(); ctx.arc(cx,cy,ringR,toRad(angle),toRad(angle+arcLen)); ctx.stroke()
          angle+=arcLen+gap
        }
      }

      // scanners
      const sr=fw*0.50, sa=Math.min(1,halo*1.5/255), ex=speaking?75:44
      ctx.strokeStyle=hexA(priColor,sa); ctx.lineWidth=2.5
      ctx.beginPath(); ctx.arc(cx,cy,sr,toRad(scan),toRad(scan+ex)); ctx.stroke()
      // scanner sweep fill
      ctx.beginPath()
      ctx.moveTo(cx,cy)
      ctx.arc(cx,cy,sr,toRad(scan),toRad(scan+ex))
      ctx.closePath()
      const swpGrad=ctx.createRadialGradient(cx,cy,0,cx,cy,sr)
      swpGrad.addColorStop(0,hexA(priColor,0.0))
      swpGrad.addColorStop(1,hexA(priColor,sa*0.12))
      ctx.fillStyle=swpGrad; ctx.fill()

      ctx.strokeStyle=hexA(C.ACC,sa*0.5); ctx.lineWidth=1.5
      ctx.beginPath(); ctx.arc(cx,cy,sr,toRad(scan2),toRad(scan2+ex)); ctx.stroke()

      // tick marks
      const tOut=fw*0.497, tIn=fw*0.474
      ctx.strokeStyle=hexA(C.PRI,0.55); ctx.lineWidth=1
      for(let deg=0;deg<360;deg+=10){
        const rad=toRad(deg), inn=deg%30===0?tIn:tIn+6
        ctx.beginPath(); ctx.moveTo(cx+tOut*Math.cos(rad),cy-tOut*Math.sin(rad)); ctx.lineTo(cx+inn*Math.cos(rad),cy-inn*Math.sin(rad)); ctx.stroke()
      }

      // crosshair
      const chR=fw*0.51, gapH=fw*0.16
      ctx.strokeStyle=hexA(C.PRI,halo*0.5/255); ctx.lineWidth=1
      ctx.beginPath()
      ctx.moveTo(cx-chR,cy); ctx.lineTo(cx-gapH,cy)
      ctx.moveTo(cx+gapH,cy); ctx.lineTo(cx+chR,cy)
      ctx.moveTo(cx,cy-chR); ctx.lineTo(cx,cy-gapH)
      ctx.moveTo(cx,cy+gapH); ctx.lineTo(cx,cy+chR)
      ctx.stroke()

      // corner brackets
      const bl=24, hl=cx-fw/2, hr=cx+fw/2, ht=cy-fw/2, hb=cy+fw/2
      ctx.strokeStyle=hexA(C.PRI,0.9); ctx.lineWidth=2
      for(const [bx,by,dx,dy] of [[hl,ht,1,1],[hr,ht,-1,1],[hl,hb,1,-1],[hr,hb,-1,-1]] as [number,number,number,number][]){
        ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+dx*bl,by); ctx.moveTo(bx,by); ctx.lineTo(bx,by+dy*bl); ctx.stroke()
        // glow dot at corner
        ctx.beginPath(); ctx.arc(bx,by,2,0,Math.PI*2); ctx.fillStyle=hexA(C.PRI,0.9); ctx.fill()
      }

      // face orb
      const orbR=fw*0.27*scale
      const oc=mt?[200,0,50]:[0,80,140]
      for(let i=8;i>0;i--){
        const r2=orbR*i/8, frc=i/8, a=Math.max(0,Math.min(1,halo*1.1*frc/255))
        const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,r2)
        grad.addColorStop(0,`rgba(${Math.round(oc[0]*frc*1.5)},${Math.round(oc[1]*frc*2.5)},${Math.round(oc[2]*frc*3)},${a})`)
        grad.addColorStop(1,`rgba(${Math.round(oc[0]*frc)},${Math.round(oc[1]*frc)},${Math.round(oc[2]*frc)},0)`)
        ctx.beginPath(); ctx.arc(cx,cy,r2,0,Math.PI*2); ctx.fillStyle=grad; ctx.fill()
      }
      // inner ring on orb
      ctx.strokeStyle=hexA(priColor,Math.min(1,halo*1.5/255)); ctx.lineWidth=1
      ctx.beginPath(); ctx.arc(cx,cy,orbR*0.85,0,Math.PI*2); ctx.stroke()
      // J.A.R.V.I.S text
      ctx.save()
      ctx.font=`bold 13px "Courier New", monospace`
      ctx.fillStyle=hexA(C.PRI,Math.min(1,halo*2.5/255))
      ctx.shadowColor=C.PRI; ctx.shadowBlur=12
      ctx.textAlign='center'; ctx.textBaseline='middle'
      ctx.fillText('J.A.R.V.I.S',cx,cy)
      ctx.restore()

      // particles
      for(const pt of particles){
        ctx.beginPath(); ctx.arc(pt.x,pt.y,2.5,0,Math.PI*2)
        ctx.fillStyle=hexA(C.PRI,pt.life)
        ctx.shadowColor=C.PRI; ctx.shadowBlur=6
        ctx.fill(); ctx.shadowBlur=0
      }

      // status text
      const sy=cy+fw*0.40
      let stTxt='', stCol=C.PRI
      if(mt){stTxt='⊘ MUTED';stCol=C.MUTED_C}
      else if(speaking){stTxt='● SPEAKING';stCol=C.ACC}
      else if(st==='THINKING'){stTxt=`${blink?'◈':'◇'} THINKING`;stCol=C.ACC2}
      else if(st==='PROCESSING'){stTxt=`${blink?'▷':'▶'} PROCESSING`;stCol=C.ACC2}
      else if(st==='LISTENING'){stTxt=`${blink?'●':'○'} LISTENING`;stCol=C.GREEN}
      else if(st==='OFFLINE'){stTxt=`${blink?'●':'○'} OFFLINE`;stCol=C.RED}
      else{stTxt=`${blink?'●':'○'} ${st}`;stCol=C.PRI}
      ctx.save()
      ctx.font=`bold 11px "Courier New", monospace`
      ctx.fillStyle=stCol; ctx.shadowColor=stCol; ctx.shadowBlur=10
      ctx.textAlign='center'; ctx.textBaseline='top'
      ctx.fillText(stTxt,cx,sy); ctx.restore()

      // waveform
      const wy=sy+28, N=36, bw=8, wx0=(W-N*bw)/2
      for(let i=0;i<N;i++){
        let hgt:number, cl:string
        if(mt){hgt=2;cl=C.MUTED_C}
        else if(speaking){hgt=3+Math.floor(Math.random()*20);cl=hgt>14?C.PRI:hexA(C.PRI,0.55)}
        else{hgt=3+Math.round(2*Math.sin(tick*0.09+i*0.6));cl=hexA(C.BORDER_B,0.6)}
        ctx.fillStyle=cl
        ctx.shadowColor=cl; ctx.shadowBlur=hgt>10?6:0
        ctx.fillRect(wx0+i*bw,wy+20-hgt,bw-1,hgt)
        ctx.shadowBlur=0
      }

      // scanline overlay every few ticks
      if(tick%3===0){
        const scanY=(tick*2)%H
        ctx.fillStyle=hexA(C.PRI,0.012)
        ctx.fillRect(0,scanY,W,2)
      }

      tick++
      animRef.current = requestAnimationFrame(step as FrameRequestCallback)
    }
    animRef.current = requestAnimationFrame(step as FrameRequestCallback)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return <canvas ref={canvasRef} width={700} height={700} style={{width:'100%',height:'100%',display:'block'}} />
}

// ─── Panel with glow border ───────────────────────────────────────────────────
function GlowPanel({ children, style, accent }: { children: React.ReactNode; style?: React.CSSProperties; accent?: string }) {
  const col = accent ?? C.PRI
  return (
    <div style={{
      position: 'relative', background: C.PANEL,
      border: `1px solid ${hexA(col, 0.4)}`,
      borderRadius: 2,
      boxShadow: `0 0 12px ${hexA(col,0.08)}, inset 0 0 20px ${hexA(col,0.03)}`,
      backdropFilter: 'blur(8px)',
      ...style,
    }}>
      {/* corner brackets */}
      {(['tl','tr','bl','br'] as const).map(pos => (
        <span key={pos} style={{
          position: 'absolute',
          ...(pos==='tl'?{top:0,left:0}:pos==='tr'?{top:0,right:0}:pos==='bl'?{bottom:0,left:0}:{bottom:0,right:0}),
          width: 10, height: 10,
          borderTop: pos.startsWith('t') ? `2px solid ${hexA(col,0.9)}` : 'none',
          borderBottom: pos.startsWith('b') ? `2px solid ${hexA(col,0.9)}` : 'none',
          borderLeft: pos.endsWith('l') ? `2px solid ${hexA(col,0.9)}` : 'none',
          borderRight: pos.endsWith('r') ? `2px solid ${hexA(col,0.9)}` : 'none',
        }} />
      ))}
      {children}
    </div>
  )
}

// ─── MetricBar ────────────────────────────────────────────────────────────────
function MetricBar({ label, value, text, color }: { label:string; value:number; text:string; color:string }) {
  const col = value>85?C.RED:value>65?C.ACC:color
  return (
    <div style={{ marginBottom: 7, padding: '4px 8px', background: 'rgba(0,12,20,0.7)', border: `1px solid ${hexA(col,0.25)}`, borderRadius: 2 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4, alignItems:'center' }}>
        <span style={{ fontSize:8, fontFamily:'Courier New', color:C.TEXT_DIM, letterSpacing:'0.1em', fontWeight:700 }}>{label}</span>
        <span style={{ fontSize:9, fontFamily:'Courier New', color:col, fontWeight:700, textShadow:`0 0 8px ${col}` }}>{text}</span>
      </div>
      <div style={{ height:3, background:'rgba(0,20,35,0.8)', borderRadius:2, overflow:'hidden' }}>
        <div style={{
          height:3, width:`${value}%`, borderRadius:2,
          background: `linear-gradient(90deg, ${hexA(col,0.5)}, ${col})`,
          boxShadow: `0 0 6px ${col}`,
          transition:'width 1s ease',
        }} />
      </div>
    </div>
  )
}

// ─── Animated label ───────────────────────────────────────────────────────────
function SectionLabel({ text, accent }: { text:string; accent?:string }) {
  const col = accent ?? C.TEXT_MED
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
      <span style={{ fontSize:7, fontWeight:700, letterSpacing:'0.18em', color:col, textShadow:`0 0 8px ${col}` }}>▸ {text}</span>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${hexA(col,0.4)}, transparent)` }} />
    </div>
  )
}

// ─── Log ─────────────────────────────────────────────────────────────────────
function LogWidget({ messages }: { messages: Msg[] }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages])
  const col = (role:Msg['role']) => role==='jarvis'?C.PRI:role==='user'?C.WHITE:role==='err'?C.RED:role==='file'?C.GREEN:C.ACC2
  return (
    <div style={{
      flex:1, overflowY:'auto',
      background:'rgba(0,6,10,0.9)',
      border:`1px solid ${hexA(C.BORDER_B,0.15)}`,
      borderRadius:2, padding:'8px 10px',
      fontFamily:'Courier New', fontSize:10.5, lineHeight:1.6,
    }}>
      {messages.map((m,i) => (
        <div key={i} style={{ color:col(m.role), marginBottom:2, whiteSpace:'pre-wrap', wordBreak:'break-word',
          textShadow: m.role==='err'?`0 0 8px ${C.RED}`:m.role==='jarvis'?`0 0 6px ${hexA(C.PRI,0.5)}`:'none' }}>
          {m.text}
        </div>
      ))}
      {messages.length===0 && <div style={{color:C.TEXT_DIM,fontSize:9}}>No activity.</div>}
      <div ref={endRef} />
    </div>
  )
}

// ─── Quick commands ───────────────────────────────────────────────────────────
const QUICK_CMDS = ['help','check docker','system status','open notepad','create standup','remember this project is my JARVIS assistant','show memory','azure adf help','tableau help','jenkins help']

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [jarvisState, setJarvisState] = useState<JarvisState>('INITIALISING')
  const [muted, setMuted] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([{role:'sys',text:'SYS: J.A.R.V.I.S Mark XXXIX initialising…',ts:ts()}])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean|null>(null)
  const [metrics, setMetrics] = useState({cpu:0,mem:0,net:0,gpu:-1,tmp:-1})
  const [uptime, setUptime] = useState('--:--')
  const [procs, setProcs] = useState('--')
  const [memCount, setMemCount] = useState(0)
  const [pendingApproval, setPendingApproval] = useState<string|null>(null)
  const [clock, setClock] = useState('')
  const [dateStr, setDateStr] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const tick=()=>{
      setClock(new Date().toLocaleTimeString('en-US',{hour12:false}))
      setDateStr(new Date().toLocaleDateString('en-US',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}))
    }
    tick(); const t=setInterval(tick,1000); return ()=>clearInterval(t)
  },[])

  useEffect(() => {
    checkBackend(); fetchMetrics(); fetchMemory()
    const t=setInterval(fetchMetrics,4000); return ()=>clearInterval(t)
  },[])

  async function checkBackend() {
    try {
      const r=await fetch('http://localhost:8000/api/status')
      if(r.ok){ setBackendOnline(true); setJarvisState('LISTENING'); addLog({role:'sys',text:'SYS: Backend online. JARVIS Mark XXXIX ready.',ts:ts()}) }
      else throw new Error()
    } catch { setBackendOnline(false); setJarvisState('OFFLINE'); addLog({role:'err',text:'ERR: Backend offline. Run: docker run --rm -p 8000:8000 jarvis-backend',ts:ts()}) }
  }

  async function fetchMetrics() {
    try {
      const r=await fetch('http://localhost:8000/api/system/info')
      if(!r.ok)return
      const d=await r.json()
      if(d.cpu_percent!==undefined) setMetrics({cpu:d.cpu_percent,mem:d.mem_percent,net:d.net_mbps??0,gpu:d.gpu??-1,tmp:d.tmp??-1})
      if(d.uptime_hm) setUptime(d.uptime_hm)
      if(d.proc_count) setProcs(String(d.proc_count))
    } catch {}
  }

  async function fetchMemory() {
    try{const r=await fetch('http://localhost:8000/api/memory');if(r.ok){const d=await r.json();setMemCount(d.count??0)}}catch{}
  }

  function addLog(msg:Msg){ setMessages(p=>[...p,msg]) }

  const sendMessage=useCallback(async(text:string)=>{
    const q=text.trim(); if(!q||loading)return
    setInput(''); setLoading(true); setJarvisState('THINKING')
    addLog({role:'user',text:`You: ${q}`,ts:ts()})
    try{
      const r=await fetch('http://localhost:8000/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q})})
      if(!r.ok)throw new Error()
      const d=await r.json()
      let reply=d.reply||'Acknowledged.'
      if(d.data?.examples?.length) reply+='\n\nExamples:\n'+(d.data.examples as string[]).map((e:string)=>`• ${e}`).join('\n')
      if(d.requires_approval) setPendingApproval(d.pending_action??q)
      addLog({role:'jarvis',text:`Jarvis: ${reply}`,ts:ts()})
      setJarvisState('LISTENING')
      if(q.toLowerCase().startsWith('remember')||q.toLowerCase()==='show memory') fetchMemory()
    }catch{
      addLog({role:'err',text:'ERR: Backend unreachable. Run: docker run --rm -p 8000:8000 jarvis-backend',ts:ts()})
      setJarvisState('OFFLINE')
    }finally{ setLoading(false); inputRef.current?.focus() }
  },[loading])

  function toggleMute(){
    const next=!muted; setMuted(next); setJarvisState(next?'MUTED':'LISTENING')
    addLog({role:'sys',text:next?'SYS: Microphone muted.':'SYS: Microphone active.',ts:ts()})
  }

  const stateColor = jarvisState==='LISTENING'?C.GREEN:jarvisState==='SPEAKING'?C.ACC:jarvisState==='THINKING'||jarvisState==='PROCESSING'?C.ACC2:jarvisState==='OFFLINE'?C.RED:jarvisState==='MUTED'?C.MUTED_C:C.PRI

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:C.BG,color:C.TEXT,fontFamily:'Courier New, monospace',overflow:'hidden',position:'relative'}}>

      {/* scanline overlay */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:999,
        backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,0.012) 2px,rgba(0,212,255,0.012) 4px)',
      }}/>

      {/* radial vignette */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:998,
        background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,3,8,0.7) 100%)'
      }}/>

      {/* HEADER */}
      <div style={{
        height:52, flexShrink:0, zIndex:10,
        background:'linear-gradient(180deg, rgba(0,8,16,0.98) 0%, rgba(0,6,10,0.95) 100%)',
        borderBottom:`1px solid ${hexA(C.PRI,0.25)}`,
        boxShadow:`0 1px 20px ${hexA(C.PRI,0.12)}, 0 0 40px ${hexA(C.PRI,0.04)}`,
        display:'flex', alignItems:'center', padding:'0 20px',
      }}>
        {/* left badge */}
        <div style={{display:'flex',flexDirection:'column',gap:2,minWidth:120}}>
          <span style={{fontSize:8,color:hexA(C.PRI,0.5),letterSpacing:'0.15em',fontWeight:700}}>MARK XXXIX-OR</span>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:5,height:5,borderRadius:'50%',background:stateColor,display:'inline-block',boxShadow:`0 0 8px ${stateColor}`,animation:'blink 1.8s ease-in-out infinite'}}/>
            <span style={{fontSize:8,color:stateColor,letterSpacing:'0.1em',fontWeight:700,textShadow:`0 0 8px ${stateColor}`}}>{jarvisState}</span>
          </div>
        </div>

        <div style={{flex:1,textAlign:'center'}}>
          {/* decorative lines */}
          <div style={{position:'relative',display:'inline-block'}}>
            <div style={{position:'absolute',left:-40,top:'50%',width:32,height:1,background:`linear-gradient(90deg,transparent,${hexA(C.PRI,0.5)})`}}/>
            <div style={{position:'absolute',right:-40,top:'50%',width:32,height:1,background:`linear-gradient(270deg,transparent,${hexA(C.PRI,0.5)})`}}/>
            <div style={{fontSize:19,fontWeight:700,color:C.PRI,letterSpacing:'0.2em',textShadow:`0 0 20px ${C.PRI}, 0 0 40px ${hexA(C.PRI,0.4)}`}}>J.A.R.V.I.S</div>
            <div style={{fontSize:7,color:hexA(C.PRI,0.45),letterSpacing:'0.18em',marginTop:1}}>JUST A RATHER VERY INTELLIGENT SYSTEM</div>
          </div>
        </div>

        <div style={{textAlign:'right',minWidth:120}}>
          <div style={{fontSize:16,fontWeight:700,color:C.PRI,letterSpacing:'0.1em',textShadow:`0 0 15px ${C.PRI}`}}>{clock}</div>
          <div style={{fontSize:8,color:C.TEXT_DIM,letterSpacing:'0.06em'}}>{dateStr}</div>
        </div>
      </div>

      {/* BODY */}
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>

        {/* LEFT PANEL */}
        <div style={{
          width:158, flexShrink:0, zIndex:5,
          background:'linear-gradient(180deg,rgba(0,10,18,0.97)0%,rgba(0,6,12,0.97)100%)',
          borderRight:`1px solid ${hexA(C.PRI,0.18)}`,
          boxShadow:`inset -8px 0 20px ${hexA(C.PRI,0.04)}`,
          padding:'12px 9px', display:'flex', flexDirection:'column',
        }}>
          <SectionLabel text="SYS MONITOR" accent={C.PRI} />

          <MetricBar label="CPU" value={metrics.cpu} text={`${metrics.cpu.toFixed(0)}%`} color={C.PRI}/>
          <MetricBar label="MEM" value={metrics.mem} text={`${metrics.mem.toFixed(0)}%`} color={C.ACC2}/>
          <MetricBar label="NET" value={Math.min(100,metrics.net*10)} text={metrics.net<1?`${(metrics.net*1024).toFixed(0)}KB/s`:`${metrics.net.toFixed(1)}MB/s`} color={C.GREEN}/>
          <MetricBar label="GPU" value={metrics.gpu>=0?metrics.gpu:0} text={metrics.gpu>=0?`${metrics.gpu.toFixed(0)}%`:'N/A'} color={C.ACC}/>
          <MetricBar label="TMP" value={metrics.tmp>=0?Math.min(100,(metrics.tmp/100)*100):0} text={metrics.tmp>=0?`${metrics.tmp.toFixed(0)}°C`:'N/A'} color="#ff6688"/>

          <GlowPanel style={{padding:'7px 8px',marginTop:4,marginBottom:10}}>
            <div style={{fontSize:9,color:C.GREEN,fontWeight:700,textShadow:`0 0 8px ${C.GREEN}`,letterSpacing:'0.06em'}}>UP {uptime}</div>
            <div style={{fontSize:8,color:C.TEXT_MED,marginTop:3,letterSpacing:'0.06em'}}>PROC {procs}</div>
            <div style={{fontSize:8,color:C.ACC2,marginTop:2,letterSpacing:'0.06em'}}>OS WIN · DEMO</div>
          </GlowPanel>

          <div style={{flex:1}}/>

          {[['AI CORE\nACTIVE',C.GREEN],['SEC\nCLEARED',C.PRI],['PROTOCOL\nXXXIX',C.TEXT_DIM]] .map(([txt,col])=>(
            <div key={txt} style={{
              fontSize:8,fontWeight:700,color:col,textAlign:'center',whiteSpace:'pre',
              background:`rgba(0,12,20,0.8)`,
              border:`1px solid ${hexA(col,0.3)}`,borderRadius:2,
              padding:'5px 4px',marginBottom:6,lineHeight:1.5,letterSpacing:'0.08em',
              boxShadow:`0 0 8px ${hexA(col,0.12)}`,
              textShadow:`0 0 8px ${col}`,
            }}>{txt}</div>
          ))}
        </div>

        {/* CENTER — HUD */}
        <div style={{
          flex:1, position:'relative', overflow:'hidden',
          background:`radial-gradient(ellipse at center, rgba(0,20,35,0.4) 0%, ${C.BG} 70%)`,
        }}>
          {/* top/bottom accent lines */}
          <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${hexA(C.PRI,0.4)},transparent)`,zIndex:2}}/>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${hexA(C.PRI,0.2)},transparent)`,zIndex:2}}/>
          <HudCanvas state={loading?'THINKING':jarvisState} muted={muted}/>
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          width:348, flexShrink:0, zIndex:5,
          background:'linear-gradient(180deg,rgba(0,10,18,0.97)0%,rgba(0,6,12,0.97)100%)',
          borderLeft:`1px solid ${hexA(C.PRI,0.18)}`,
          boxShadow:`inset 8px 0 20px ${hexA(C.PRI,0.04)}`,
          padding:'10px 10px 8px', display:'flex', flexDirection:'column', gap:0, overflow:'hidden',
        }}>

          <SectionLabel text="ACTIVITY LOG" accent={C.PRI}/>
          <LogWidget messages={messages}/>

          <div style={{borderTop:`1px solid ${hexA(C.PRI,0.1)}`,margin:'7px 0 6px'}}/>

          {/* Pending approval */}
          {pendingApproval && (
            <GlowPanel accent={C.RED} style={{padding:'8px',marginBottom:7}}>
              <SectionLabel text="APPROVAL REQUIRED" accent={C.RED}/>
              <div style={{fontSize:10,color:C.RED,marginBottom:6,lineHeight:1.5,textShadow:`0 0 8px ${C.RED}`}}>{pendingApproval}</div>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>{setPendingApproval(null);sendMessage('yes')}}
                  style={{flex:1,padding:'5px',fontSize:9,fontWeight:700,cursor:'pointer',background:`rgba(0,255,136,0.08)`,border:`1px solid ${C.GREEN}`,color:C.GREEN,borderRadius:2,fontFamily:'Courier New',letterSpacing:'0.1em',textShadow:`0 0 6px ${C.GREEN}`,boxShadow:`0 0 8px ${hexA(C.GREEN,0.2)}`}}>
                  ▸ APPROVE
                </button>
                <button onClick={()=>{setPendingApproval(null);addLog({role:'sys',text:'SYS: Action cancelled.',ts:ts()})}}
                  style={{flex:1,padding:'5px',fontSize:9,fontWeight:700,cursor:'pointer',background:`rgba(255,51,85,0.08)`,border:`1px solid ${C.RED}`,color:C.RED,borderRadius:2,fontFamily:'Courier New',letterSpacing:'0.1em',textShadow:`0 0 6px ${C.RED}`,boxShadow:`0 0 8px ${hexA(C.RED,0.2)}`}}>
                  ✕ DENY
                </button>
              </div>
            </GlowPanel>
          )}

          {/* Memory + Backend row */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:7,fontWeight:700,color:C.TEXT_MED,letterSpacing:'0.12em'}}>▸ MEMORY</span>
              <span style={{fontSize:18,fontWeight:700,color:C.PRI,textShadow:`0 0 12px ${C.PRI}`}}>{memCount}</span>
              <span style={{fontSize:8,color:C.TEXT_DIM}}>notes</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:backendOnline===null?C.ACC:backendOnline?C.GREEN:C.RED,display:'inline-block',boxShadow:`0 0 8px ${backendOnline===null?C.ACC:backendOnline?C.GREEN:C.RED}`,animation:'blink 2s infinite'}}/>
              <span style={{fontSize:8,color:backendOnline?C.GREEN:C.RED,fontWeight:700,letterSpacing:'0.08em',textShadow:`0 0 6px ${backendOnline?C.GREEN:C.RED}`}}>
                {backendOnline===null?'CONNECTING…':backendOnline?'ONLINE':'OFFLINE'}
              </span>
            </div>
          </div>

          <div style={{borderTop:`1px solid ${hexA(C.PRI,0.1)}`,marginBottom:6}}/>

          {/* Quick commands */}
          <SectionLabel text="QUICK COMMANDS" accent={C.TEXT_MED}/>
          <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:7}}>
            {QUICK_CMDS.map(cmd=>(
              <button key={cmd} onClick={()=>sendMessage(cmd)} disabled={loading} style={{
                padding:'3px 8px',fontSize:9,cursor:'pointer',borderRadius:2,
                background:hexA(C.PRI_GHO,0.8), border:`1px solid ${hexA(C.BORDER_B,0.35)}`,
                color:C.TEXT_MED, fontFamily:'Courier New', letterSpacing:'0.05em',
                opacity:loading?0.4:1, transition:'all 0.15s',
              }}
                onMouseEnter={e=>{if(!loading){const b=e.currentTarget as HTMLButtonElement;b.style.color=C.PRI;b.style.borderColor=hexA(C.PRI,0.8);b.style.boxShadow=`0 0 8px ${hexA(C.PRI,0.25)}`}}}
                onMouseLeave={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.color=C.TEXT_MED;b.style.borderColor=hexA(C.BORDER_B,0.35);b.style.boxShadow='none'}}
              >{cmd}</button>
            ))}
          </div>

          <div style={{borderTop:`1px solid ${hexA(C.PRI,0.1)}`,marginBottom:6}}/>

          {/* Command input */}
          <SectionLabel text="COMMAND INPUT" accent={C.TEXT_MED}/>
          <div style={{display:'flex',gap:6,marginBottom:6}}>
            <div style={{flex:1,position:'relative'}}>
              <span style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:C.PRI,fontSize:12,pointerEvents:'none'}}>›</span>
              <input ref={inputRef} type="text" value={input}
                onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage(input)}
                placeholder="Enter command…" disabled={loading}
                style={{
                  width:'100%',height:32,background:'rgba(0,6,12,0.95)',color:C.WHITE,
                  border:`1px solid ${hexA(C.BORDER_B,0.35)}`,borderRadius:2,
                  padding:'0 8px 0 22px',fontSize:10,fontFamily:'Courier New',outline:'none',
                  boxSizing:'border-box',
                }}
                onFocus={e=>{e.target.style.borderColor=hexA(C.PRI,0.8);e.target.style.boxShadow=`0 0 10px ${hexA(C.PRI,0.2)}`}}
                onBlur={e=>{e.target.style.borderColor=hexA(C.BORDER_B,0.35);e.target.style.boxShadow='none'}}
              />
            </div>
            <button onClick={()=>sendMessage(input)} disabled={loading||!input.trim()}
              style={{
                width:34,height:32,fontSize:14,fontWeight:700,cursor:'pointer',
                background:`linear-gradient(135deg,${hexA(C.PRI,0.15)},${hexA(C.PRI,0.05)})`,
                color:C.PRI,border:`1px solid ${hexA(C.PRI,0.5)}`,borderRadius:2,
                fontFamily:'Courier New',opacity:loading||!input.trim()?0.35:1,
                transition:'all 0.15s',
                boxShadow:`0 0 8px ${hexA(C.PRI,0.15)}`,
              }}>▸</button>
          </div>

          {/* Mute button */}
          <button onClick={toggleMute} style={{
            height:30, fontSize:9, fontWeight:700, cursor:'pointer', borderRadius:2,
            background:muted?'rgba(255,51,102,0.08)':'rgba(0,255,136,0.06)',
            color:muted?C.MUTED_C:C.GREEN,
            border:`1px solid ${muted?hexA(C.MUTED_C,0.6):hexA(C.GREEN,0.5)}`,
            fontFamily:'Courier New', letterSpacing:'0.1em',
            boxShadow:`0 0 10px ${hexA(muted?C.MUTED_C:C.GREEN,0.15)}`,
            textShadow:`0 0 8px ${muted?C.MUTED_C:C.GREEN}`,
            transition:'all 0.2s',
          }}>
            {muted?'🔇  MICROPHONE MUTED':'🎙  MICROPHONE ACTIVE'}
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        height:20, flexShrink:0, zIndex:10,
        background:'rgba(0,8,14,0.98)',
        borderTop:`1px solid ${hexA(C.PRI,0.15)}`,
        display:'flex', alignItems:'center', padding:'0 16px', justifyContent:'space-between',
      }}>
        <span style={{fontSize:7.5,color:hexA(C.TEXT_MED,0.6),letterSpacing:'0.08em'}}>[F4] Mute · Enter to send command</span>
        <span style={{fontSize:7.5,color:hexA(C.TEXT_DIM,0.5),letterSpacing:'0.06em'}}>FatihMakes Industries · MARK XXXIX · CloudOps Edition</span>
        <span style={{fontSize:7.5,color:hexA(C.PRI_DIM,0.6),letterSpacing:'0.08em'}}>© STARK INDUSTRIES</span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; overflow: hidden; }
        body { background: #00060a; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.25); border-radius:2px; }
        input::placeholder { color: rgba(58,138,154,0.5); }
        button:focus { outline: none; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}
