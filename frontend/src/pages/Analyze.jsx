import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileUpload from '../components/FileUpload.jsx'
import DrugInput from '../components/DrugInput.jsx'
import Alert from '../components/Alert.jsx'
import { API_ENDPOINTS } from '../config/api.js'

export default function Analyze() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [drugs, setDrugs] = useState([])
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  function validate() {
    const errs = []
    if (!file) errs.push('Please upload a valid VCF file before proceeding.')
    if (!drugs || drugs.length === 0) errs.push('Please enter at least one drug name.')
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    setErrors([])
    setLoading(true)

    try {
      // Create FormData for multipart file upload
      const formData = new FormData()
      formData.append('vcf_file', file)
      formData.append('drug_name', drugs[0] || '')
      formData.append('generate_explanation', false)

      console.log('Calling API:', API_ENDPOINTS.analyze)
      console.log('Drug name:', drugs[0])
      console.log('File:', file.name)

      // POST to backend API
      const response = await fetch(API_ENDPOINTS.analyze, {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        let errorMessage = 'API request failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail?.message || errorData.detail || errorData.message || errorMessage
          console.error('API Error:', errorData)
        } catch (parseError) {
          const text = await response.text()
          errorMessage = `Server error (${response.status}): ${text || response.statusText}`
          console.error('Failed to parse error response:', parseError, 'Raw:', text)
        }
        throw new Error(errorMessage)
      }

      const apiResponse = await response.json()
      console.log('API Response received:', apiResponse)

      // Navigate to results with API response
      navigate('/results', {
        state: {
          apiResponse,
          filename: file.name,
          drugs,
          submittedAt: new Date().toISOString(),
        }
      })
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setErrors([error.message || 'Failed to process analysis. Please try again.'])
      setLoading(false)
    }
  }

  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 py-8">
      {/* Page title */}
      <div className="border-b-2 border-gov-blue pb-4 mb-6">
        <h1 className="text-xl font-bold text-gov-blue m-0">
          Genomic Risk Analysis
        </h1>
        <p className="text-sm text-gov-muted mt-1 m-0">
          Submit genomic data and drug information to generate a pharmacogenomic risk report.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate aria-label="Genomic risk analysis submission form">
        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="mb-6 space-y-2" role="alert" aria-live="assertive">
            {errors.map((err, idx) => (
              <Alert key={idx} variant="error" title="Validation Error">
                {err}
              </Alert>
            ))}
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: File upload */}
          <section aria-labelledby="upload-heading">
            <div className="border border-gov-border bg-white p-5">
              <h2 id="upload-heading" className="text-sm font-bold text-gov-text uppercase tracking-wide border-b border-gov-border pb-2 mb-4 m-0">
                Step 1 &mdash; Upload Genetic Data
              </h2>
              <FileUpload onFileSelect={setFile} />

              <div className="mt-4 border border-gov-border bg-gov-bg p-3">
                <p className="text-xs font-semibold text-gov-muted uppercase tracking-wide mb-2 m-0">
                  File Requirements
                </p>
                <ul className="text-xs text-gov-text-secondary space-y-1 list-disc list-inside m-0">
                  <li>Format: VCF (Variant Call Format), version 4.1 or higher</li>
                  <li>Maximum file size: 5 MB</li>
                  <li>Must contain genotype fields (GT)</li>
                  <li>Reference genome: GRCh37/hg19 or GRCh38/hg38</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Right: Drug input */}
          <section aria-labelledby="drug-heading">
            <div className="border border-gov-border bg-white p-5">
              <h2 id="drug-heading" className="text-sm font-bold text-gov-text uppercase tracking-wide border-b border-gov-border pb-2 mb-4 m-0">
                Step 2 &mdash; Enter Drug Name(s)
              </h2>
              <DrugInput onDrugsChange={setDrugs} />

              <div className="mt-4 border border-gov-border bg-gov-bg p-3">
                <p className="text-xs font-semibold text-gov-muted uppercase tracking-wide mb-2 m-0">
                  Supported Drugs (CPIC Tier A)
                </p>
                <ul className="text-xs text-gov-text-secondary space-y-0.5 list-disc list-inside m-0 columns-2">
                  <li>Codeine</li>
                  <li>Warfarin</li>
                  <li>Clopidogrel</li>
                  <li>Simvastatin</li>
                  <li>Azathioprine</li>
                  <li>5-Fluorouracil</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Analysis parameters */}
        <section aria-labelledby="params-heading" className="mb-6">
          <div className="border border-gov-border bg-white p-5">
            <h2 id="params-heading" className="text-sm font-bold text-gov-text uppercase tracking-wide border-b border-gov-border pb-2 mb-4 m-0">
              Step 3 &mdash; Analysis Parameters (Optional)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="reference-genome" className="gov-label">
                  Reference Genome
                </label>
                <select id="reference-genome" className="gov-input" defaultValue="GRCh38">
                  <option value="GRCh37">GRCh37 / hg19</option>
                  <option value="GRCh38">GRCh38 / hg38</option>
                </select>
              </div>
              <div>
                <label htmlFor="guideline-version" className="gov-label">
                  Guideline Source
                </label>
                <select id="guideline-version" className="gov-input" defaultValue="CPIC">
                  <option value="CPIC">CPIC v3.0</option>
                  <option value="PharmGKB">PharmGKB Clinical</option>
                  <option value="DPWG">DPWG 2024</option>
                </select>
              </div>
              <div>
                <label htmlFor="patient-id" className="gov-label">
                  Patient / Sample ID
                </label>
                <input
                  id="patient-id"
                  type="text"
                  className="gov-input"
                  placeholder="e.g. SAMPLE-001"
                  aria-describedby="patient-id-hint"
                />
                <p id="patient-id-hint" className="text-xs text-gov-muted mt-1">
                  Used for report identification only.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="gov-btn-primary px-8 py-2.5 text-sm"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Processing...' : 'Generate Risk Assessment'}
          </button>
          {loading && (
            <p className="text-sm text-gov-muted" aria-live="polite">
              Analyzing genomic variants. Please wait.
            </p>
          )}
        </div>

        <p className="text-xs text-gov-muted mt-4">
          By submitting, you confirm that this data is used for research purposes only
          and complies with applicable data protection regulations.
        </p>
      </form>
    </main>
  )
}
