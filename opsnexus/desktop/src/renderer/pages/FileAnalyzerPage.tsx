import { useState, useCallback } from 'react'
import { api } from '../api'

export default function FileAnalyzerPage() {
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyze = async (file: File) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.analyzeFile(file)
      setResult(res)
    } catch {
      setError('Backend unavailable. Start with: docker compose up --build')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) analyze(file)
  }, [])

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) analyze(file)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5 fade-up">
      <div>
        <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>File Analyzer</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Upload a configuration, log, or script file for automated analysis. Demo mode — no data is sent externally.
        </p>
      </div>

      <div
        className={`drop-zone ${dragging ? 'over' : ''} flex flex-col items-center justify-center py-14 px-8 text-center`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input id="file-input" type="file" className="hidden" onChange={onFileInput} />
        <div style={{ fontSize: 36, color: 'var(--cyan)', marginBottom: 12 }}>▣</div>
        <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>
          {loading ? 'Analyzing file...' : 'Drop a file here or click to browse'}
        </p>
        <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 6 }}>
          Supported: .tf, .yaml, .yml, .json, .sql, .log, Jenkinsfile, and more
        </p>
      </div>

      {error && (
        <div className="nexus-card p-4" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {result && (
        <div className="nexus-card p-5 space-y-4 fade-up">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold" style={{ color: 'var(--text)', fontSize: 15 }}>
              Analysis Results
            </h2>
            <div className="flex gap-2">
              <span className="badge badge-cyan">{result.detected_system}</span>
              <span className="badge badge-amber">DEMO</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Filename" value={result.filename} />
            <Field label="Type" value={result.file_type} />
            <Field label="Size" value={`${result.file_size_bytes} bytes`} />
            <Field label="Detected System" value={result.detected_system} />
          </div>

          <div>
            <FieldLabel>Summary</FieldLabel>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7 }}>{result.summary}</p>
          </div>

          <div>
            <FieldLabel>Identified Risks</FieldLabel>
            <ul className="space-y-1.5 mt-2">
              {result.risks?.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span style={{ color: 'var(--amber)', marginTop: 1 }}>⚠</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FieldLabel>Recommended Next Steps</FieldLabel>
            <ul className="space-y-1.5 mt-2">
              {result.recommended_next_steps?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span style={{ color: 'var(--cyan)', marginTop: 1 }}>→</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {result.preview && (
            <div>
              <FieldLabel>File Preview (first 500 chars, sensitive data masked)</FieldLabel>
              <div className="terminal-block mt-2">{result.preview}</div>
            </div>
          )}

          <div className="approval-banner">
            <span>⚠</span>
            <span>Human approval required before acting on any finding. Demo mode — no real analysis was performed.</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p style={{ color: 'var(--text)', fontSize: 13, marginTop: 3 }}>{value}</p>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', display: 'block' }}>
      {(children as string).toUpperCase?.() ?? children}
    </span>
  )
}
