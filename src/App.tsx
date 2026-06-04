import { useState, useEffect, useRef } from 'react'

// ─── Data ────────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  {
    id: '01',
    icon: '◈',
    title: 'Advanced Natural Language Understanding',
    desc: 'Interprets complex multi-step CloudOps requests with contextual precision across DevOps, BI, and platform domains.',
    tag: 'NLU · v2.4',
    color: '#00c8f0',
  },
  {
    id: '02',
    icon: '⬡',
    title: 'Autonomous Workflow Assistance',
    desc: 'Orchestrates multi-step automation sequences, adapts to workflow state changes, and guides engineers through runbook procedures in real time.',
    tag: 'Automation · v1.9',
    color: '#00e882',
  },
  {
    id: '03',
    icon: '◎',
    title: 'Distributed Cloud Operations Support',
    desc: 'Provides intelligent support across Azure, Kubernetes, Snowflake, and ADF with environment-aware context and cross-system awareness.',
    tag: 'Cloud Ops · v2.1',
    color: '#00c8f0',
  },
  {
    id: '04',
    icon: '◇',
    title: 'Deployment Intelligence',
    desc: 'Validates deployment configurations, detects drift, coordinates pre/post-deployment checks, and surfaces rollback guidance when anomalies are detected.',
    tag: 'Deploy · v1.7',
    color: '#f59e0b',
  },
  {
    id: '05',
    icon: '◉',
    title: 'Monitoring & Incident Response',
    desc: 'Correlates alerts, synthesizes incident timelines, suggests remediation steps, and escalates through defined approval chains based on severity context.',
    tag: 'Observability · v2.0',
    color: '#00e882',
  },
  {
    id: '06',
    icon: '▣',
    title: 'Documentation & Knowledge Capture',
    desc: 'Automatically generates runbook entries, post-incident summaries, and structured knowledge artifacts from operational conversations.',
    tag: 'Knowledge · v1.5',
    color: '#00c8f0',
  },
  {
    id: '07',
    icon: '⬟',
    title: 'Security & Access Validation',
    desc: 'Enforces role-based access patterns, validates change approvals against policy, and audits privilege escalation requests before execution.',
    tag: 'Security · v1.8',
    color: '#f59e0b',
  },
]

const FRAMEWORK_POINTS = [
  'Natural language interface for technical CloudOps requests',
  'Integration with approved internal documentation and runbooks',
  'Jenkins, Terraform, Azure, Snowflake, Tableau, Kubernetes, and ADF workflow support',
  'Role-based access control with secure approval patterns',
  'Reusable templates for deployment validation and incident response',
  'Optimization for reducing manual work and improving consistency',
]

const INTEGRATIONS = [
  { name: 'Azure', icon: '☁', c: '#0078d4' },
  { name: 'Kubernetes', icon: '⎈', c: '#326ce5' },
  { name: 'Jenkins', icon: '⚙', c: '#cc3433' },
  { name: 'Terraform', icon: '◈', c: '#7b42bc' },
  { name: 'Snowflake', icon: '❄', c: '#29b5e8' },
  { name: 'Tableau', icon: '▦', c: '#e97627' },
  { name: 'ADF', icon: '⬡', c: '#0078d4' },
  { name: 'Runbooks', icon: '▣', c: '#00c8f0' },
]

const USE_CASES = [
  { team: 'Cloud Operations', c: '#00c8f0', desc: 'Infrastructure validation, change management, and cross-region deployment coordination.' },
  { team: 'BI & Analytics', c: '#00e882', desc: 'Snowflake query optimization, Tableau workbook deployment, and pipeline health monitoring.' },
  { team: 'DevOps', c: '#f59e0b', desc: 'Jenkins pipeline troubleshooting, Terraform plan review, and deployment gate validation.' },
  { team: 'Platform Engineering', c: '#00c8f0', desc: 'Kubernetes cluster health, node autoscaling guidance, and namespace policy enforcement.' },
  { team: 'Support Teams', c: '#00e882', desc: 'Incident response coordination, escalation routing, and post-incident knowledge capture.' },
  { team: 'Security & Compliance', c: '#f59e0b', desc: 'Access audit trails, approval workflow enforcement, and privilege escalation reviews.' },
]

