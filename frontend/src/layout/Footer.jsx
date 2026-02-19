export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="bg-gov-blue text-white mt-12"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-6 border-b border-blue-800">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-300 mb-3">
              PharmaGuard
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              A pharmacogenomic risk prediction system developed for the RIFT 2026
              Hackathon HealthTech Track. Not intended for clinical use.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-300 mb-3">
              Disclaimer
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              This tool is for research and educational purposes only. Results must not
              be used as a substitute for professional medical advice, diagnosis, or
              treatment.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-300 mb-3">
              References
            </h2>
            <ul className="text-xs text-gray-400 space-y-1 list-none p-0 m-0">
              <li>PharmGKB Clinical Annotations</li>
              <li>CPIC Guidelines v3.0</li>
              <li>NCBI dbSNP Build 156</li>
              <li>ClinVar 2024 Release</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-gray-500 m-0">
            &copy; {year} PharmaGuard &mdash; RIFT 2026 HealthTech Track. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 m-0">
            Data Source: PharmGKB &bull; CPIC &bull; NCBI
          </p>
        </div>
      </div>
    </footer>
  )
}
