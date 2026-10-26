type LayeredMessageProps = {
  advice: string
  info: string
  expertFirstName: string
  tone: 'received' | 'sent'
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((para, i) => (
        <p key={i} className={i > 0 ? 'mt-2.5' : ''}>{para}</p>
      ))}
    </>
  )
}

export default function LayeredMessage({ advice, info, expertFirstName, tone }: LayeredMessageProps) {
  const sent = tone === 'sent'
  const labelColor = sent ? 'rgba(255,255,255,0.7)' : 'var(--color-accent-text)'
  const infoLabelColor = sent ? 'rgba(255,255,255,0.6)' : 'var(--color-slate-400)'

  return (
    <div
      className={`rounded-2xl overflow-hidden text-[13px] leading-[1.65] border ${sent ? 'rounded-br-md' : 'rounded-bl-md'}`}
      style={{
        background: sent ? 'var(--color-accent)' : 'var(--color-slate-900)',
        borderColor: sent ? 'var(--color-accent)' : 'var(--color-slate-800)',
        color: sent ? 'white' : 'var(--color-slate-200)',
      }}
    >
      <div className="px-4 pt-3 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1.5" style={{ color: labelColor }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <circle cx="5" cy="3.2" r="2" stroke="currentColor" strokeWidth="1.1" />
            <path d="M1.5 9c0-1.9 1.6-3.2 3.5-3.2S8.5 7.1 8.5 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
          {expertFirstName}'s advice for your situation
        </p>
        <Paragraphs text={advice} />
      </div>
      <div
        className="px-4 pt-2.5 pb-3 text-[12px] leading-[1.6]"
        style={{
          background: sent ? 'rgba(255,255,255,0.1)' : 'var(--color-ground-deep)',
          borderTop: `1px solid ${sent ? 'rgba(255,255,255,0.15)' : 'var(--color-slate-800)'}`,
          color: sent ? 'rgba(255,255,255,0.88)' : 'var(--color-slate-400)',
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: infoLabelColor }}>
          General information · AI-prepared, checked by {expertFirstName}
        </p>
        <Paragraphs text={info} />
      </div>
    </div>
  )
}
