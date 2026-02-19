import { Link } from 'react-router-dom'

const STATS = [
  { value: '6',     label: 'Pharmacogenes',        desc: 'CPIC Tier A/B covered' },
  { value: '14+',   label: 'Drug Interactions',    desc: 'Clinically validated' },
  { value: '130+',  label: 'CYP2D6 Alleles',       desc: 'Star allele definitions' },
  { value: 'CPIC',  label: 'Guideline Source',      desc: 'v3.0 / PharmGKB Clinical' },
]

const SUPPORTED_GENES = [
  { name: 'CYP2D6',   full: 'Cytochrome P450 2D6',                    tier: 'Tier A', note: 'Metabolizes ~25% of clinical drugs including codeine, antidepressants, antipsychotics.' },
  { name: 'CYP2C19',  full: 'Cytochrome P450 2C19',                   tier: 'Tier A', note: 'Key enzyme for clopidogrel bioactivation and proton pump inhibitor metabolism.' },
  { name: 'CYP2C9',   full: 'Cytochrome P450 2C9',                    tier: 'Tier A', note: 'Primary metabolizer for warfarin, phenytoin, and NSAID class drugs.' },
  { name: 'SLCO1B1',  full: 'Solute Carrier Organic Anion Transporter',tier: 'Tier A', note: 'Governs hepatic statin uptake; variants markedly increase myopathy risk.' },
  { name: 'TPMT',     full: 'Thiopurine S-Methyltransferase',          tier: 'Tier A', note: 'Inactivates thiopurine drugs; deficiency causes severe myelosuppression.' },
  { name: 'DPYD',     full: 'Dihydropyrimidine Dehydrogenase',         tier: 'Tier A', note: 'Catabolizes fluoropyrimidines; deficiency causes life-threatening toxicity.' },
]

const SUPPORTED_DRUGS = [
  { name: 'Codeine',       gene: 'CYP2D6',        class: 'Opioid Analgesic' },
  { name: 'Warfarin',      gene: 'CYP2C9/VKORC1', class: 'Anticoagulant' },
  { name: 'Clopidogrel',   gene: 'CYP2C19',       class: 'Antiplatelet' },
  { name: 'Simvastatin',   gene: 'SLCO1B1',        class: 'Statin' },
  { name: 'Azathioprine',  gene: 'TPMT',           class: 'Immunosuppressant' },
  { name: 'Fluorouracil',  gene: 'DPYD',           class: 'Chemotherapy' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Upload VCF File',
    desc: 'Provide a Variant Call Format (.vcf) file containing the patient\'s genotyping data. Files must be VCF 4.1+ and not exceed 5 MB.',
    detail: 'Supported: GRCh37/hg19, GRCh38/hg38',
  },
  {
    step: '02',
    title: 'Enter Drug Name(s)',
    desc: 'Input one or more drug names using free text (comma-separated) or select from the supported drug dropdown.',
    detail: 'Validated against CPIC drug-gene interaction database',
  },
  {
    step: '03',
    title: 'Review Structured Risk Report',
    desc: 'The system identifies relevant pharmacogenomic variants, cross-references CPIC/PharmGKB guidelines, and generates an evidence-based risk report.',
    detail: 'Report includes JSON export and clinical interpretation',
  },
]

