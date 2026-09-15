'use client'
import { useState, useEffect } from 'react'
import PublicNavbar from '@/components/PublicNavbar'

export default function FormsPage() {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/forms')
        if (res.ok) {
          const data = await res.json()
          setForms(data.forms || [])
        }
      } catch (e) {}
      setLoading(false)
    }
    load()
  }, [])

  function getFileIcon(type) {
    if (type?.includes('pdf')) return { bg: 'bg-red-100', text: 'text-red-600', label: 'PDF' }
    if (type?.includes('image')) return { bg: 'bg-green-100', text: 'text-green-600', label: 'IMG' }
    if (type?.includes('word') || type?.includes('doc')) return { bg: 'bg-blue-100', text: 'text-blue-600', label: 'DOC' }
    return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'FILE' }
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Standard Forms</h1>
        <p className="text-gray-500 mb-8">Download application forms, NOC formats, and other standard documents.</p>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : forms.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400">No standard forms uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {forms.map(form => {
              const icon = getFileIcon(form.file_type)
              return (
                <div key={form.id} className="bg-white rounded-xl border shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className={`w-12 h-12 ${icon.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-xs font-bold ${icon.text}`}>{icon.label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{form.title}</h3>
                    {form.description && <p className="text-sm text-gray-500 mt-0.5">{form.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{form.file_name}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a href={form.file_url} target="_blank" rel="noopener noreferrer"
                      className="text-primary text-sm font-medium hover:underline">
                      View
                    </a>
                    <a href={form.file_url} download={form.file_name}
                      className="text-gray-400 hover:text-gray-600 text-sm font-medium">
                      Download
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
