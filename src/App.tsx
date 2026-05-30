import { useState, useEffect, useRef } from 'react'

const NAV_ITEMS = ['Overview', 'Capabilities', 'Framework', 'Use Cases', 'Impact']

const CAPABILITIES = [
  {
    icon: '◈',
    title: 'Advanced Natural Language Understanding',
    desc: 'Interprets complex cloud operations requests, technical queries, and multi-step instructions with contextual precision across DevOps, BI, and platform domains.',
    color: '#00d4ff',
    tag: 'NLU Engine',
  },
  {
    icon: '⬡',
    title: 'Autonomous Workflow Assistance',
    desc: 'Orchestrates multi-step automation sequences, guides engineers through runbook procedures, and adapts to workflow state changes in real time.',
    color: '#00ff88',
    tag: 'Automation',
  },
  {
    icon: '◎',
    title: 'Distributed Cloud Operations Support',
    desc: 'Provides intelligent support across Azure, Kubernetes, Snowflake, and ADF environments with environment-aware context and cross-system awareness.',
    color: '#00d4ff',
    tag: 'Cloud Ops',
  },
  {
    icon: '◇',
    title: 'Deployment Intelligence',
    desc: 'Validates deployment configurations, detects drift, coordinates pre/post-deployment checks, and surfaces rollback guidance when anomalies are detected.',
    color: '#ff6b35',
    tag: 'Deployments',
  },
  {
    icon: '◉',
    title: 'Monitoring and Incident Response',
    desc: 'Correlates alerts, synthesizes incident timelines, suggests remediation steps, and escalates through defined approval chains based on severity context.',
    color: '#00ff88',
    tag: 'Observability',
  },
  {
    icon: '▣',
    title: 'Documentation and Knowledge Capture',
    desc: 'Automatically generates runbook entries, post-incident summaries, and structured knowledge artifacts from operational conversations and resolved tickets.',
    color: '#00d4ff',
    tag: 'Knowledge',
  },
  {
    icon: '⬟',
    title: 'Security and Access Validation',
    desc: 'Enforces role-based access patterns, validates change approvals against policy, and audits privilege escalation requests before execution.',
    color: '#ff6b35',
    tag: 'Security',
  },
]

const IMPACT_METRICS = [
  { label: 'Faster Troubleshooting', value: '70%', sub: 'reduction in MTTR', icon: '⚡' },
  { label: 'Reduced Manual Work', value: '60%', sub: 'tasks automated', icon: '◈' },
  { label: 'Standardized Deployments', value: '95%', sub: 'policy compliance', icon: '◎' },
  { label: 'Improved Documentation', value: '3x', sub: 'knowledge capture rate', icon: '▣' },
  { label: 'Better Operational Visibility', value: '100%', sub: 'cross-system tracing', icon: '◉' },
]

const CHAT_SUGGESTIONS = [
  'Show me the latest deployment status for production',
  'Walk me through incident response for a Kubernetes pod crash',
  'What are the Snowflake query optimization recommendations?',
  'Generate a runbook for the ADF pipeline failure',
]

function useIntersection(ref: React.RefObject<HTMLElement | null>, threshold = 0.1) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, threshold])
  return visible
}

