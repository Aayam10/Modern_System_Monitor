import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import FileDropZone from '../components/FileDropZone'
import ApprovalModal from '../components/ApprovalModal'
import { api } from '../api'

export default function FileAnalyzerPage() {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [approval, setApproval] = useState(false)
  const [pendingFile, setPendingFile] = useState<File|null>(null)
  const [pendingResult, setPendingResult] = useState<any>(null)

  const handleFile = async (f: File) => {
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await api.analyzeFile(f)
      setPendingResult(res)
      setPendingFile(f)
      setApproval(true)
    } catch {
      setError('Backend unavailable. Start with: docker compose up --build')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* Left drop zone */}
      <div style={{
        width:280, padding:'14px 12px', borderRight:'1px solid var(--border)',
        background:'var(--panel)', flexShrink:0, display:'flex', flexDirection:'column', gap:12,
      }}>
        <div className="sec-label">FILE ANALYZER</div>
        <FileDropZone onFile={handleFile} dragging={dragging} setDragging={setDragging} />
        {loading && (
          <div style={{ color:'var(--cyan)', fontSize:12, textAlign:'center' }}>Analyzing file...</div>
        )}
        {error && (
          <div style={{ color:'var(--red)', fontSize:12, padding:'8px 12px', borderRadius:7, background:'rgba(232,64,64,.06)', border:'1px solid rgba(232,64,64,.2)' }}>
            {error}
          </div>
        )}
        <div style={{ color:'var(--dim)', fontSize:11, lineHeight:1.7 }}>
          Upload a config, log, or script file. OpsNexus will analyze it and return a mock risk assessment.
          No file is sent to any external service.
        </div>
      </div>

      {/* Main results */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
        {!result ? (
          <div style={{ textAlign:'center', paddingTop:60 }}>
            <div style={{ fontSize:32, color:'var(--dim)', marginBottom:12 }}>▣</div>
            <div style={{ color:'var(--muted)', fontSize:13 }}>Drop a file to analyze</div>
            <div style={{ color:'var(--dim)', fontSize:11, marginTop:6 }}>
              Supported: Terraform, Kubernetes YAML, Jenkinsfile, ADF JSON, SQL, logs, and more
            </div>
          </div>
        ) : (
          <div className="anim-in">
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <span style={{ fontFamily:'var(--display)', fontWeight:700, fontSize:15, color:'var(--text)' }}>
                {result.filename}
              </span>
              <span className="badge badge-cyan">{result.detected_system}</span>
              <span className="badge badge-amber" style={{ fontSize:9 }}>DEMO</span>
            </div>

            {/* Meta grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
              {[
                ['File Type',     result.file_type],
                ['Size',          `${result.file_size_bytes} bytes`],
                ['Detected System', result.detected_system],
              ].map(([l,v]) => (
                <div key={l} style={{ padding:'10px 12px', borderRadius:8, background:'var(--card)', border:'1px solid var(--border)' }}>
                  <div className="sec-label" style={{ marginBottom:3 }}>{l}</div>
                  <div style={{ color:'var(--text)', fontSize:12.5 }}>{v}</div>
                </div>
              ))}
            </div>

            <AnalysisSection title="Summary" icon="◎">
              <p style={{ color:'var(--muted)', fontSize:13, lineHeight:1.7 }}>{result.summary}</p>
            </AnalysisSection>

            <AnalysisSection title="Identified Risks" icon="⚠">
              {result.risks?.map((r: string, i: number) => (
                <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
                  <span style={{ color:'var(--amber)', marginTop:1, flexShrink:0 }}>⚠</span>
                  <span style={{ color:'var(--muted)', fontSize:12.5 }}>{r}</span>
                </div>
              ))}
            </AnalysisSection>

            <AnalysisSection title="Recommended Next Steps" icon="→">
              {result.recommended_next_steps?.map((s: string, i: number) => (
                <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
                  <span style={{ color:'var(--cyan)', marginTop:1, flexShrink:0 }}>→</span>
                  <span style={{ color:'var(--muted)', fontSize:12.5 }}>{s}</span>
                </div>
              ))}
            </AnalysisSection>

            {result.preview && (
              <AnalysisSection title="File Preview (first 500 chars, data masked)" icon="▣">
                <div className="term">{result.preview}</div>
              </AnalysisSection>
            )}

            <div style={{
              display:'flex', alignItems:'center', gap:8, padding:'9px 14px',
              borderRadius:8, background:'rgba(240,146,14,.06)', border:'1px solid rgba(240,146,14,.2)',
              color:'var(--amber)', fontSize:12, marginTop:12,
            }}>
              <span>⚠</span> Human approval required before acting on any finding. Demo mode only.
            </div>
          </div>
        )}
      </div>

      {approval && pendingFile && (
        <ApprovalModal
          tool="File Analyzer"
          input={pendingFile.name}
          env="n/a"
          riskLevel="low"
          onApprove={() => { setResult(pendingResult); setApproval(false) }}
          onCancel={() => setApproval(false)}
        />
      )}
    </div>
  )
}

function AnalysisSection({ title, icon, children }: { title:string; icon:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:14, padding:'12px 14px', borderRadius:9, background:'var(--card)', border:'1px solid var(--border)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
        <span style={{ color:'var(--cyan)', fontSize:12 }}>{icon}</span>
        <span style={{ fontFamily:'var(--display)', fontWeight:600, fontSize:12.5, color:'var(--text)' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}
