import { useState } from 'react'
import { uuid } from '../util/uuid'
import ChatWorkspace, { type ChatMessage } from '../components/ChatWorkspace'
import CommandInput from '../components/CommandInput'
import TerminalOutput, { type Line } from '../components/TerminalOutput'
import ApprovalModal from '../components/ApprovalModal'
import MemoryPanel from '../components/MemoryPanel'
import ActivityLog from '../components/ActivityLog'
import { api } from '../api'
import type { Env } from '../App'

interface Props { env: Env }

type ApprovalState = { tool: string; input: string; pending: any } | null

function inferRisk(tool: string): 'low'|'medium'|'high' {
  if (['terraform','incident'].includes(tool)) return 'high'
  if (['kubernetes','adf','jenkins'].includes(tool)) return 'medium'
  return 'low'
}

export default function AssistantPage({ env }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuid(),
      role: 'system',
      text: 'OpsNexus is ready. Demo mode active — no real systems connected. All actions require approval before output is shown.',
      ts: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const [approval, setApproval] = useState<ApprovalState>(null)
  const [termLines, setTermLines] = useState<Line[]>([
    { type:'dim',  text:'OpsNexus backend session started' },
    { type:'info', text:'Mode: demo | Integrations: mock | Read-only: yes' },
    { type:'ok',   text:'All safety checks passed' },
  ])

  const appendMsg = (msg: Omit<ChatMessage,'id'>) =>
    setMessages(p => [...p, { ...msg, id: uuid() }])

  const addTermLine = (l: Line) =>
    setTermLines(p => [...p.slice(-40), l])

  const handleSend = async (text: string) => {
    appendMsg({ role:'user', text, ts:new Date() })
    setLoading(true)
    addTermLine({ type:'cmd', text:`chat "${text.slice(0,60)}..."` })

    try {
      const res = await api.chat(text, env)
      setLoading(false)
      addTermLine({ type:'info', text:`Routed to: ${res.tool}` })
      // Show approval gate
      setApproval({ tool: res.tool, input: text, pending: res })
    } catch {
      setLoading(false)
      addTermLine({ type:'err', text:'Backend unavailable — start with: docker compose up --build' })
      appendMsg({
        role:'nexus',
        text:'**Backend not reachable.** Start the backend:\n```\ndocker compose up --build\n```\nOr: `cd backend && uvicorn app.main:app --reload`',
        ts: new Date(),
      })
    }
  }

  const handleApprove = () => {
    if (!approval) return
    const r = approval.pending
    appendMsg({ role:'nexus', text: r.response, tool: r.tool, ts:new Date() })
    addTermLine({ type:'ok', text:`${r.tool}: output approved and displayed` })
    setApproval(null)
  }

  const handleCancel = () => {
    if (!approval) return
    appendMsg({
      role:'nexus',
      text:'Action cancelled. No output was shown. No systems were accessed.',
      ts: new Date(),
    })
    addTermLine({ type:'warn', text:'Action cancelled by user' })
    setApproval(null)
  }

  return (
    <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
      {/* Main column */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <ChatWorkspace messages={messages} loading={loading} />
        <TerminalOutput lines={termLines} />
        <ActivityLog />
        <CommandInput onSend={handleSend} disabled={loading || !!approval} />
      </div>

      {/* Right panel */}
      <MemoryPanel />

      {/* Approval overlay */}
      {approval && (
        <ApprovalModal
          tool={approval.tool}
          input={approval.input}
          env={env}
          riskLevel={inferRisk(approval.tool)}
          onApprove={handleApprove}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