export default function App() {
  const [query, setQuery] = useState('')
  const [activeNav, setActiveNav] = useState('Overview')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'nexus'; text: string }[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)

  const heroRef = useRef<HTMLElement>(null)
  const capsRef = useRef<HTMLElement>(null)
  const frameworkRef = useRef<HTMLElement>(null)
  const usecasesRef = useRef<HTMLElement>(null)
  const impactRef = useRef<HTMLElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  const capsVisible = useIntersection(capsRef)
  const frameworkVisible = useIntersection(frameworkRef)
  const usecasesVisible = useIntersection(usecasesRef)
  const impactVisible = useIntersection(impactRef)

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chatMessages, isTyping])

  const handleQuery = (text: string) => {
    const q = text.trim()
    if (!q) return
    setChatMessages(prev => [...prev, { role: 'user', text: q }])
    setQuery('')
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setChatMessages(prev => [
        ...prev,
        {
          role: 'nexus',
          text: `Processing your request: "${q}"\n\nNEXUS has received your query and is routing it through the appropriate workflow engine. In a connected deployment, I would analyze your cloud operations context, cross-reference relevant runbooks, and surface actionable recommendations across your integrated systems.`,
        },
      ])
    }, 1800)
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveNav(id.charAt(0).toUpperCase() + id.slice(1))
  }

  return (
    <div className="min-h-screen scanline" style={{ background: 'var(--color-surface)' }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: headerScrolled
            ? 'rgba(10, 15, 30, 0.95)'
            : 'transparent',
          backdropFilter: headerScrolled ? 'blur(20px)' : 'none',
          borderBottom: headerScrolled ? '1px solid rgba(30, 48, 80, 0.8)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,136,0.1))',
                border: '1px solid rgba(0,212,255,0.4)',
                color: '#00d4ff',
              }}
            >
              NX
            </div>
            <span className="font-display font-semibold text-white tracking-wide" style={{ fontSize: '0.95rem' }}>
              CloudOps <span style={{ color: '#00d4ff' }}>NEXUS</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: activeNav === item ? '#00d4ff' : 'rgba(122,155,191,0.9)',
                  background: activeNav === item ? 'rgba(0,212,255,0.08)' : 'transparent',
                }}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#00ff88' }} />
            <span style={{ color: '#00ff88', fontSize: '0.75rem', fontWeight: 500 }}>ONLINE</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="overview"
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 grid-bg"
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(0,212,255,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Corner decorations */}
        <div className="absolute top-24 left-8 opacity-40">
          <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, #00d4ff, transparent)' }} />
          <div style={{ width: 1, height: 60, background: 'linear-gradient(180deg, #00d4ff, transparent)', marginTop: -1 }} />
        </div>
        <div className="absolute top-24 right-8 opacity-40">
          <div style={{ width: 60, height: 1, background: 'linear-gradient(270deg, #00d4ff, transparent)', marginLeft: 'auto' }} />
          <div style={{ width: 1, height: 60, background: 'linear-gradient(180deg, #00d4ff, transparent)', marginLeft: 'auto', marginTop: -1 }} />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 fade-in-up">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.2)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#00d4ff' }} />
            <span style={{ color: '#00d4ff', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em' }}>
              ENTERPRISE AI OPERATIONS PLATFORM
            </span>
          </div>

          <h1
            className="font-display font-bold mb-6 leading-tight"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}
          >
            <span className="gradient-text-accent">CloudOps NEXUS</span>
            <br />
            <span style={{ color: 'rgba(226,232,240,0.9)', fontSize: '0.6em', fontWeight: 400 }}>
              Development and Capabilities
            </span>
          </h1>

          <p
            className="mx-auto mb-12 leading-relaxed"
            style={{
              maxWidth: 760,
              color: 'rgba(122,155,191,0.9)',
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              lineHeight: 1.75,
            }}
          >
            CloudOps NEXUS combines natural language understanding, automation workflows, infrastructure intelligence,
            and operational execution support — allowing engineers to process complex cloud operations requests,
            troubleshoot issues, and manage deployment workflows across enterprise systems.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => scrollToSection('capabilities')}
              className="px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.1))',
                border: '1px solid rgba(0,212,255,0.4)',
                color: '#00d4ff',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(0,212,255,0.15))'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.1))'
              }}
            >
              Explore Capabilities
            </button>
            <button
              onClick={() => scrollToSection('impact')}
              className="px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(226,232,240,0.8)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
              }}
            >
              View Impact
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="relative z-10 mt-16 w-full max-w-4xl mx-auto px-6"
        >
          <div
            className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(30,48,80,0.8)', background: 'rgba(30,48,80,0.3)' }}
          >
            {[
              { label: 'Integrated Platforms', val: '10+' },
              { label: 'Automation Domains', val: '7' },
              { label: 'Enterprise Ready', val: '100%' },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-6 px-4"
                style={{ background: 'rgba(10,15,30,0.8)' }}
              >
                <span
                  className="font-display font-bold mb-1"
                  style={{ color: '#00d4ff', fontSize: '1.8rem' }}
                >
                  {stat.val}
                </span>
                <span style={{ color: 'rgba(122,155,191,0.7)', fontSize: '0.75rem', textAlign: 'center' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section
        id="capabilities"
        ref={capsRef}
        className="py-24 px-6"
        style={{ background: 'var(--color-surface-2)' }}
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            visible={capsVisible}
            tag="CORE CAPABILITIES"
            title="Key Capabilities"
            sub="Seven integrated intelligence layers powering end-to-end cloud operations automation."
          />

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-14 ${capsVisible ? 'stagger' : 'opacity-0'}`}>
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="card-hover relative rounded-2xl p-6 overflow-hidden"
                style={{ background: 'var(--color-surface-3)' }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-6 right-6 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${cap.color}40, transparent)` }}
                />

                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `${cap.color}15`,
                      border: `1px solid ${cap.color}30`,
                      color: cap.color,
                    }}
                  >
                    {cap.icon}
                  </div>
                  <div
                    className="px-2.5 py-1 rounded-md text-xs font-semibold self-start mt-0.5"
                    style={{
                      background: `${cap.color}10`,
                      border: `1px solid ${cap.color}25`,
                      color: cap.color,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {cap.tag}
                  </div>
                </div>

                <h3
                  className="font-display font-semibold mb-3 leading-snug"
                  style={{ color: 'rgba(226,232,240,0.95)', fontSize: '0.95rem' }}
                >
                  {cap.title}
                </h3>
                <p style={{ color: 'rgba(122,155,191,0.8)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  {cap.desc}
                </p>
              </div>
            ))}

            {/* Last card full-width on lg */}
            <div
              className="card-hover relative rounded-2xl p-6 overflow-hidden md:col-span-2 lg:col-span-1 lg:col-start-2"
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </section>

      {/* Development Framework */}
      <section
        id="framework"
        ref={frameworkRef}
        className="py-24 px-6"
        style={{ background: 'var(--color-surface)' }}
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            visible={frameworkVisible}
            tag="DEVELOPMENT FRAMEWORK"
            title="Engineering Foundation"
            sub="A structured, extensible platform for building repeatable cloud operations automation."
          />

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 mt-14 ${frameworkVisible ? 'fade-in-up' : 'opacity-0'}`}>
            <div>
              <p
                className="leading-relaxed mb-8"
                style={{ color: 'rgba(122,155,191,0.85)', fontSize: '1rem', lineHeight: 1.8 }}
              >
                Developers and Cloud Operations engineers can use CloudOps NEXUS as an internal AI-powered
                operations framework to build repeatable automation, troubleshooting, and support workflows.
                The framework abstracts complexity while preserving full auditability and control.
              </p>

              <div className="space-y-3">
                {[
                  'Natural language interface for technical requests',
                  'Integration with approved internal documentation and runbooks',
                  'Jenkins, Terraform, Azure, Snowflake, Tableau, Kubernetes, and ADF workflow support',
                  'Role-based access and secure approval patterns',
                  'Reusable templates for deployment validation and incident response',
                  'Optimization for reducing manual work and improving consistency',
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-xl transition-all duration-200 hover:bg-opacity-80"
                    style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(30,48,80,0.6)' }}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span style={{ color: 'rgba(226,232,240,0.85)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Integration stack visual */}
              <div
                className="rounded-2xl p-6 flex-1"
                style={{
                  background: 'var(--color-surface-3)',
                  border: '1px solid rgba(30,48,80,0.8)',
                }}
              >
                <p
                  className="font-display font-semibold mb-5"
                  style={{ color: 'rgba(226,232,240,0.9)', fontSize: '0.9rem', letterSpacing: '0.02em' }}
                >
                  Supported Integration Stack
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Azure', icon: '☁', color: '#0078d4' },
                    { name: 'Kubernetes', icon: '⎈', color: '#326ce5' },
                    { name: 'Jenkins', icon: '⚙', color: '#d33833' },
                    { name: 'Terraform', icon: '◈', color: '#5c4ee5' },
                    { name: 'Snowflake', icon: '❄', color: '#29b5e8' },
                    { name: 'Tableau', icon: '▦', color: '#e97627' },
                    { name: 'ADF', icon: '⬡', color: '#0078d4' },
                    { name: 'Runbooks', icon: '▣', color: '#00d4ff' },
                  ].map((tech) => (
                    <div
                      key={tech.name}
                      className="flex items-center gap-2.5 p-3 rounded-xl transition-all duration-200"
                      style={{
                        background: 'rgba(10,15,30,0.6)',
                        border: '1px solid rgba(30,48,80,0.6)',
                      }}
                    >
                      <span style={{ color: tech.color, fontSize: '1rem' }}>{tech.icon}</span>
                      <span style={{ color: 'rgba(226,232,240,0.8)', fontSize: '0.8rem', fontWeight: 500 }}>
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture note */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,255,136,0.03))',
                  border: '1px solid rgba(0,212,255,0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00d4ff' }} />
                  <span style={{ color: '#00d4ff', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em' }}>
                    ARCHITECTURE
                  </span>
                </div>
                <p style={{ color: 'rgba(122,155,191,0.85)', fontSize: '0.82rem', lineHeight: 1.7 }}>
                  NEXUS operates as a stateless orchestration layer — all credentials, secrets, and
                  execution contexts are managed through your existing enterprise security perimeter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Use Cases */}
      <section
        id="usecases"
        ref={usecasesRef}
        className="py-24 px-6"
        style={{ background: 'var(--color-surface-2)' }}
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            visible={usecasesVisible}
            tag="BUSINESS USE CASES"
            title="Enterprise Applications"
            sub="From deployment planning to incident response — NEXUS serves every cloud operations team."
          />

          <div className={`mt-14 ${usecasesVisible ? 'fade-in-up' : 'opacity-0'}`}>
            <div
              className="rounded-2xl p-8 mb-8"
              style={{
                background: 'var(--color-surface-3)',
                border: '1px solid rgba(30,48,80,0.8)',
              }}
            >
              <p
                className="leading-relaxed mb-8"
                style={{ color: 'rgba(122,155,191,0.85)', fontSize: '1rem', lineHeight: 1.8, maxWidth: 900 }}
              >
                CloudOps NEXUS can assist Cloud Operations, BI, DevOps, platform engineering, and support
                teams with deployment planning, pipeline troubleshooting, infrastructure validation,
                monitoring review, Snowflake/Tableau operations, ADF pipeline support, access checks,
                and internal knowledge sharing.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { team: 'Cloud Operations', use: 'Infrastructure validation, change management, and cross-region deployment coordination.', color: '#00d4ff' },
                  { team: 'BI & Analytics', use: 'Snowflake query optimization, Tableau workbook deployment, and pipeline health monitoring.', color: '#00ff88' },
                  { team: 'DevOps', use: 'Jenkins pipeline troubleshooting, Terraform plan review, and deployment gate validation.', color: '#ff6b35' },
                  { team: 'Platform Engineering', use: 'Kubernetes cluster health, node autoscaling guidance, and namespace policy enforcement.', color: '#00d4ff' },
                  { team: 'Support Teams', use: 'Incident response coordination, escalation routing, and post-incident knowledge capture.', color: '#00ff88' },
                  { team: 'Security & Compliance', use: 'Access audit trails, approval workflow enforcement, and privilege escalation reviews.', color: '#ff6b35' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="card-hover rounded-xl p-5"
                    style={{ background: 'rgba(10,15,30,0.6)', border: `1px solid ${item.color}20` }}
                  >
                    <div
                      className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold mb-3"
                      style={{
                        background: `${item.color}12`,
                        border: `1px solid ${item.color}30`,
                        color: item.color,
                      }}
                    >
                      {item.team}
                    </div>
                    <p style={{ color: 'rgba(122,155,191,0.8)', fontSize: '0.83rem', lineHeight: 1.65 }}>
                      {item.use}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Impact */}
      <section
        id="impact"
        ref={impactRef}
        className="py-24 px-6"
        style={{ background: 'var(--color-surface)' }}
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            visible={impactVisible}
            tag="BUSINESS IMPACT"
            title="Measurable Outcomes"
            sub="Quantified improvements across operational reliability, efficiency, and team performance."
          />

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mt-14 ${impactVisible ? 'stagger' : 'opacity-0'}`}>
            {IMPACT_METRICS.map((metric) => (
              <div
                key={metric.label}
                className="card-hover rounded-2xl p-6 flex flex-col items-center text-center"
                style={{
                  background: 'var(--color-surface-3)',
                  border: '1px solid rgba(30,48,80,0.8)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{
                    background: 'rgba(0,212,255,0.1)',
                    border: '1px solid rgba(0,212,255,0.25)',
                    color: '#00d4ff',
                  }}
                >
                  {metric.icon}
                </div>
                <div
                  className="font-display font-bold mb-1"
                  style={{ color: '#00d4ff', fontSize: '2rem', lineHeight: 1 }}
                >
                  {metric.value}
                </div>
                <div
                  className="font-semibold mb-2"
                  style={{ color: 'rgba(226,232,240,0.9)', fontSize: '0.8rem' }}
                >
                  {metric.label}
                </div>
                <div style={{ color: 'rgba(122,155,191,0.65)', fontSize: '0.72rem' }}>
                  {metric.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chat Interface */}
      <section
        className="py-24 px-6"
        style={{ background: 'var(--color-surface-2)' }}
      >
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            visible={true}
            tag="INTERACTIVE INTERFACE"
            title="Ask NEXUS"
            sub="Interact directly with the CloudOps NEXUS AI operations interface."
          />

          <div
            className="mt-10 rounded-2xl overflow-hidden"
            style={{
              border: '1px solid rgba(0,212,255,0.2)',
              background: 'var(--color-surface-3)',
            }}
          >
            {/* Terminal header */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{
                background: 'rgba(0,212,255,0.05)',
                borderBottom: '1px solid rgba(30,48,80,0.8)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#00ff88' }} />
                <span style={{ color: '#00d4ff', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em' }}>
                  NEXUS OPERATIONS TERMINAL
                </span>
              </div>
              <span style={{ color: 'rgba(122,155,191,0.5)', fontSize: '0.7rem' }}>v2.4.1</span>
            </div>

            {/* Chat messages */}
            <div
              ref={chatRef}
              className="p-5 min-h-48 max-h-80 overflow-y-auto space-y-4"
              style={{ scrollBehavior: 'smooth' }}
            >
              {chatMessages.length === 0 && (
                <div className="text-center py-6">
                  <p style={{ color: 'rgba(122,155,191,0.5)', fontSize: '0.85rem' }}>
                    NEXUS is ready. Submit a query to begin.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {CHAT_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleQuery(s)}
                        className="px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
                        style={{
                          background: 'rgba(0,212,255,0.06)',
                          border: '1px solid rgba(0,212,255,0.2)',
                          color: 'rgba(0,212,255,0.7)',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.12)'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.06)'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: msg.role === 'nexus'
                        ? 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,136,0.1))'
                        : 'rgba(255,255,255,0.08)',
                      border: msg.role === 'nexus'
                        ? '1px solid rgba(0,212,255,0.3)'
                        : '1px solid rgba(255,255,255,0.1)',
                      color: msg.role === 'nexus' ? '#00d4ff' : 'rgba(226,232,240,0.8)',
                    }}
                  >
                    {msg.role === 'nexus' ? 'NX' : 'U'}
                  </div>
                  <div
                    className="max-w-xl rounded-xl px-4 py-3"
                    style={{
                      background: msg.role === 'nexus'
                        ? 'rgba(0,212,255,0.05)'
                        : 'rgba(255,255,255,0.04)',
                      border: msg.role === 'nexus'
                        ? '1px solid rgba(0,212,255,0.15)'
                        : '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(226,232,240,0.85)',
                      fontSize: '0.85rem',
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,136,0.1))',
                      border: '1px solid rgba(0,212,255,0.3)',
                      color: '#00d4ff',
                    }}
                  >
                    NX
                  </div>
                  <div
                    className="rounded-xl px-4 py-3 flex items-center gap-1.5"
                    style={{
                      background: 'rgba(0,212,255,0.05)',
                      border: '1px solid rgba(0,212,255,0.15)',
                    }}
                  >
                    {[0, 1, 2].map(d => (
                      <div
                        key={d}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: '#00d4ff',
                          animation: `blink 1.2s ease-in-out ${d * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div
              className="px-5 pb-5 pt-3"
              style={{ borderTop: '1px solid rgba(30,48,80,0.6)' }}
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleQuery(query)}
                  placeholder="Ask CloudOps NEXUS anything..."
                  className="nexus-input flex-1 px-4 py-3 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: 'rgba(10,15,30,0.8)',
                    border: '1px solid rgba(30,48,80,0.8)',
                    color: 'rgba(226,232,240,0.9)',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => handleQuery(query)}
                  className="px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(0,212,255,0.1))',
                    border: '1px solid rgba(0,212,255,0.4)',
                    color: '#00d4ff',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(0,212,255,0.35), rgba(0,212,255,0.2))'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(0,212,255,0.1))'
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-6"
        style={{
          background: 'var(--color-surface)',
          borderTop: '1px solid rgba(30,48,80,0.6)',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.25)',
                color: '#00d4ff',
              }}
            >
              NX
            </div>
            <span style={{ color: 'rgba(122,155,191,0.6)', fontSize: '0.8rem' }}>
              CloudOps NEXUS — Enterprise AI Operations Platform
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#00ff88' }} />
              <span style={{ color: 'rgba(122,155,191,0.5)', fontSize: '0.72rem' }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SectionHeader({
  visible,
  tag,
  title,
  sub,
}: {
  visible: boolean
  tag: string
  title: string
  sub: string
}) {
  return (
    <div className={`text-center ${visible ? 'fade-in-up' : 'opacity-0'}`}>
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
        style={{
          background: 'rgba(0,212,255,0.06)',
          border: '1px solid rgba(0,212,255,0.15)',
        }}
      >
        <div className="w-1 h-1 rounded-full" style={{ background: '#00d4ff' }} />
        <span style={{ color: '#00d4ff', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em' }}>
          {tag}
        </span>
      </div>
      <h2
        className="font-display font-bold mb-4"
        style={{ color: 'rgba(226,232,240,0.95)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}
      >
        {title}
      </h2>
      <p style={{ color: 'rgba(122,155,191,0.75)', fontSize: '0.95rem', maxWidth: 560, margin: '0 auto' }}>
        {sub}
      </p>
    </div>
  )
}
