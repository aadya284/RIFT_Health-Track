import { useState } from 'react'

export default function JSONBlock({ data, filename = 'nova-report.json' }) {
  const [copied, setCopied] = useState(false)

  const jsonString = JSON.stringify(data, null, 2)

  function handleCopy() {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function handleDownload() {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="border border-gov-border">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[#1e2d3d] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" aria-hidden="true">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
          <span className="text-xs font-mono text-[#94a3b8] uppercase tracking-widest">
            JSON
          </span>
          <span className="text-xs text-[#64748b] ml-1">{filename}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border cursor-pointer font-semibold transition-colors ${
              copied
                ? 'bg-green-700 border-green-600 text-white'
                : 'bg-[#2d3d50] border-[#3d4f63] text-[#94a3b8] hover:bg-[#3d4f63] hover:text-white'
            }`}
            aria-label="Copy JSON to clipboard"
          >
            {copied ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gov-blue border border-gov-blue text-white cursor-pointer font-semibold hover:bg-gov-blue-mid"
            aria-label="Download JSON file"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Code block */}
      <div
        className="overflow-auto max-h-96 bg-[#f8f9fa]"
        role="region"
        aria-label="JSON structured output"
      >
        <pre className="text-xs font-mono text-[#374151] p-5 m-0 whitespace-pre leading-relaxed">
          {jsonString}
        </pre>
      </div>

      {/* Footer */}
      <div className="bg-[#f3f4f6] border-t border-gov-border px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gov-muted">
          {jsonString.split('\n').length} lines &bull; {new Blob([jsonString]).size} bytes
        </span>
        <span className="text-xs text-gov-muted font-mono">application/json</span>
      </div>
    </div>
  )
}