const METRICS = [
  { value: '70%', label: 'Faster Troubleshooting', sub: 'reduction in MTTR', icon: '⚡' },
  { value: '60%', label: 'Reduced Manual Work', sub: 'tasks automated', icon: '◈' },
  { value: '95%', label: 'Standardized Deployments', sub: 'policy compliance', icon: '◎' },
  { value: '3×', label: 'Improved Documentation', sub: 'knowledge capture rate', icon: '▣' },
  { value: '100%', label: 'Operational Visibility', sub: 'cross-system tracing', icon: '◉' },
]

const CHAT_SUGGESTIONS = [
  'Show production deployment status',
  'Kubernetes pod CrashLoopBackOff fix',
  'Snowflake query optimization tips',
  'Generate ADF pipeline failure runbook',
]

const PAGES = ['Overview', 'Capabilities', 'Framework', 'Use Cases', 'Impact']

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useVisible(ref: React.RefObject<HTMLElement | null>) {
  const [v, setV] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: 0.08 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return v
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 justify-center mb-5">
      <div style={{ width: 32, height: 1, background: 'linear-gradient(90deg, transparent, #00c8f0)' }} />
      <span style={{ color: '#00c8f0', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em' }}>{text}</span>
      <div style={{ width: 32, height: 1, background: 'linear-gradient(270deg, transparent, #00c8f0)' }} />
    </div>
  )
}

function CornerFrame({ color = '#00c8f0', size = 18 }: { color?: string; size?: number }) {
  return (
    <>
      {/* TL */}
      <span style={{ position: 'absolute', top: 0, left: 0, width: size, height: 2, background: color }} />
      <span style={{ position: 'absolute', top: 0, left: 0, width: 2, height: size, background: color }} />
      {/* TR */}
      <span style={{ position: 'absolute', top: 0, right: 0, width: size, height: 2, background: color }} />
      <span style={{ position: 'absolute', top: 0, right: 0, width: 2, height: size, background: color }} />
      {/* BL */}
      <span style={{ position: 'absolute', bottom: 0, left: 0, width: size, height: 2, background: color }} />
      <span style={{ position: 'absolute', bottom: 0, left: 0, width: 2, height: size, background: color }} />
      {/* BR */}
      <span style={{ position: 'absolute', bottom: 0, right: 0, width: size, height: 2, background: color }} />
      <span style={{ position: 'absolute', bottom: 0, right: 0, width: 2, height: size, background: color }} />
    </>
  )
}

function HexBadge({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        background: active ? 'rgba(0,200,240,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? 'rgba(0,200,240,0.35)' : 'rgba(255,255,255,0.08)'}`,
        color: active ? '#00c8f0' : 'rgba(150,180,210,0.6)',
      }}
    >
      {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00c8f0', display: 'inline-block' }} />}
      {label}
    </span>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'nexus'; text: string }[]>([])
  const [typing, setTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const capsRef = useRef<HTMLElement>(null)
  const fwRef = useRef<HTMLElement>(null)
  const ucRef = useRef<HTMLElement>(null)
  const impRef = useRef<HTMLElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  const capsVis = useVisible(capsRef)
  const fwVis = useVisible(fwRef)
  const ucVis = useVisible(ucRef)
  const impVis = useVisible(impRef)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
    setActiveNav(id)
  }

  const sendMessage = async (text: string) => {
    const q = text.trim()
    if (!q || typing) return

    setChatInput('')
    setMessages(p => [...p, { role: 'user', text: q }])
    setTyping(true)

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: q }),
      })

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`)
      }

      const data = await response.json()

      let reply = data.reply || 'JARVIS received your command.'

      if (data.data?.examples && Array.isArray(data.data.examples)) {
        reply += `\n\nExamples:\n${data.data.examples.map((item: string) => `• ${item}`).join('\n')}`
      }

      setMessages(p => [
        ...p,
        {
          role: 'nexus',
          text: reply,
        },
      ])
    } catch (error) {
      setMessages(p => [
        ...p,
        {
          role: 'nexus',
          text: 'Backend is offline or unreachable. Make sure Docker backend is running on http://localhost:8000.',
        },
      ])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div style={{ background: '#060c18', color: '#dde8f2', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: 60,
          background: scrolled ? 'rgba(6,12,24,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,200,240,0.1)' : 'none',
          transition: 'all 0.4s ease',
          display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(0,200,240,0.15), rgba(0,232,130,0.08))',
              border: '1px solid rgba(0,200,240,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#00c8f0', fontSize: 15, fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              N
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', letterSpacing: '0.04em' }}>
                CloudOps <span style={{ color: '#00c8f0' }}>NEXUS</span>
              </div>
              <div style={{ fontSize: 9, color: 'rgba(0,200,240,0.5)', letterSpacing: '0.15em', fontWeight: 600 }}>ENTERPRISE AI OPERATIONS</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: 4 }}>
            {PAGES.map(p => (
              <button
                key={p}
                onClick={() => scrollTo(p)}
                style={{
                  background: activeNav === p ? 'rgba(0,200,240,0.08)' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  color: activeNav === p ? '#00c8f0' : 'rgba(180,210,230,0.65)',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {p}
              </button>
            ))}
          </nav>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#00e882',
              display: 'inline-block',
              boxShadow: '0 0 8px #00e882',
              animation: 'pulse-hdr 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 11, color: '#00e882', fontWeight: 700, letterSpacing: '0.1em' }}>SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section
        id="overview"
        style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          paddingTop: 80, paddingBottom: 60, paddingLeft: 32, paddingRight: 32,
          position: 'relative', overflow: 'hidden',
          background: 'radial-gradient(ellipse 90% 60% at 50% 30%, rgba(0,200,240,0.055) 0%, transparent 70%), #060c18',
        }}
      >
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(0,200,240,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,240,0.028) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }} />

        {/* Scanline sweep */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,200,240,0.18) 50%, transparent 100%)',
          animation: 'sweep 7s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Corner brackets */}
        <div style={{ position: 'absolute', top: 80, left: 40, pointerEvents: 'none' }}>
          <div style={{ width: 48, height: 2, background: 'rgba(0,200,240,0.35)' }} />
          <div style={{ width: 2, height: 48, background: 'rgba(0,200,240,0.35)', marginTop: -2 }} />
        </div>
        <div style={{ position: 'absolute', top: 80, right: 40, pointerEvents: 'none' }}>
          <div style={{ width: 48, height: 2, background: 'rgba(0,200,240,0.35)', marginLeft: 'auto' }} />
          <div style={{ width: 2, height: 48, background: 'rgba(0,200,240,0.35)', marginLeft: 'auto', marginTop: -2 }} />
        </div>
        <div style={{ position: 'absolute', bottom: 60, left: 40, pointerEvents: 'none' }}>
          <div style={{ width: 2, height: 48, background: 'rgba(0,200,240,0.25)' }} />
          <div style={{ width: 48, height: 2, background: 'rgba(0,200,240,0.25)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 60, right: 40, pointerEvents: 'none' }}>
          <div style={{ width: 2, height: 48, background: 'rgba(0,200,240,0.25)', marginLeft: 'auto' }} />
          <div style={{ width: 48, height: 2, background: 'rgba(0,200,240,0.25)', marginLeft: 'auto' }} />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 880, animation: 'fadeUp 0.8s ease-out both' }}>
          {/* System badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32,
            padding: '7px 18px', borderRadius: 100,
            background: 'rgba(0,200,240,0.07)',
            border: '1px solid rgba(0,200,240,0.22)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c8f0', display: 'inline-block', boxShadow: '0 0 7px #00c8f0', animation: 'pulse-hdr 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#00c8f0' }}>
              ENTERPRISE AI OPERATIONS PLATFORM · DEMO v0.1.0
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2.6rem, 6.5vw, 5rem)',
            fontWeight: 800, lineHeight: 1.08,
            marginBottom: 28, letterSpacing: '-0.02em',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #ffffff 30%, #00c8f0 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              CloudOps NEXUS
            </span>
            <br />
            <span style={{ color: 'rgba(200,220,240,0.55)', fontSize: '0.48em', fontWeight: 400, letterSpacing: '0.01em' }}>
              Development and Capabilities
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.12rem)',
            lineHeight: 1.85,
            color: 'rgba(160,195,220,0.8)',
            maxWidth: 720, margin: '0 auto 44px',
          }}>
            CloudOps NEXUS combines natural language understanding, automation workflows, infrastructure intelligence,
            and operational execution support — allowing engineers to process complex cloud operations requests,
            troubleshoot issues, and manage deployment workflows across enterprise systems.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => scrollTo('Capabilities')}
              style={{
                padding: '13px 30px', borderRadius: 9, fontWeight: 700, fontSize: 14,
                background: 'linear-gradient(135deg, rgba(0,200,240,0.22), rgba(0,200,240,0.08))',
                border: '1px solid rgba(0,200,240,0.45)',
                color: '#00c8f0', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.25s', letterSpacing: '0.02em',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,200,240,0.22)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(0,200,240,0.25)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(0,200,240,0.22), rgba(0,200,240,0.08))'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
            >
              Explore Capabilities
            </button>
            <button
              onClick={() => scrollTo('Impact')}
              style={{
                padding: '13px 30px', borderRadius: 9, fontWeight: 600, fontSize: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(200,220,240,0.75)', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(200,220,240,0.75)' }}
            >
              View Impact
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{
          position: 'relative', zIndex: 2,
          marginTop: 64, width: '100%', maxWidth: 860,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          border: '1px solid rgba(0,200,240,0.13)',
          borderRadius: 14, overflow: 'hidden',
          animation: 'fadeUp 0.9s 0.2s ease-out both',
        }}>
          {[
            { v: '10+', l: 'Integrated Platforms' },
            { v: '7', l: 'Automation Domains' },
            { v: '100%', l: 'Enterprise Ready' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center', padding: '24px 16px',
                background: 'rgba(6,12,24,0.85)',
                borderRight: i < 2 ? '1px solid rgba(0,200,240,0.1)' : 'none',
              }}
            >
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 800, color: '#00c8f0', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: 'rgba(140,175,200,0.65)', marginTop: 6, letterSpacing: '0.04em' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CAPABILITIES ───────────────────────────────────────────── */}
      <section
        id="capabilities"
        ref={capsRef}
        style={{
          padding: '110px 32px',
          background: 'linear-gradient(180deg, #060c18 0%, #080f1e 100%)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64, opacity: capsVis ? 1 : 0, transform: capsVis ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
            <SectionLabel text="CORE CAPABILITIES" />
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 14 }}>
              Seven Intelligence Layers
            </h2>
            <p style={{ color: 'rgba(140,175,200,0.7)', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
              Integrated capability modules that power end-to-end cloud operations automation.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}>
            {CAPABILITIES.map((cap, i) => (
              <CapabilityCard key={cap.id} cap={cap} visible={capsVis} delay={i * 0.07} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FRAMEWORK ──────────────────────────────────────────────── */}
      <section
        id="framework"
        ref={fwRef}
        style={{ padding: '110px 32px', background: '#060c18' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64, opacity: fwVis ? 1 : 0, transform: fwVis ? 'none' : 'translateY(20px)', transition: 'all 0.7s' }}>
            <SectionLabel text="DEVELOPMENT FRAMEWORK" />
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 14 }}>
              Engineering Foundation
            </h2>
            <p style={{ color: 'rgba(140,175,200,0.7)', fontSize: 15, maxWidth: 580, margin: '0 auto' }}>
              A structured, extensible platform for building repeatable cloud operations automation workflows.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {/* Left */}
            <div style={{ opacity: fwVis ? 1 : 0, transform: fwVis ? 'none' : 'translateX(-20px)', transition: 'all 0.7s 0.1s' }}>
              <p style={{ color: 'rgba(140,175,200,0.75)', fontSize: 15, lineHeight: 1.85, marginBottom: 28 }}>
                Developers and Cloud Operations engineers can use CloudOps NEXUS as an internal
                AI-powered operations framework to build repeatable automation, troubleshooting,
                and support workflows. The framework abstracts complexity while preserving full auditability and control.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FRAMEWORK_POINTS.map((pt, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 16px', borderRadius: 10,
                      background: 'rgba(0,200,240,0.03)',
                      border: '1px solid rgba(0,200,240,0.1)',
                      opacity: fwVis ? 1 : 0,
                      transform: fwVis ? 'none' : 'translateX(-10px)',
                      transition: `all 0.5s ${0.15 + i * 0.07}s`,
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                      background: 'rgba(0,200,240,0.12)', border: '1px solid rgba(0,200,240,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5L4 8L9 2" stroke="#00c8f0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span style={{ color: 'rgba(200,220,240,0.85)', fontSize: 13.5, lineHeight: 1.6 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div style={{ opacity: fwVis ? 1 : 0, transform: fwVis ? 'none' : 'translateX(20px)', transition: 'all 0.7s 0.15s', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Integration stack */}
              <div style={{
                flex: 1, borderRadius: 16, padding: 24,
                background: 'rgba(8,15,30,0.8)',
                border: '1px solid rgba(0,200,240,0.12)',
                position: 'relative', overflow: 'hidden',
              }}>
                <CornerFrame color="rgba(0,200,240,0.35)" size={14} />
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(0,200,240,0.6)', marginBottom: 18 }}>
                  SUPPORTED INTEGRATION STACK
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {INTEGRATIONS.map(t => (
                    <div
                      key={t.name}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 9,
                        background: 'rgba(6,12,24,0.7)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        transition: 'all 0.2s',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${t.c}40`; (e.currentTarget as HTMLDivElement).style.background = `${t.c}0a` }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(6,12,24,0.7)' }}
                    >
                      <span style={{ color: t.c, fontSize: 16 }}>{t.icon}</span>
                      <span style={{ color: 'rgba(200,220,240,0.8)', fontSize: 13, fontWeight: 500 }}>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture note */}
              <div style={{
                borderRadius: 12, padding: '16px 20px',
                background: 'linear-gradient(135deg, rgba(0,200,240,0.07), rgba(0,232,130,0.03))',
                border: '1px solid rgba(0,200,240,0.18)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c8f0', display: 'inline-block' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#00c8f0' }}>SECURITY ARCHITECTURE</span>
                </div>
                <p style={{ color: 'rgba(140,175,200,0.75)', fontSize: 13, lineHeight: 1.7 }}>
                  NEXUS operates as a stateless orchestration layer. All credentials, secrets, and execution contexts
                  are managed through your existing enterprise security perimeter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── USE CASES ──────────────────────────────────────────────── */}
      <section
        id="use cases"
        ref={ucRef}
        style={{ padding: '110px 32px', background: 'linear-gradient(180deg, #080f1e 0%, #060c18 100%)' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64, opacity: ucVis ? 1 : 0, transform: ucVis ? 'none' : 'translateY(20px)', transition: 'all 0.7s' }}>
            <SectionLabel text="BUSINESS USE CASES" />
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 14 }}>
              Enterprise Applications
            </h2>
          </div>

          <div style={{
            borderRadius: 18, padding: 32,
            background: 'rgba(8,15,30,0.8)',
            border: '1px solid rgba(0,200,240,0.1)',
            marginBottom: 28,
            opacity: ucVis ? 1 : 0, transform: ucVis ? 'none' : 'translateY(16px)', transition: 'all 0.7s 0.1s',
          }}>
            <p style={{ color: 'rgba(150,185,215,0.8)', fontSize: 15, lineHeight: 1.85, maxWidth: 900, marginBottom: 28 }}>
              CloudOps NEXUS can assist Cloud Operations, BI, DevOps, platform engineering, and support teams
              with deployment planning, pipeline troubleshooting, infrastructure validation, monitoring review,
              Snowflake/Tableau operations, ADF pipeline support, access checks, and internal knowledge sharing.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {USE_CASES.map((uc, i) => (
                <div
                  key={uc.team}
                  style={{
                    padding: '18px 20px', borderRadius: 12,
                    background: 'rgba(6,12,24,0.7)',
                    border: `1px solid ${uc.c}18`,
                    opacity: ucVis ? 1 : 0,
                    transform: ucVis ? 'none' : 'translateY(12px)',
                    transition: `all 0.5s ${0.15 + i * 0.08}s`,
                    cursor: 'default',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${uc.c}40`; (e.currentTarget as HTMLDivElement).style.background = `${uc.c}08` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${uc.c}18`; (e.currentTarget as HTMLDivElement).style.background = 'rgba(6,12,24,0.7)' }}
                >
                  <div style={{
                    display: 'inline-block', marginBottom: 10,
                    padding: '3px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                    background: `${uc.c}12`, border: `1px solid ${uc.c}30`, color: uc.c,
                    letterSpacing: '0.05em',
                  }}>
                    {uc.team}
                  </div>
                  <p style={{ color: 'rgba(140,175,200,0.75)', fontSize: 13, lineHeight: 1.65 }}>{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT ─────────────────────────────────────────────────── */}
      <section
        id="impact"
        ref={impRef}
        style={{ padding: '110px 32px', background: '#060c18' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64, opacity: impVis ? 1 : 0, transform: impVis ? 'none' : 'translateY(20px)', transition: 'all 0.7s' }}>
            <SectionLabel text="BUSINESS IMPACT" />
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 14 }}>
              Measurable Outcomes
            </h2>
            <p style={{ color: 'rgba(140,175,200,0.7)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
              Quantified improvements across operational reliability, efficiency, and team performance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18 }}>
            {METRICS.map((m, i) => (
              <MetricCard key={m.label} metric={m} visible={impVis} delay={i * 0.09} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CHAT ───────────────────────────────────────────────────── */}
      <section style={{ padding: '110px 32px', background: 'linear-gradient(180deg, #060c18 0%, #080f1e 100%)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <SectionLabel text="INTERACTIVE INTERFACE" />
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              Ask NEXUS
            </h2>
            <p style={{ color: 'rgba(140,175,200,0.65)', fontSize: 15 }}>
              Interact with the CloudOps NEXUS AI operations interface.
            </p>
          </div>

          {/* Terminal window */}
          <div style={{
            borderRadius: 18, overflow: 'hidden',
            border: '1px solid rgba(0,200,240,0.18)',
            background: 'rgba(6,10,20,0.95)',
            boxShadow: '0 0 60px rgba(0,200,240,0.06)',
          }}>
            {/* Title bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px',
              background: 'rgba(0,200,240,0.04)',
              borderBottom: '1px solid rgba(0,200,240,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00e882', display: 'inline-block', animation: 'pulse-hdr 2s infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(0,200,240,0.75)' }}>
                  NEXUS OPERATIONS TERMINAL
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <HexBadge label="DEMO MODE" active />
                <HexBadge label="v2.4.1" />
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatRef}
              style={{ padding: '20px 24px', minHeight: 240, maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', paddingTop: 20 }}>
                  <p style={{ color: 'rgba(100,140,170,0.5)', fontSize: 13, marginBottom: 20 }}>
                    NEXUS is ready. Submit a query to begin.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {CHAT_SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        style={{
                          padding: '7px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
                          background: 'rgba(0,200,240,0.06)', border: '1px solid rgba(0,200,240,0.18)',
                          color: 'rgba(0,200,240,0.7)', fontFamily: 'inherit', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,200,240,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#00c8f0' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,200,240,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,200,240,0.7)' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                    background: msg.role === 'nexus' ? 'rgba(0,200,240,0.12)' : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${msg.role === 'nexus' ? 'rgba(0,200,240,0.3)' : 'rgba(255,255,255,0.12)'}`,
                    color: msg.role === 'nexus' ? '#00c8f0' : 'rgba(200,220,240,0.7)',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}>
                    {msg.role === 'nexus' ? 'NX' : 'U'}
                  </div>
                  <div style={{
                    maxWidth: 600, padding: '12px 16px', borderRadius: 12,
                    background: msg.role === 'nexus' ? 'rgba(0,200,240,0.05)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${msg.role === 'nexus' ? 'rgba(0,200,240,0.14)' : 'rgba(255,255,255,0.08)'}`,
                    color: 'rgba(200,220,240,0.85)',
                    fontSize: 13.5, lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {typing && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,200,240,0.12)', border: '1px solid rgba(0,200,240,0.3)',
                    color: '#00c8f0', fontSize: 11, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif",
                  }}>NX</div>
                  <div style={{
                    padding: '12px 18px', borderRadius: 12,
                    background: 'rgba(0,200,240,0.05)', border: '1px solid rgba(0,200,240,0.14)',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {[0, 1, 2].map(d => (
                      <span key={d} style={{
                        width: 7, height: 7, borderRadius: '50%', background: '#00c8f0', display: 'inline-block',
                        animation: `blink 1.2s ${d * 0.22}s ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(0,200,240,0.08)',
              display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(chatInput)}
                placeholder="Ask CloudOps NEXUS anything..."
                style={{
                  flex: 1, padding: '11px 16px', borderRadius: 9, fontSize: 13.5,
                  background: 'rgba(4,8,18,0.9)',
                  border: '1px solid rgba(0,200,240,0.18)',
                  color: 'rgba(200,220,240,0.9)', fontFamily: 'inherit', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,200,240,0.5)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0,200,240,0.07)' }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,200,240,0.18)'; (e.target as HTMLInputElement).style.boxShadow = 'none' }}
                disabled={typing}
              />
              <button
                onClick={() => sendMessage(chatInput)}
                disabled={typing || !chatInput.trim()}
                style={{
                  padding: '11px 22px', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  background: 'linear-gradient(135deg, rgba(0,200,240,0.22), rgba(0,200,240,0.1))',
                  border: '1px solid rgba(0,200,240,0.4)', color: '#00c8f0',
                  fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap',
                  opacity: typing || !chatInput.trim() ? 0.5 : 1,
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(0,200,240,0.08)',
        padding: '28px 32px',
        background: '#060c18',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,200,240,0.1)', border: '1px solid rgba(0,200,240,0.25)',
            color: '#00c8f0', fontSize: 12, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif",
          }}>N</div>
          <span style={{ color: 'rgba(120,155,185,0.5)', fontSize: 12 }}>
            CloudOps NEXUS — Enterprise AI Operations Platform
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e882', display: 'inline-block', animation: 'pulse-hdr 2s infinite' }} />
          <span style={{ color: 'rgba(120,155,185,0.45)', fontSize: 11 }}>All systems operational</span>
        </div>
      </footer>

      {/* ── GLOBAL STYLES ──────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; -webkit-font-smoothing: antialiased; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #060c18; }
        ::-webkit-scrollbar-thumb { background: rgba(0,200,240,0.2); border-radius: 3px; }

        @keyframes pulse-hdr {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }

        @keyframes sweep {
          0% { top: -2px; }
          100% { top: 100vh; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}

// ─── Capability Card ─────────────────────────────────────────────────────────

function CapabilityCard({ cap, visible, delay }: { cap: typeof CAPABILITIES[0]; visible: boolean; delay: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        position: 'relative', borderRadius: 14, padding: '24px 24px 22px',
        background: hovered ? `rgba(${cap.color === '#00c8f0' ? '0,200,240' : cap.color === '#00e882' ? '0,232,130' : '245,158,11'},0.04)` : 'rgba(8,15,30,0.7)',
        border: `1px solid ${hovered ? `${cap.color}35` : 'rgba(0,200,240,0.08)'}`,
        transition: 'all 0.3s ease',
        transform: visible ? (hovered ? 'translateY(-5px)' : 'none') : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay}s`,
        boxShadow: hovered ? `0 12px 40px rgba(0,0,0,0.3), 0 0 24px ${cap.color}12` : 'none',
        cursor: 'default',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 20, right: 20, height: 1,
        background: `linear-gradient(90deg, transparent, ${cap.color}50, transparent)`,
        opacity: hovered ? 1 : 0.4, transition: 'opacity 0.3s',
      }} />

      {/* ID + tag row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: `${cap.color}12`, border: `1px solid ${cap.color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cap.color, fontSize: 18,
          boxShadow: hovered ? `0 0 18px ${cap.color}25` : 'none',
          transition: 'box-shadow 0.3s',
        }}>
          {cap.icon}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'rgba(80,120,150,0.5)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
            [{cap.id}]
          </span>
          <span style={{
            padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            background: `${cap.color}0e`, border: `1px solid ${cap.color}22`, color: cap.color,
          }}>
            {cap.tag}
          </span>
        </div>
      </div>

      <h3 style={{
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
        fontSize: 15, color: '#e8f2fa', marginBottom: 10, lineHeight: 1.3,
      }}>
        {cap.title}
      </h3>
      <p style={{ color: 'rgba(130,168,198,0.75)', fontSize: 13, lineHeight: 1.7 }}>
        {cap.desc}
      </p>
    </div>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({ metric, visible, delay }: { metric: typeof METRICS[0]; visible: boolean; delay: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        position: 'relative', borderRadius: 14, padding: '28px 20px 24px',
        textAlign: 'center',
        background: hovered ? 'rgba(0,200,240,0.05)' : 'rgba(8,15,30,0.7)',
        border: `1px solid ${hovered ? 'rgba(0,200,240,0.3)' : 'rgba(0,200,240,0.08)'}`,
        transition: 'all 0.3s ease',
        transform: visible ? (hovered ? 'translateY(-6px)' : 'none') : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay}s`,
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.3), 0 0 20px rgba(0,200,240,0.1)' : 'none',
        cursor: 'default',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CornerFrame color={hovered ? 'rgba(0,200,240,0.5)' : 'rgba(0,200,240,0.2)'} size={12} />

      <div style={{
        width: 44, height: 44, borderRadius: 11, margin: '0 auto 16px',
        background: 'rgba(0,200,240,0.09)', border: '1px solid rgba(0,200,240,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#00c8f0', fontSize: 18,
        boxShadow: hovered ? '0 0 20px rgba(0,200,240,0.2)' : 'none', transition: 'box-shadow 0.3s',
      }}>
        {metric.icon}
      </div>

      <div style={{
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 36,
        color: '#00c8f0', lineHeight: 1, marginBottom: 8,
        textShadow: hovered ? '0 0 20px rgba(0,200,240,0.4)' : 'none',
      }}>
        {metric.value}
      </div>
      <div style={{ fontWeight: 600, fontSize: 12.5, color: 'rgba(200,220,240,0.85)', marginBottom: 5 }}>
        {metric.label}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(100,140,170,0.6)' }}>
        {metric.sub}
      </div>
    </div>
  )
}
