import { useCallback } from 'react'

interface Props {
  onFile: (f: File) => void
  dragging: boolean
  setDragging: (v: boolean) => void
}

export default function FileDropZone({ onFile, dragging, setDragging }: Props) {
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }, [onFile, setDragging])

  return (
    <div
      className={`drop-zone ${dragging ? 'over' : ''}`}
      style={{ padding:'22px 20px', textAlign:'center' }}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => document.getElementById('nx-file-input')?.click()}
    >
      <input
        id="nx-file-input"
        type="file"
        style={{ display:'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }}
      />
      <div style={{ color:'var(--cyan)', fontSize:24, marginBottom:8 }}>▣</div>
      <div style={{ color:'var(--text)', fontSize:13, fontWeight:500, marginBottom:4 }}>
        Drop a file or click to browse
      </div>
      <div style={{ color:'var(--dim)', fontSize:11 }}>
        .tf · .yaml · .json · .sql · .log · Jenkinsfile
      </div>
    </div>
  )
}
