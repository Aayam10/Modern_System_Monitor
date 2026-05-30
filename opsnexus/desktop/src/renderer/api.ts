const BASE = (typeof window !== 'undefined' && (window as any).BACKEND_URL)
  ? (window as any).BACKEND_URL
  : 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown error')
    throw new Error(`${res.status}: ${err}`)
  }
  return res.json()
}

export const api = {
  health: () => request<any>('/health'),
  status: () => request<any>('/api/status'),

  chat: (message: string, environment: string, user = 'engineer') =>
    request<any>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, environment, user }),
    }),

  memory: () => request<any>('/api/memory'),
  updateMemory: (key: string, value: string) =>
    request<any>('/api/memory/update', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    }),

  activity: () => request<any[]>('/api/activity'),

  action: (tool: string, input: string, environment: string, user = 'engineer') =>
    request<any>(`/api/actions/${tool}`, {
      method: 'POST',
      body: JSON.stringify({ input, environment, user }),
    }),

  analyzeFile: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE}/api/file/analyze`, { method: 'POST', body: form })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },
}
