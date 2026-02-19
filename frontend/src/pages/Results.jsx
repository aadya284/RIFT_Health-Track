import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import RiskTable from '../components/RiskTable.jsx'
import VariantTable from '../components/VariantTable.jsx'
import JSONBlock from '../components/JSONBlock.jsx'

// Demo data – in production this would come from the backend
function generateMockReport(drugs, filename, submittedAt) {
  const reportId = 'RPT-' + Math.random().toString(36).slice(2, 9).toUpperCase()
  const patientId = 'SAMPLE-' + Math.random().toString(36).slice(2, 6).toUpperCase()

  const drugMap = {
    Codeine: { riskLabel: 'Toxic', severity: 'High', confidence: '94.2%' },
    Warfarin: { riskLabel: 'Adjust Dosage', severity: 'Moderate', confidence: '88.7%' },
    Clopidogrel: { riskLabel: 'Ineffective', severity: 'Moderate', confidence: '91.3%' },
    Simvastatin: { riskLabel: 'Adjust Dosage', severity: 'Low', confidence: '85.1%' },
    Azathioprine: { riskLabel: 'Safe', severity: 'Low', confidence: '97.4%' },
    '5-Fluorouracil': { riskLabel: 'Toxic', severity: 'High', confidence: '96.0%' },
  }

  const riskRows = drugs.map(drug => ({
    drug,
    ...(drugMap[drug] || { riskLabel: 'Unknown', severity: 'Undetermined', confidence: 'N/A' })
  }))

  const variantRows = [
    { rsid: 'rs3892097', position: 'chr22:42,524,946', genotype: 'C/C', impact: 'High' },
    { rsid: 'rs4244285', position: 'chr10:96,541,616', genotype: 'A/G', impact: 'Moderate' },
    { rsid: 'rs1799853', position: 'chr10:96,702,047', genotype: 'C/T', impact: 'Moderate' },
    { rsid: 'rs4149056', position: 'chr12:21,331,549', genotype: 'T/C', impact: 'High' },
    { rsid: 'rs1800460', position: 'chr6:18,143,480', genotype: 'C/C', impact: 'Low' },
  ]

  const report = {
    reportId,
    patientId,
    generatedAt: submittedAt || new Date().toISOString(),
    inputFile: filename || 'sample.vcf',
    guidelineSource: 'CPIC v3.0',
    drugs,
    pharmacogenomicProfile: {
      primaryGene: 'CYP2D6',
      diplotype: '*1/*4',
      phenotype: 'Intermediate Metabolizer',
      metabolizerStatus: 'Reduced function',
    },
    riskAssessment: riskRows,
    detectedVariants: variantRows,
    clinicalRecommendation:
      'Based on the CYP2D6 *1/*4 diplotype, this patient is classified as an Intermediate Metabolizer. ' +
      'Codeine should be avoided due to elevated risk of opioid toxicity from partial conversion to morphine. ' +
      'For Clopidogrel, the CYP2C19 *2/*1 genotype predicts reduced antiplatelet activity; an alternative ' +
      'antiplatelet agent (e.g., ticagrelor or prasugrel) should be considered. ' +
      'Warfarin dose adjustment is recommended based on CYP2C9 *1/*2 variant; target INR monitoring is advised. ' +
      'All recommendations should be reviewed and approved by a licensed clinical pharmacist.',
    llmInterpretation: {
      summary:
        'Patient carries loss-of-function variants in CYP2D6 and CYP2C19, indicating reduced enzymatic activity ' +
        'that significantly impacts the metabolism of multiple prescribed medications.',
      mechanism:
        'CYP2D6 is responsible for converting codeine (prodrug) to its active form morphine. The *4 allele ' +
        'introduces a splice site defect (1846G>A) causing aberrant splicing and non-functional enzyme. ' +
        'CYP2C19 *2 introduces a premature stop codon (681G>A) eliminating clopidogrel bioactivation, ' +
        'resulting in reduced antiplatelet efficacy.',
      variantCitations: [
        'rs3892097 (CYP2D6*4): PMID 18612399 – Reduced function, splice defect.',
        'rs4244285 (CYP2C19*2): PMID 19430489 – Loss-of-function, stop codon.',
        'rs1799853 (CYP2C9*2): PMID 10700174 – Reduced warfarin metabolism.',
      ],
      clinicalSignificance:
        'CPIC Level A evidence supports preemptive genotyping for CYP2D6/codeine and CYP2C19/clopidogrel ' +
        'interactions. The combination of variants identified in this sample represents clinically ' +
        'actionable pharmacogenomic findings requiring prescriber notification.',
    },
  }

  return report
}

function AccordionSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gov-border">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-gov-bg text-left text-sm font-semibold text-gov-text hover:bg-gray-200 cursor-pointer border-0"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="text-gov-muted text-xs font-mono" aria-hidden="true">
          {open ? '[-]' : '[+]'}
        </span>
      </button>
      {open && (
        <div className="px-4 py-4 border-t border-gov-border bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

export default function Results() {
  const location = useLocation()
  const state = location.state || {}
  const { apiResponse, filename, drugs, submittedAt } = state

  // If we have an API response, use it; otherwise fall back to mock data
  if (apiResponse && apiResponse.pharmacogenomic_analysis) {
    const pharmaData = apiResponse.pharmacogenomic_analysis
    const reportId = 'RPT-' + Math.random().toString(36).slice(2, 9).toUpperCase()
    const patientId = 'SAMPLE-' + Math.random().toString(36).slice(2, 6).toUpperCase()

    const report = {
      reportId,
      patientId,
      generatedAt: new Date().toISOString(),
      inputFile: filename || 'sample.vcf',
      guidelineSource: 'CPIC v3.0',
      drugs: drugs || [state.drug_name],
      pharmacogenomicProfile: {
        primaryGene: pharmaData.primary_gene || 'Unknown',
        phenotype: pharmaData.phenotype || 'Unknown',
        metabolizerStatus: pharmaData.phenotype || 'Unknown',
      },
      riskAssessment: [{
        drug: state.drug_name || 'Unknown',
        riskLabel: pharmaData.risk_label,
        severity: pharmaData.severity,
        confidence: `${(pharmaData.confidence_score * 100).toFixed(1)}%`
      }],
      detectedVariants: pharmaData.detected_rsid ? [{
        rsid: pharmaData.detected_rsid,
        position: 'N/A',
        genotype: 'N/A',
        impact: 'High'
      }] : [],
      clinicalRecommendation: `Based on ${pharmaData.primary_gene} analysis, the patient phenotype is ${pharmaData.phenotype}. Risk classification: ${pharmaData.risk_label}. Confidence: ${(pharmaData.confidence_score * 100).toFixed(1)}%.`,
      llmInterpretation: {
        summary: apiResponse.clinical_explanation?.clinical_summary || 'Clinical analysis based on pharmacogenomic profile.',
        mechanism: 'See clinical summary',
        variantCitations: pharmaData.detected_rsid ? [`${pharmaData.detected_rsid}: ${pharmaData.primary_gene} variant`] : [],
        clinicalSignificance: `Evidence level based on confidence score: ${(pharmaData.confidence_score * 100).toFixed(1)}%`
      }
    }

    return (
      <main id="main-content" className="max-w-6xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="border-b-2 border-gov-blue pb-4 mb-6 flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gov-blue m-0">
              Pharmacogenomic Risk Assessment Report
            </h1>
            <p className="text-sm text-gov-muted mt-1 m-0">
              Generated by N.O.V.A v1.0.0 &bull; CPIC v3.0 &bull; PharmGKB Clinical Annotations
            </p>
          </div>
          <Link to="/analyze" className="gov-btn-secondary text-xs py-1.5 px-3 self-start">
            Run New Analysis
          </Link>
        </div>

        {/* Report header */}
        <section aria-labelledby="report-header-heading" className="mb-6">
          <div className="border border-gov-border bg-gov-bg p-0">
            <div className="bg-gov-blue text-white px-4 py-2">
              <h2 id="report-header-heading" className="text-xs font-semibold uppercase tracking-wide m-0">
                Report Header
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-gov-border">
              {[
                { label: 'Patient ID', value: report.patientId },
                { label: 'Report ID', value: report.reportId },
                { label: 'Generated', value: new Date(report.generatedAt).toISOString().replace('T', ' ').slice(0, 19) + ' UTC' },
                { label: 'Input File', value: report.inputFile },
              ].map(item => (
                <div key={item.label} className="px-4 py-3">
                  <p className="text-xs text-gov-muted uppercase tracking-wide mb-0.5 m-0 font-semibold">
                    {item.label}
                  </p>
                  <p className="text-xs font-mono text-gov-text m-0 break-all">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Risk Assessment Summary */}
        <section aria-labelledby="risk-summary-heading" className="mb-6">
          <h2 id="risk-summary-heading" className="text-sm font-bold text-gov-text uppercase tracking-wide mb-3">
            Risk Assessment Summary
          </h2>
          <RiskTable rows={report.riskAssessment} />
        </section>

        {/* Pharmacogenomic Profile */}
        <section aria-labelledby="pgx-profile-heading" className="mb-6">
          <h2 id="pgx-profile-heading" className="text-sm font-bold text-gov-text uppercase tracking-wide mb-3">
            Pharmacogenomic Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-gov-border">
            {[
              { label: 'Primary Gene', value: report.pharmacogenomicProfile.primaryGene },
              { label: 'Phenotype', value: report.pharmacogenomicProfile.phenotype },
            ].map((item, idx) => (
              <div
                key={item.label}
                className={`flex gap-4 px-4 py-3 border-b border-gov-border ${idx % 2 === 0 ? 'bg-white' : 'bg-gov-bg'}`}
              >
                <span className="text-xs text-gov-muted font-semibold w-36 flex-shrink-0">
                  {item.label}
                </span>
                <span className="text-sm text-gov-text font-mono">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {report.detectedVariants.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-bold text-gov-text uppercase tracking-wide mb-2">
                Detected Variant
              </h3>
              <VariantTable rows={report.detectedVariants} />
            </div>
          )}
        </section>

        {/* Clinical Recommendation */}
        <section aria-labelledby="recommendation-heading" className="mb-6">
          <h2 id="recommendation-heading" className="text-sm font-bold text-gov-text uppercase tracking-wide mb-3">
            Clinical Recommendation
          </h2>
          <div className="border border-gov-border bg-white p-4">
            <p className="text-sm text-gov-text-secondary leading-relaxed m-0">
              {report.clinicalRecommendation}
            </p>
            <p className="text-xs text-gov-muted mt-3 mb-0 border-t border-gov-border pt-2">
              Source: CPIC Guidelines v3.0 &bull; Confidence: {(pharmaData.confidence_score * 100).toFixed(1)}% &bull;
              Guideline Reference:{' '}
              <a
                href="https://cpicpgx.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gov-blue-mid underline"
              >
                cpicpgx.org
              </a>
            </p>
          </div>
        </section>

        {/* JSON Output */}
        <section aria-labelledby="json-heading" className="mb-6">
          <h2 id="json-heading" className="text-sm font-bold text-gov-text uppercase tracking-wide mb-3">
            Structured JSON Output
          </h2>
          <JSONBlock
            data={apiResponse}
            filename={`pharmaguard-${report.reportId}.json`}
          />
        </section>

        {/* Disclaimer */}
        <div className="border border-gov-border border-l-4 border-l-gov-warning bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-gov-warning uppercase tracking-wide mb-1 m-0">
            Research Use Only
          </p>
          <p className="text-xs text-amber-800 m-0 leading-relaxed">
            This report is generated by an automated research system and has not been
            reviewed by a licensed clinician. It must not be used as the sole basis for
            clinical decision-making. Consult a qualified healthcare professional before
            making any changes to drug therapy.
          </p>
        </div>
      </main>
    )
  }

  // Fallback to mock data if no API response
  const mockReport = generateMockReport(drugs, filename, submittedAt)

  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 py-8">
      {/* Page title */}
      <div className="border-b-2 border-gov-blue pb-4 mb-6 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-gov-blue m-0">
            Pharmacogenomic Risk Assessment Report
          </h1>
          <p className="text-sm text-gov-muted mt-1 m-0">
            Generated by PharmaGuard v1.0.0 &bull; CPIC v3.0 &bull; PharmGKB Clinical Annotations
          </p>
        </div>
        <Link
          to="/analyze"
          className="gov-btn-secondary text-xs py-1.5 px-3 self-start"
        >
          Run New Analysis
        </Link>
      </div>

      {/* Report header */}
      <section aria-labelledby="report-header-heading" className="mb-6">
        <div className="border border-gov-border bg-gov-bg p-0">
          <div className="bg-gov-blue text-white px-4 py-2">
            <h2 id="report-header-heading" className="text-xs font-semibold uppercase tracking-wide m-0">
              Report Header
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-gov-border">
            {[
              { label: 'Patient ID', value: mockReport.patientId },
              { label: 'Report ID', value: mockReport.reportId },
              { label: 'Generated', value: new Date(mockReport.generatedAt).toISOString().replace('T', ' ').slice(0, 19) + ' UTC' },
              { label: 'Input File', value: mockReport.inputFile },
            ].map(item => (
              <div key={item.label} className="px-4 py-3">
                <p className="text-xs text-gov-muted uppercase tracking-wide mb-0.5 m-0 font-semibold">
                  {item.label}
                </p>
                <p className="text-xs font-mono text-gov-text m-0 break-all">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Assessment Summary */}
      <section aria-labelledby="risk-summary-heading" className="mb-6">
        <h2 id="risk-summary-heading" className="text-sm font-bold text-gov-text uppercase tracking-wide mb-3">
          Risk Assessment Summary
        </h2>
        <RiskTable rows={mockReport.riskAssessment} />
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gov-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-green-100 border border-gov-success" aria-hidden="true" />
            Safe
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-amber-50 border border-amber-500" aria-hidden="true" />
            Adjust Dosage
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-red-50 border border-gov-danger" aria-hidden="true" />
            Toxic
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-orange-50 border border-orange-500" aria-hidden="true" />
            Ineffective
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-gray-50 border border-gov-border" aria-hidden="true" />
            Unknown
          </span>
        </div>
      </section>

      {/* Pharmacogenomic Profile */}
      <section aria-labelledby="pgx-profile-heading" className="mb-6">
        <h2 id="pgx-profile-heading" className="text-sm font-bold text-gov-text uppercase tracking-wide mb-3">
          Pharmacogenomic Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-gov-border">
          {[
            { label: 'Primary Gene', value: mockReport.pharmacogenomicProfile.primaryGene },
            { label: 'Diplotype', value: mockReport.pharmacogenomicProfile.diplotype },
            { label: 'Phenotype', value: mockReport.pharmacogenomicProfile.phenotype },
            { label: 'Metabolizer Status', value: mockReport.pharmacogenomicProfile.metabolizerStatus },
          ].map((item, idx) => (
            <div
              key={item.label}
              className={`flex gap-4 px-4 py-3 border-b border-gov-border ${idx % 2 === 0 ? 'bg-white' : 'bg-gov-bg'}`}
            >
              <span className="text-xs text-gov-muted font-semibold w-36 flex-shrink-0">
                {item.label}
              </span>
              <span className="text-sm text-gov-text font-mono">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h3 className="text-xs font-bold text-gov-text uppercase tracking-wide mb-2">
            Detected Variants
          </h3>
          <VariantTable rows={mockReport.detectedVariants} />
        </div>
      </section>

      {/* Clinical Recommendation */}
      <section aria-labelledby="recommendation-heading" className="mb-6">
        <h2 id="recommendation-heading" className="text-sm font-bold text-gov-text uppercase tracking-wide mb-3">
          Clinical Recommendation
        </h2>
        <div className="border border-gov-border bg-white p-4">
          <p className="text-sm text-gov-text-secondary leading-relaxed m-0">
            {mockReport.clinicalRecommendation}
          </p>
          <p className="text-xs text-gov-muted mt-3 mb-0 border-t border-gov-border pt-2">
            Source: CPIC Guidelines v3.0 &bull; Evidence Level: A &bull;
            Guideline Reference:{' '}
            <a
              href="https://cpicpgx.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gov-blue-mid underline"
            >
              cpicpgx.org
            </a>
          </p>
        </div>
      </section>

      {/* LLM Explanation – Accordion */}
      <section aria-labelledby="interpretation-heading" className="mb-6">
        <h2 id="interpretation-heading" className="text-sm font-bold text-gov-text uppercase tracking-wide mb-3">
          Clinical Interpretation
        </h2>
        <div className="space-y-1">
          <AccordionSection title="Summary" defaultOpen={true}>
            <p className="text-sm text-gov-text-secondary leading-relaxed m-0">
              {mockReport.llmInterpretation.summary}
            </p>
          </AccordionSection>

          <AccordionSection title="Mechanism of Action">
            <p className="text-sm text-gov-text-secondary leading-relaxed m-0">
              {mockReport.llmInterpretation.mechanism}
            </p>
          </AccordionSection>

          <AccordionSection title="Variant Citations">
            <ul className="list-none p-0 m-0 space-y-2">
              {mockReport.llmInterpretation.variantCitations.map((cite, idx) => (
                <li key={idx} className="text-xs text-gov-text-secondary font-mono bg-gov-bg border border-gov-border px-3 py-2">
                  {cite}
                </li>
              ))}
            </ul>
          </AccordionSection>

          <AccordionSection title="Clinical Significance">
            <p className="text-sm text-gov-text-secondary leading-relaxed m-0">
              {mockReport.llmInterpretation.clinicalSignificance}
            </p>
          </AccordionSection>
        </div>
      </section>

      {/* JSON Output */}
      <section aria-labelledby="json-heading" className="mb-6">
        <h2 id="json-heading" className="text-sm font-bold text-gov-text uppercase tracking-wide mb-3">
          Structured JSON Output
        </h2>
        <JSONBlock
          data={mockReport}
          filename={`pharmaguard-${mockReport.reportId}.json`}
        />
      </section>

      {/* Print / disclaimer */}
      <div className="border border-gov-border border-l-4 border-l-gov-warning bg-amber-50 px-4 py-3">
        <p className="text-xs font-semibold text-gov-warning uppercase tracking-wide mb-1 m-0">
          Research Use Only
        </p>
        <p className="text-xs text-amber-800 m-0 leading-relaxed">
          This report is generated by an automated research system and has not been
          reviewed by a licensed clinician. It must not be used as the sole basis for
          clinical decision-making. Consult a qualified healthcare professional before
          making any changes to drug therapy.
        </p>
      </div>
    </main>
  )
}
