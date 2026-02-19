import { useState } from 'react'
import Alert from './Alert.jsx'

const SUPPORTED_DRUGS = [
  'Codeine', 'Warfarin', 'Clopidogrel', 'Simvastatin',
  'Azathioprine', 'Fluorouracil', 'Tamoxifen', 'Citalopram',
  'Escitalopram', 'Sertraline', 'Omeprazole', 'Pantoprazole',
  'Irinotecan', 'Capecitabine',
]

export default function DrugInput({ onDrugsChange }) {
  const [inputMode, setInputMode] = useState('text')
  const [textValue, setTextValue] = useState('')
  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')

  function handleTextChange(e) {
    setTextValue(e.target.value)
    setError('')
    const drugs = e.target.value.split(',').map(d => d.trim()).filter(Boolean)
    if (onDrugsChange) onDrugsChange(drugs)
  }

  function toggleDrug(drug) {
    const updated = selected.includes(drug)
      ? selected.filter(d => d !== drug)
      : [...selected, drug]
    setSelected(updated)
    setError('')
    if (onDrugsChange) onDrugsChange(updated)
  }

  function clearAll() {
    setSelected([])
    if (onDrugsChange) onDrugsChange([])
  }

  const currentDrugs = inputMode === 'text'
    ? textValue.split(',').map(d => d.trim()).filter(Boolean)
    : selected

  return (
    <div>
      {/* Mode selector */}
      <div className="flex items-center gap-0 mb-4 border border-gov-border divide-x divide-gov-border">
        {[
          { val: 'text',   label: 'Free Text' },
          { val: 'select', label: 'Quick Select' },
        ].map(mode => (
          <button
            key={mode.val}
            type="button"
            onClick={() => setInputMode(mode.val)}
            className={`flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wide border-0 cursor-pointer transition-colors ${
              inputMode === mode.val
                ? 'bg-gov-blue text-white'
                : 'bg-white text-gov-muted hover:bg-[#f3f4f6] hover:text-gov-text'
            }`}
            aria-pressed={inputMode === mode.val}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {inputMode === 'text' ? (
        <div>
          <label htmlFor="drug-text-input" className="gov-label">
            Drug Name(s) <span className="text-gov-danger" aria-hidden="true">*</span>
          </label>
          <input
            id="drug-text-input"
            type="text"
            value={textValue}
            onChange={handleTextChange}
            placeholder="e.g. Warfarin, Clopidogrel, Codeine"
            className="gov-input"
            aria-describedby="drug-text-hint"
            aria-required="true"
            autoComplete="off"
          />
          <p id="drug-text-hint" className="text-xs text-gov-muted mt-1.5">
            Enter one or more drug names separated by commas.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="gov-label mb-0">
              Select Drug(s) <span className="text-gov-danger" aria-hidden="true">*</span>
            </label>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-gov-muted hover:text-gov-danger border-0 bg-transparent p-0 cursor-pointer"
                aria-label="Clear all selected drugs"
              >
                Clear all
              </button>
            )}
          </div>
          <div
            className="border border-gov-border bg-white"
            role="listbox"
            aria-label="Supported drugs"
            aria-multiselectable="true"
          >
            {SUPPORTED_DRUGS.map((drug, idx) => {
              const isSelected = selected.includes(drug)
              return (
                <button
                  key={drug}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleDrug(drug)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left border-0 cursor-pointer transition-colors ${
                    idx < SUPPORTED_DRUGS.length - 1 ? 'border-b border-gov-border' : ''
                  } ${
                    isSelected
                      ? 'bg-[#e8f0f8] text-gov-blue font-semibold'
                      : 'bg-white text-gov-text hover:bg-[#f3f4f6]'
                  }`}
                >
                  <span>{drug}</span>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-gov-muted mt-1.5">
            Click to toggle selection. {selected.length} drug{selected.length !== 1 ? 's' : ''} selected.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-2">
          <Alert variant="error" title="Validation Error">{error}</Alert>
        </div>
      )}

      {currentDrugs.length > 0 && (
        <div className="mt-3 bg-green-50 border border-green-200 px-3 py-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-gov-success uppercase tracking-wide mr-1">
            {currentDrugs.length} drug{currentDrugs.length !== 1 ? 's' : ''}:
          </span>
          {currentDrugs.map(d => (
            <span key={d} className="text-xs bg-white border border-green-300 text-gov-success px-2 py-0.5 font-medium">
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
