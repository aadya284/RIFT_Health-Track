const DOC_SECTIONS = [
  {
    id: 'vcf-format',
    title: '1. VCF File Format Requirements',
    content: `N.O.V.A accepts Variant Call Format (VCF) files conforming to specifications 4.1, 4.2, or 4.3 as defined by the Global Alliance for Genomics and Health (GA4GH).

Required fields:
  - CHROM: Chromosome identifier (e.g., chr22 or 22)
  - POS: 1-based position on the reference genome
  - ID: Variant identifier (RS ID from dbSNP preferred)
  - REF: Reference allele
  - ALT: Alternate allele(s)
  - FORMAT: Must include GT (genotype) field
  - SAMPLE: Genotype data for at least one sample

Supported reference genomes: GRCh37/hg19, GRCh38/hg38

Files must not exceed 5 MB. Multi-sample VCF files are supported; only the first sample column will be analyzed.`,
  },
  {
    id: 'gene-coverage',
    title: '2. Gene Coverage and Star Allele Definitions',
    content: `Star allele definitions are sourced from PharmVar (Pharmacogene Variation Consortium) version 6.1.2 and CPIC Tier A/B gene lists.

Genes with full star allele coverage:
  - CYP2D6: 130+ named alleles including *1, *2, *3, *4, *5, *6, *10, *17, *41
  - CYP2C19: *1 through *17 including *2, *3 (loss-of-function), *17 (gain-of-function)
  - CYP2C9: *1 through *61 including *2, *3 (reduced function)
  - SLCO1B1: *1a, *1b, *5, *15, *17 with transport activity scores
  - TPMT: *1 through *40 with activity scores
  - DPYD: Key variants including c.1905+1G>A, c.2846A>T, c.1679T>G, c.1129-5923C>G`,
  },
  {
    id: 'risk-classification',
    title: '3. Risk Classification Schema',
    content: `Risk labels are assigned based on CPIC recommendation categories mapped to N.O.V.A classification tiers:

  Safe – No clinically significant pharmacogenomic interaction detected. Standard prescribing applies.
  Adjust Dosage – Variant(s) detected that require dose modification per CPIC guidelines.
  Toxic – High risk of adverse drug reaction due to impaired metabolism or sensitivity. Drug contraindicated or requires specialist oversight.
  Ineffective – Drug unlikely to achieve therapeutic effect due to impaired activation (e.g., prodrug metabolism failure).
  Unknown – Insufficient variant data to make a classification. Manual review recommended.

Confidence scores reflect allele call completeness, variant phasing quality, and guideline evidence level.`,
  },
  {
    id: 'limitations',
    title: '4. Limitations and Caveats',
    content: `Users should be aware of the following technical limitations:

  - Structural variants (copy number variations, gene duplications/deletions) require specialized callers not included in standard VCF pipelines.
  - CYP2D6 copy number variation (*5 deletion, *13 duplication) may not be accurately inferred from short-read sequencing VCFs without specific CNV caller output.
  - Phasing information (haplotype phase) may not be available in all VCF files; unphased diplotypes receive reduced confidence scores.
  - Drug-drug interactions are not evaluated. Polypharmacy effects require additional clinical assessment.
  - Rare variants (<1% allele frequency) with no CPIC annotation will be classified as Unknown.`,
  },
]

export default function Documentation() {
  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 py-8">
      <div className="border-b-2 border-gov-blue pb-4 mb-6">
        <h1 className="text-xl font-bold text-gov-blue m-0">
          Technical Documentation
        </h1>
        <p className="text-sm text-gov-muted mt-1 m-0">
          N.O.V.A v1.0.0 &bull; Last updated: February 2026
        </p>
      </div>

      {/* TOC */}
      <nav aria-label="Documentation table of contents" className="mb-8">
        <div className="border border-gov-border bg-gov-bg p-4 inline-block">
          <p className="text-xs font-bold text-gov-text uppercase tracking-wide mb-2 m-0">
            Contents
          </p>
          <ol className="list-none p-0 m-0 space-y-1">
            {DOC_SECTIONS.map(sec => (
              <li key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  className="text-sm text-gov-blue-mid underline"
                >
                  {sec.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {DOC_SECTIONS.map(sec => (
        <section
          key={sec.id}
          id={sec.id}
          aria-labelledby={`${sec.id}-heading`}
          className="gov-section"
        >
          <h2 id={`${sec.id}-heading`} className="text-base font-bold text-gov-text mb-3">
            {sec.title}
          </h2>
          <pre className="text-sm text-gov-text-secondary leading-relaxed whitespace-pre-wrap font-sans max-w-3xl">
            {sec.content}
          </pre>
        </section>
      ))}
    </main>
  )
}
