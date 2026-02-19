const IMPACT_CONFIG = {
  High:     { cls: 'badge-danger',  label: 'High' },
  Moderate: { cls: 'badge-warning', label: 'Moderate' },
  Low:      { cls: 'badge-success', label: 'Low' },
  Modifier: { cls: 'badge-muted',   label: 'Modifier' },
}

export default function VariantTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-gov-muted italic py-2">No variant data detected.</p>
  }

  return (
    <div className="overflow-x-auto border border-gov-border">
      <table className="gov-table" aria-label="Detected genomic variants">
        <thead>
          <tr>
            <th>#</th>
            <th>RS ID</th>
            <th>Chromosomal Position</th>
            <th>Genotype</th>
            <th>Impact Level</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const cfg = IMPACT_CONFIG[row.impact] || { cls: 'badge-muted', label: row.impact }
            return (
              <tr key={idx}>
                <td className="text-gov-muted font-mono text-xs w-10 text-center">{idx + 1}</td>
                <td>
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/snp/${row.rsid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-gov-blue-mid underline"
                    aria-label={`View ${row.rsid} on NCBI dbSNP`}
                  >
                    {row.rsid}
                  </a>
                </td>
                <td className="font-mono text-xs text-gov-text-secondary">{row.position}</td>
                <td>
                  <span className="font-mono text-sm font-bold text-gov-text bg-gray-100 border border-gov-border px-2 py-0.5">
                    {row.genotype}
                  </span>
                </td>
                <td>
                  <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
