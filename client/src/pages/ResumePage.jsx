import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { handleUnauthorizedApiError } from '../lib/auth'
import { normalizeResumeData } from '../lib/resume'

function ResumePage() {
  const { resumeData, setResumeData } = useOutletContext()
  const inputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [responseData, setResponseData] = useState(() => normalizeResumeData(resumeData))

  useEffect(() => {
    setResponseData(normalizeResumeData(resumeData))
  }, [resumeData])

  const handleFileSelection = (file) => {
    if (!file) {
      return
    }

    const isPdfMimeType = file.type === 'application/pdf'
    const isPdfExtension = file.name.toLowerCase().endsWith('.pdf')

    if (!isPdfMimeType && !isPdfExtension) {
      setSelectedFile(null)
      setResponseData(null)
      setError('Please upload a PDF resume.')
      return
    }

    setSelectedFile(file)
    setError('')
    setResponseData(null)
  }

  const handleInputChange = (event) => {
    handleFileSelection(event.target.files?.[0] || null)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)

    handleFileSelection(event.dataTransfer.files?.[0] || null)
  }

  const handleBrowseClick = () => {
    inputRef.current?.click()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedFile) {
      setError('Choose a PDF resume before uploading.')
      return
    }

    const formData = new FormData()
    formData.append('resume', selectedFile)

    try {
      setIsUploading(true)
      setError('')
      setResponseData(null)

      const { data } = await axios.post(
        'http://localhost:5000/api/resume/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      const nextResumeData = normalizeResumeData(data.data)
      setResponseData(nextResumeData)
      setResumeData(nextResumeData)
    } catch (uploadError) {
      if (handleUnauthorizedApiError(uploadError)) {
        return
      }

      setError(
        'Upload failed. Please try again.'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const stats = responseData
    ? [
        { label: 'Skills', value: responseData.skills?.length || 0 },
        { label: 'Projects', value: responseData.projects?.length || 0 },
        { label: 'Education', value: responseData.education?.length || 0 },
      ]
    : []

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-medium text-slate-950">Resume</h2>
          <span className="text-sm text-slate-500">PDF</span>
        </div>

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleInputChange}
              />

              <button
                type="button"
                onClick={handleBrowseClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center transition ${
                  isDragging
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400'
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    isDragging
                      ? 'bg-white/10 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 16V4" />
                    <path d="m7 9 5-5 5 5" />
                    <path d="M4 16.5v.5A3 3 0 0 0 7 20h10a3 3 0 0 0 3-3v-.5" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : 'Choose file'}
                  </p>
                </div>
              </button>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {selectedFile
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                    : 'No file'}
                </p>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isUploading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {isUploading ? 'Uploading...' : responseData ? 'Replace Resume' : 'Analyze Resume'}
                </button>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
            </form>
      </section>

          {responseData && (
            <section className="space-y-4">
              <article className="rounded-xl bg-slate-950 p-4 text-white shadow-sm">
                <div className="grid gap-3 sm:grid-cols-3">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                      >
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                          {stat.label}
                        </p>
                        <p className="mt-2 text-lg font-medium text-white">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                </div>
              </article>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_280px]">
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h4 className="text-sm font-medium text-slate-950">Skills</h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {responseData.skills?.length ? (
                      responseData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No skills
                      </p>
                    )}
                  </div>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h4 className="text-sm font-medium text-slate-950">Summary</h4>
                  <p className="mt-3 text-sm text-slate-600">
                    {responseData.summary ||
                      'No summary'}
                  </p>
                </article>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h4 className="text-sm font-medium text-slate-950">Projects</h4>
                  <div className="mt-3 grid gap-2">
                    {responseData.projects?.length ? (
                      responseData.projects.map((project) => (
                        <div
                          key={project}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                        >
                          {project}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No projects
                      </p>
                    )}
                  </div>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h4 className="text-sm font-medium text-slate-950">Education</h4>
                  <div className="mt-3 grid gap-2">
                    {responseData.education?.length ? (
                      responseData.education.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No education
                      </p>
                    )}
                  </div>
                </article>
              </div>
            </section>
          )}
    </div>
  )
}

export default ResumePage
