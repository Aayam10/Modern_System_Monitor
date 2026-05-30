import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

export interface ChatMessage {
  id: string
  role: 'user' | 'nexus' | 'system'
  text: string
  tool?: string
  ts: Date
}

interface Props { messages: ChatMessage[]; loading: boolean }

const TOOL_ICONS: Record<string,string> = {
  jenkins:'⚙', snowflake:'❄', adf:'☁', kubernetes:'⎈',
  tableau:'▦', terraform:'◈', incident:'◉', standup:'◇', assistant:'◎',
}

export default function ChatWorkspace({ messages, loading }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, loading])

  return (
    <div
      style={{
        flex:1, overflowY:'auto', padding:'16px 16px 8px',
        display:'flex', flexDirection:'column', gap:14,
      }}
    >
      {messages.map(msg => (
        <div
          key={msg.id}
          className="anim-in"
          style={{ display:'flex', gap:10, flexDirection: msg.role==='user' ? 'row-reverse' : 'row' }}
        >
          {/* Avatar */}
          <div style={{
            width:30, height:30, borderRadius:7, flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontWeight:700, fontFamily:'var(--display)',
            background: msg.role==='user' ? 'rgba(255,255,255,.06)' : msg.role==='system' ? 'rgba(240,146,14,.1)' : 'rgba(0,196,232,.1)',
            border: `1px solid ${msg.role==='user' ? 'rgba(255,255,255,.1)' : msg.role==='system' ? 'rgba(240,146,14,.25)' : 'rgba(0,196,232,.25)'}`,
            color: msg.role==='user' ? 'var(--muted)' : msg.role==='system' ? 'var(--amber)' : 'var(--cyan)',
          }}>
            {msg.role==='user' ? 'YOU' : msg.role==='system' ? '⚠' : (TOOL_ICONS[msg.tool||''] ?? 'NX')}
          </div>

          {/* Bubble */}
          <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems: msg.role==='user' ? 'flex-end' : 'flex-start', maxWidth:'72%' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              {msg.tool && <span className="badge badge-cyan" style={{ fontSize:9 }}>{msg.tool}</span>}
              <span style={{ color:'var(--dim)', fontSize:10, fontFamily:'var(--mono)' }}>
                {msg.ts.toLocaleTimeString()}
              </span>
            </div>
            {msg.role === 'user' ? (
              <div className="bubble-user">{msg.text}</div>
            ) : msg.role === 'system' ? (
              <div className="bubble-system">{msg.text}</div>
            ) : (
              <div className="bubble-nexus">
                <div className="md">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {loading && (
        <div className="anim-in" style={{ display:'flex', gap:10 }}>
          <div style={{
            width:30, height:30, borderRadius:7, flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'rgba(0,196,232,.1)', border:'1px solid rgba(0,196,232,.25)',
            color:'var(--cyan)', fontSize:11, fontWeight:700,
          }}>NX</div>
          <div className="bubble-nexus" style={{ display:'flex', gap:5, alignItems:'center', padding:'12px 16px' }}>
            {[0,1,2].map(d => (
              <span key={d} style={{
                width:7, height:7, borderRadius:'50%', background:'var(--cyan)', display:'inline-block',
                animation:`blink-cur 1.2s ${d*0.22}s ease-in-out infinite`,
              }} />
            ))}
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}
