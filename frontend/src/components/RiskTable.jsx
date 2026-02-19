const RISK_CONFIG = {
  'Safe':          { cls: 'badge-success', dot: 'bg-gov-success',   row: 'bg-green-50/40'  },
  'Adjust Dosage': { cls: 'badge-warning', dot: 'bg-amber-500',     row: 'bg-amber-50/40'  },
  'Toxic':         { cls: 'badge-danger',  dot: 'bg-gov-danger',    row: 'bg-red-50/40'    },
  'Ineffective':   { cls: 'badge-orange',  dot: 'bg-orange-500',    row: 'bg-orange-50/40' },
  'Unknown':       { cls: 'badge-muted',   dot: 'bg-gray-400',      row: ''                },
}

function RiskBadge({ label }) {
  const cfg = RISK_CONFIG[label] || RISK_CONFIG['Unknown']
  return (
    <span className={`badge ${cfg.cls} flex items-center gap-1.5`} aria-label={`Risk level: ${label}`}>
      <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {label}
    </span>
  )
}

const SEVERITY_COLOR = {
  High: 'text-gov-danger font-semibold',
  Moderate: 'text-amber-700 font-semibold',
  Low: 'text-gov-success',
  Undetermined: 'text-gov-muted italic',
}

export default function RiskTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-gov-muted italic py-2">No risk assessment data available.</p>
  }

  return (
    <div className="overflow-x-auto border border-gov-border">
      <table className="gov-table" aria-label="Drug risk assessment summary">
        <thead>
          <tr>
            <th>#</th>
            <th>Drug</th>
            <th>Risk Label</th>
            <th>Severity</th>
            <th>Confidence Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const cfg = RISK_CONFIG[row.riskLabel] || RISK_CONFIG['Unknown']
            return (
              <tr key={idx} className={cfg.row}>
                <td className="text-gov-muted font-mono text-xs w-10 text-center">{idx + 1}</td>
                <td className="font-semibold text-gov-text">{row.drug}</td>
                <td><RiskBadge label={row.riskLabel} /></td>
                <td className={`text-sm ${SEVERITY_COLOR[row.severity] || 'text-gov-text'}`}>
                  {row.severity}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gov-text">{row.confidence}</span>
                    {row.confidence !== 'N/A' && (
                      <div className="flex-1 max-w-20 h-1.5 bg-gray-200 overflow-hidden" aria-hidden="true">
                        <div
                          className="h-full bg-gov-blue-mid"
                          style={{ width: row.confidence }}
                        />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
