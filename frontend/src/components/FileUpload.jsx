import { useState, useRef } from 'react'
import Alert from './Alert.jsx'

const MAX_SIZE_BYTES = 5 * 1024 * 1024

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function FileUpload({ onFileSelect }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  function processFile(selected) {
    setError('')
    setFile(null)
    if (!selected) return

    if (!selected.name.toLowerCase().endsWith('.vcf')) {
      setError('Invalid file format. Only .vcf (Variant Call Format) files are accepted.')
      return
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError(`File size (${formatBytes(selected.size)}) exceeds the maximum allowed size of 5 MB.`)
      return
    }
    setFile(selected)
    if (onFileSelect) onFileSelect(selected)
  }

  function handleChange(e) {
    processFile(e.target.files[0])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }

  function handleRemove() {
    setFile(null)
    setError('')
    inputRef.current.value = ''
    if (onFileSelect) onFileSelect(null)
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed transition-colors ${
          dragOver
            ? 'border-gov-blue-mid bg-blue-50'
            : 'border-gov-border bg-[#f8f9fa] hover:border-gov-blue-mid hover:bg-blue-50/40'
        } p-6 text-center cursor-pointer`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload VCF file – click or drag and drop"
      >
        <svg
          width="32" height="32"
          viewBox="0 0 24 24" fill="none"
          stroke="#6b7280" strokeWidth="1.5"
          className="mx-auto mb-3" aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p className="text-sm font-semibold text-gov-text mb-1">
          Click to select or drag and drop a file
        </p>
        <p className="text-xs text-gov-muted">
          Accepted: <strong>.vcf</strong> &bull; Max size: <strong>5 MB</strong>
        </p>
        <input
          id="vcf-upload"
          ref={inputRef}
          type="file"
          accept=".vcf"
          onChange={handleChange}
          aria-describedby={error ? 'file-error-msg' : 'file-upload-hint'}
          aria-required="true"
          className="sr-only"
        />
      </div>

      <p id="file-upload-hint" className="text-xs text-gov-muted mt-1.5">
        VCF 4.1 or higher &bull; GRCh37/hg19 or GRCh38/hg38 &bull; GT field required
      </p>

      {error && (
        <div className="mt-2" id="file-error-msg" role="alert">
          <Alert variant="error" title="Upload Error">{error}</Alert>
        </div>
      )}

      {file && (
        <div className="mt-3 border border-gov-success bg-green-50">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-green-200">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7f37" strokeWidth="2.5" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span className="text-xs font-bold text-gov-success uppercase tracking-wide">File Validated</span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-gov-danger hover:underline border-0 bg-transparent p-0 cursor-pointer"
              aria-label="Remove selected file"
            >
              Remove
            </button>
          </div>
          <table className="w-full text-xs" aria-label="Selected file details">
            <tbody>
              <tr className="border-b border-green-100">
                <td className="px-4 py-2 font-semibold text-gov-muted w-32">File Name</td>
                <td className="px-4 py-2 font-mono text-gov-text">{file.name}</td>
              </tr>
              <tr className="border-b border-green-100">
                <td className="px-4 py-2 font-semibold text-gov-muted">File Size</td>
                <td className="px-4 py-2 text-gov-text">{formatBytes(file.size)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold text-gov-muted">Status</td>
                <td className="px-4 py-2 text-gov-success font-semibold">Format and size verified</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
