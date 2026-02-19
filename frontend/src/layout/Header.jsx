import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  const [dateTime, setDateTime] = useState({ date: '', time: '' })

  useEffect(() => {
    function update() {
      const now = new Date()
      setDateTime({
        date: now.toLocaleDateString('en-IN', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        }),
        time: now.toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
        })
      })
    }
    update()
    const timer = setInterval(update, 30000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header role="banner">

      {/* Top info strip */}
      <div className="bg-[#002244] text-white py-1 px-4 border-b border-[#003d80]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-400" aria-live="polite">
            <time aria-label="Current date">{dateTime.date}</time>
            <span className="text-gray-600">|</span>
            <time aria-label="Current time" className="font-mono">{dateTime.time}</time>
          </div>
        </div>
      </div>

      {/* Main brand header */}
      <div className="bg-white border-b-4 border-gov-blue">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-6">

          {/* Left: Emblem + title */}
          <div className="flex items-center gap-5">
            {/* Official-style emblem */}
            <div
              className="w-16 h-16 border-2 border-gov-blue flex-shrink-0 flex items-center justify-center bg-[#f5f8fc]"
              aria-hidden="true"
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Stylized Rx / genome cross icon */}
                <circle cx="20" cy="20" r="18" stroke="#003366" strokeWidth="1.5" fill="none"/>
                <circle cx="20" cy="20" r="12" stroke="#005ea2" strokeWidth="1" fill="none" strokeDasharray="3 2"/>
                {/* DNA double helix simplified */}
                <path d="M13 10 Q20 15 27 10" stroke="#003366" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M13 14 Q20 19 27 14" stroke="#005ea2" strokeWidth="1" fill="none" strokeLinecap="round"/>
                <path d="M13 18 Q20 23 27 18" stroke="#003366" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M13 22 Q20 27 27 22" stroke="#005ea2" strokeWidth="1" fill="none" strokeLinecap="round"/>
                <path d="M13 26 Q20 31 27 26" stroke="#003366" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                {/* Vertical strands */}
                <line x1="13" y1="10" x2="13" y2="26" stroke="#003366" strokeWidth="1" />
                <line x1="27" y1="10" x2="27" y2="26" stroke="#003366" strokeWidth="1" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <Link to="/" className="text-2xl font-bold text-gov-blue tracking-tight no-underline hover:no-underline">
                  PharmaGuard
                </Link>
                <span
                  className="text-[10px] font-bold text-white bg-gov-blue px-2 py-0.5 uppercase tracking-widest"
                  aria-label="Beta version"
                >
                  BETA
                </span>
              </div>
              <p className="text-sm font-medium text-gov-text-secondary mt-0.5 mb-0">
                Pharmacogenomic Risk Assessment System
              </p>
              <p className="text-xs text-gov-muted mt-0.5 mb-0">
                RIFT 2026 Hackathon &bull; HealthTech Track &bull; Powered by CPIC v3.0 / PharmGKB
              </p>
            </div>
          </div>

          {/* Right: Quick action */}
          <div className="hidden lg:flex flex-col items-end gap-1.5">
            <Link
              to="/analyze"
              className="gov-btn-primary text-xs px-4 py-2 no-underline hover:no-underline"
              aria-label="Start new genomic analysis"
            >
              Start Analysis
            </Link>
            <span className="text-xs text-gov-muted">VCF-based risk prediction</span>
          </div>
        </div>
      </div>
    </header>
  )
}
