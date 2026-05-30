const BASE =
  (typeof window !== 'undefined' && (window as any).BACKEND_URL) ||
  'http://localhost:8000'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`${res.status}: ${await res.text().catch(() => '')}`)
  return res.json()
}

export const api = {
  health:       ()                                     => req<any>('/health'),
  status:       ()                                     => req<any>('/api/status'),
  chat:         (message: string, env: string)         => req<any>('/api/chat', { method:'POST', body: JSON.stringify({ message, environment: env, user: 'engineer' }) }),
  memory:       ()                                     => req<any>('/api/memory'),
  updateMemory: (key: string, value: string)           => req<any>('/api/memory/update', { method:'POST', body: JSON.stringify({ key, value }) }),
  activity:     ()                                     => req<any[]>('/api/activity'),
  action:       (tool: string, input: string, env: string) => req<any>(`/api/actions/${tool}`, { method:'POST', body: JSON.stringify({ input, environment: env, user: 'engineer' }) }),
  analyzeFile:  async (file: File) => {
    const form = new FormData(); form.append('file', file)
    const r = await fetch(`${BASE}/api/file/analyze`, { method:'POST', body: form })
    if (!r.ok) throw new Error(await r.text())
    return r.json()
  },
}
