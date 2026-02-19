const TEAM_MEMBERS = [
  { name: 'Research Lead', role: 'Pharmacogenomics & Clinical Data' },
  { name: 'ML Engineer', role: 'Risk Prediction Model Development' },
  { name: 'Backend Developer', role: 'VCF Parsing & API Layer' },
  { name: 'Frontend Developer', role: 'Portal UI & Accessibility' },
]

const REFERENCES = [
  {
    id: 1,
    citation: 'Relling MV, Klein TE. CPIC: Clinical Pharmacogenetics Implementation Consortium of the Pharmacogenomics Research Network. Clin Pharmacol Ther. 2011;89(3):464-467.',
    link: 'https://cpicpgx.org'
  },
  {
    id: 2,
    citation: 'Whirl-Carrillo M, et al. Pharmacogenomics Knowledge for Personalized Medicine. Clin Pharmacol Ther. 2012;92(4):414-417.',
    link: 'https://www.pharmgkb.org'
  },
  {
    id: 3,
    citation: 'Landrum MJ, et al. ClinVar: improving access to variant interpretations and supporting evidence. Nucleic Acids Res. 2018;46(D1):D1062-D1067.',
    link: 'https://www.ncbi.nlm.nih.gov/clinvar/'
  },
  {
    id: 4,
    citation: 'Swen JJ, et al. Pharmacogenetics: from bench to byte—an update of guidelines. Clin Pharmacol Ther. 2011;89(5):662-673.',
    link: 'https://www.pharmgkb.org/page/dpwg'
  },
]

const TECHNICAL_SPECS = [
  { label: 'Framework', value: 'React 18 + Vite' },
  { label: 'Styling', value: 'Tailwind CSS v3' },
  { label: 'Routing', value: 'React Router v6' },
  { label: 'VCF Parser', value: 'Custom – VCF 4.1/4.2/4.3' },
  { label: 'Guideline DB', value: 'CPIC v3.0, PharmGKB Clinical Annotations' },
  { label: 'Reference Genome', value: 'GRCh37/hg19, GRCh38/hg38' },
  { label: 'Accessibility', value: 'WCAG 2.1 AA (target)' },
  { label: 'License', value: 'MIT (Research Use Only)' },
]

