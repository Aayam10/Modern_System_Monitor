import { useState, useEffect } from 'react'
import { api } from '../api'

export default function MemoryPage() {
  const [memory, setMemory] = useState<Record<string, any>>({})
  const [editKey, setEditKey] = useState('')
  const [editVal, setEditVal] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.memory()
      .then(setMemory)
      .catch(() => setMemory({ error: 'Backend unavailable' }))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!editKey.trim() || !editVal.trim()) return
    try {
      await api.updateMemory(editKey.trim(), editVal.trim())
      setMemory(prev => ({ ...prev, [editKey.trim()]: editVal.trim() }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setEditKey('')
      setEditVal('')
    } catch {
      // Backend offline
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5 fade-up">
      <div>
        <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>Memory & Context</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          OpsNexus stores operational context to improve routing and responses. Stored in context_store.json.
        </p>
      </div>

      <div className="nexus-card p-5">
        <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--text)', fontSize: 14 }}>Current Context</h2>
        {loading ? (
          <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>Loading...</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(memory).map(([k, v]) => (
              <div
                key={k}
                className="flex items-start gap-4 py-3 px-4 rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                <span
                  className="font-mono flex-shrink-0"
                  style={{ color: 'var(--cyan)', fontSize: 12, minWidth: 220 }}
                >
                  {k}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="nexus-card p-5">
        <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--text)', fontSize: 14 }}>Update Context</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block', marginBottom: 5 }}>KEY</label>
            <input
              className="nexus-input"
              value={editKey}
              onChange={e => setEditKey(e.target.value)}
              placeholder="e.g., preferred_environment"
            />
          </div>
          <div>
            <label style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block', marginBottom: 5 }}>VALUE</label>
            <input
              className="nexus-input"
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              placeholder="e.g., Azure East US"
            />
          </div>
        </div>
        <button className="btn-primary" onClick={save}>
          {saved ? 'Saved!' : 'Save Context'}
        </button>
      </div>
    </div>
  )
}
