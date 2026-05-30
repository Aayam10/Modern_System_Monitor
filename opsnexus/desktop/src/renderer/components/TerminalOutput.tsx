interface Line {
  type: 'cmd' | 'ok' | 'warn' | 'err' | 'info' | 'dim'
  text: string
}

interface Props {
  lines: Line[]
}

export default function TerminalOutput({ lines }: Props) {
  if (lines.length === 0) return null

  const typeClass: Record<Line['type'], string> = {
    cmd:  't-cmd',
    ok:   't-ok',
    warn: 't-warn',
    err:  't-err',
    info: '',
    dim:  't-dim',
  }

  return (
    <div style={{ flexShrink:0, padding:'0 14px 10px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
        <span className="sec-label">TERMINAL OUTPUT</span>
        <span className="dot dot-green" style={{ width:5, height:5 }} />
      </div>
      <div className="term" style={{ maxHeight:140, overflowY:'auto' }}>
        {lines.map((l, i) => (
          <div key={i} className={typeClass[l.type] || ''}>
            {l.type === 'cmd' ? `$ ${l.text}` : l.text}
          </div>
        ))}
        <span className="t-cmd" style={{ animation:'blink-cur 1s step-end infinite' }}>█</span>
      </div>
    </div>
  )
}

export type { Line }