export default function About() {
  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 py-8">
      {/* Page title */}
      <div className="border-b-2 border-gov-blue pb-4 mb-6">
        <h1 className="text-xl font-bold text-gov-blue m-0">
          About PharmaGuard
        </h1>
        <p className="text-sm text-gov-muted mt-1 m-0">
          Project overview, technical specifications, and regulatory disclaimers.
        </p>
      </div>

      {/* Project Background */}
      <section aria-labelledby="background-heading" className="gov-section">
        <h2 id="background-heading" className="text-base font-bold text-gov-text mb-3">
          Project Background
        </h2>
        <div className="max-w-3xl text-sm text-gov-text-secondary leading-relaxed space-y-3">
          <p>
            PharmaGuard was developed for the RIFT 2026 Hackathon, HealthTech Track,
            as a proof-of-concept pharmacogenomic risk assessment platform. The project
            addresses the clinical challenge of predicting adverse drug reactions based
            on individual genetic profiles.
          </p>
          <p>
            Pharmacogenomics – the study of how genes affect a person's response to drugs –
            has emerged as a cornerstone of precision medicine. Despite the availability of
            clinical implementation guidelines from CPIC and PharmGKB, pharmacogenomic
            testing remains underutilized in routine clinical practice, partly due to the
            complexity of interpreting genomic data in the context of specific drug regimens.
          </p>
          <p>
            PharmaGuard provides a structured, guideline-adherent interface that accepts
            standard VCF genomic data, identifies pharmacogenomically relevant variants,
            and translates them into actionable clinical recommendations using established
            evidence-based frameworks.
          </p>
        </div>
      </section>

      {/* Technical Specifications */}
      <section aria-labelledby="tech-heading" className="gov-section">
        <h2 id="tech-heading" className="text-base font-bold text-gov-text mb-3">
          Technical Specifications
        </h2>
        <div className="border border-gov-border max-w-xl">
          {TECHNICAL_SPECS.map((spec, idx) => (
            <div
              key={spec.label}
              className={`flex gap-0 ${idx < TECHNICAL_SPECS.length - 1 ? 'border-b border-gov-border' : ''}`}
            >
              <div className={`w-40 px-4 py-2.5 text-xs font-semibold text-gov-muted ${idx % 2 === 0 ? 'bg-gov-bg' : 'bg-white'} border-r border-gov-border flex-shrink-0`}>
                {spec.label}
              </div>
              <div className={`px-4 py-2.5 text-xs text-gov-text font-mono ${idx % 2 === 0 ? 'bg-gov-bg' : 'bg-white'}`}>
                {spec.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology */}
      <section aria-labelledby="methodology-heading" className="gov-section">
        <h2 id="methodology-heading" className="text-base font-bold text-gov-text mb-3">
          Methodology
        </h2>
        <div className="max-w-3xl text-sm text-gov-text-secondary leading-relaxed space-y-3">
          <p>
            The analysis pipeline consists of three principal stages:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>
              <strong className="text-gov-text">VCF Parsing and Variant Extraction:</strong>{' '}
              Input VCF files are parsed according to the VCF 4.x specification. Variants
              are extracted and normalized against the reference genome to produce a
              canonical set of allele observations.
            </li>
            <li>
              <strong className="text-gov-text">Star Allele Assignment and Diplotyping:</strong>{' '}
              Identified variants are matched against curated star allele definitions from
              PharmVar and PharmGKB to assign haplotypes. Diplotype calling follows
              CPIC recommendations for each gene.
            </li>
            <li>
              <strong className="text-gov-text">Risk Classification and Recommendation Generation:</strong>{' '}
              Diplotypes are translated to phenotypes (e.g., Poor Metabolizer, Normal
              Metabolizer) using CPIC activity score tables. Drug-specific recommendations
              are retrieved from CPIC guidelines and presented in structured format.
            </li>
          </ol>
        </div>
      </section>

      {/* Team */}
      <section aria-labelledby="team-heading" className="gov-section">
        <h2 id="team-heading" className="text-base font-bold text-gov-text mb-3">
          Development Team
        </h2>
        <p className="text-sm text-gov-muted mb-4 max-w-2xl">
          RIFT 2026 Hackathon &mdash; HealthTech Track Submission
        </p>
        <div className="border border-gov-border max-w-lg">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={member.name}
              className={`flex gap-4 px-4 py-3 ${idx < TEAM_MEMBERS.length - 1 ? 'border-b border-gov-border' : ''} ${idx % 2 === 0 ? 'bg-white' : 'bg-gov-bg'}`}
            >
              <div className="text-sm font-semibold text-gov-text w-40 flex-shrink-0">
                {member.name}
              </div>
              <div className="text-sm text-gov-text-secondary">
                {member.role}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* References */}
      <section aria-labelledby="references-heading" className="gov-section">
        <h2 id="references-heading" className="text-base font-bold text-gov-text mb-3">
          References and Data Sources
        </h2>
        <ol className="list-none p-0 m-0 space-y-3">
          {REFERENCES.map(ref => (
            <li key={ref.id} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 w-6 text-gov-muted font-mono text-xs pt-0.5">
                [{ref.id}]
              </span>
              <span className="text-gov-text-secondary leading-relaxed">
                {ref.citation}{' '}
                <a
                  href={ref.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gov-blue-mid underline text-xs"
                >
                  {ref.link}
                </a>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Legal / Disclaimer */}
      <section aria-labelledby="disclaimer-heading" className="mt-4">
        <div className="border border-gov-border border-l-4 border-l-gov-danger bg-red-50 px-4 py-4">
          <h2 id="disclaimer-heading" className="text-xs font-bold text-gov-danger uppercase tracking-wide mb-2 m-0">
            Legal Disclaimer and Limitations
          </h2>
          <ul className="text-xs text-red-800 space-y-1.5 list-disc list-inside m-0">
            <li>
              PharmaGuard is a research prototype and has not received regulatory approval
              from the FDA, EMA, CDSCO, or any other medical device regulatory authority.
            </li>
            <li>
              Outputs generated by this system are based on publicly available clinical
              annotations and do not constitute medical advice.
            </li>
            <li>
              The system has not been validated in a clinical environment. Reported
              confidence scores are algorithmic estimates and should not be interpreted
              as clinical probability measures.
            </li>
            <li>
              Users are responsible for ensuring compliance with applicable data
              protection laws (HIPAA, GDPR, DPDPA) when uploading genomic data.
            </li>
            <li>
              The developers assume no liability for clinical outcomes resulting from
              reliance on PharmaGuard outputs.
            </li>
          </ul>
        </div>
      </section>
    </main>
  )
}