export default function Home() {
  return (
    <main id="main-content" className="bg-[#f3f4f6] min-h-screen">

      {/* Page hero bar */}
      <div className="bg-white border-b border-gov-border">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gov-blue tracking-tight mb-1">
                Pharmacogenomic Risk Prediction System
              </h1>
              <p className="text-sm text-gov-muted">
                Reference: CPIC Guidelines v3.0 &bull; PharmGKB Clinical Annotations &bull; NCBI ClinVar 2024 &bull; PharmVar 6.1.2
              </p>
            </div>
            <Link
              to="/analyze"
              className="gov-btn-primary no-underline hover:no-underline flex items-center gap-2"
              aria-label="Begin genomic risk analysis"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              Begin Analysis
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="region" aria-label="System statistics">
          {STATS.map(s => (
            <div key={s.label} className="stat-card">
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-desc">{s.desc}</span>
            </div>
          ))}
        </div>

        {/* Section 1: System Overview */}}
        <section className="bg-white border border-gov-border" aria-labelledby="overview-heading">
          <div className="border-b border-gov-border px-5 py-3 bg-[#f8f9fa] flex items-center gap-2">
            <span className="w-1 h-4 bg-gov-blue flex-shrink-0 inline-block" aria-hidden="true" />
            <h2 id="overview-heading" className="text-sm font-bold text-gov-text uppercase tracking-wider m-0">
              1. System Overview
            </h2>
          </div>
          <div className="p-5">
            <div className="max-w-3xl text-sm text-gov-text-secondary leading-relaxed space-y-3">
              <p>
                N.O.V.A predicts how individuals respond to medications based on genetic variants. The system analyzes pharmacogenes and cross-references clinical guidelines to provide personalized drug risk assessments.
              </p>
              <p>
                Upload your VCF genomic data, enter drug names, and receive evidence-based risk classifications with actionable recommendations for safe medication use.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Supported Pharmacogenes */}
        <section className="bg-white border border-gov-border" aria-labelledby="genes-heading">
          <div className="border-b border-gov-border px-5 py-3 bg-[#f8f9fa] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-gov-blue flex-shrink-0 inline-block" aria-hidden="true" />
              <h2 id="genes-heading" className="text-sm font-bold text-gov-text uppercase tracking-wider m-0">
                2. Supported Pharmacogenes
              </h2>
            </div>
            <span className="badge badge-blue">CPIC Tier A</span>
          </div>
          <div className="p-5 pb-2">
            <p className="text-sm text-gov-muted mb-4">
              Coverage based on CPIC Tier A and Tier B drug-gene pairs, sourced from PharmVar v6.1.2 and CPIC gene-specific guidelines.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="gov-table" aria-label="Supported pharmacogenes">
              <thead>
                <tr>
                  <th className="w-28">Gene</th>
                  <th className="w-56">Full Name</th>
                  <th className="w-20">CPIC Tier</th>
                  <th>Clinical Significance</th>
                </tr>
              </thead>
              <tbody>
                {SUPPORTED_GENES.map(gene => (
                  <tr key={gene.name}>
                    <td>
                      <span className="font-bold font-mono text-gov-blue-mid text-sm">{gene.name}</span>
                    </td>
                    <td className="text-xs text-gov-text-secondary italic">{gene.full}</td>
                    <td>
                      <span className="badge badge-blue text-[10px]">{gene.tier}</span>
                    </td>
                    <td className="text-xs text-gov-text-secondary">{gene.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Supported Drugs */}
        <section className="bg-white border border-gov-border" aria-labelledby="drugs-heading">
          <div className="border-b border-gov-border px-5 py-3 bg-[#f8f9fa] flex items-center gap-2">
            <span className="w-1 h-4 bg-gov-blue flex-shrink-0 inline-block" aria-hidden="true" />
            <h2 id="drugs-heading" className="text-sm font-bold text-gov-text uppercase tracking-wider m-0">
              3. Supported Drug–Gene Interactions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="gov-table" aria-label="Supported drugs and associated pharmacogenes">
              <thead>
                <tr>
                  <th>Drug Name</th>
                  <th>Drug Class</th>
                  <th>Associated Gene(s)</th>
                </tr>
              </thead>
              <tbody>
                {SUPPORTED_DRUGS.map(drug => (
                  <tr key={drug.name}>
                    <td className="font-semibold text-gov-text">{drug.name}</td>
                    <td className="text-xs text-gov-muted">{drug.class}</td>
                    <td>
                      <span className="font-mono text-xs text-gov-blue-mid font-semibold">{drug.gene}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: How It Works */}
        <section className="bg-white border border-gov-border" aria-labelledby="howitworks-heading">
          <div className="border-b border-gov-border px-5 py-3 bg-[#f8f9fa] flex items-center gap-2">
            <span className="w-1 h-4 bg-gov-blue flex-shrink-0 inline-block" aria-hidden="true" />
            <h2 id="howitworks-heading" className="text-sm font-bold text-gov-text uppercase tracking-wider m-0">
              4. Analysis Workflow
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-gov-muted mb-5">
              The analysis pipeline processes genomic input through standardized pharmacogenomic interpretation frameworks to produce a clinical-grade report.
            </p>
            <div className="space-y-0 border border-gov-border">
              {HOW_IT_WORKS.map((item, idx) => (
                <div
                  key={item.step}
                  className={`flex gap-5 p-5 ${idx < HOW_IT_WORKS.length - 1 ? 'border-b border-gov-border' : ''}`}
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 bg-gov-blue text-white flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-xs font-bold font-mono">{item.step}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gov-text mb-1">{item.title}</h3>
                    <p className="text-sm text-gov-text-secondary leading-relaxed mb-1.5">{item.desc}</p>
                    <p className="text-xs text-gov-muted font-medium border-l-2 border-gov-blue-mid pl-2">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Link
                to="/analyze"
                className="gov-btn-primary no-underline hover:no-underline"
                aria-label="Proceed to the genomic analysis tool"
              >
                Proceed to Analysis
              </Link>
              <Link
                to="/documentation"
                className="gov-btn-secondary no-underline hover:no-underline"
                aria-label="Read technical documentation"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
