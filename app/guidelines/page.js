'use client'
import { useState, useEffect } from 'react'
import PublicNavbar from '@/components/PublicNavbar'

export default function GuidelinesPage() {
  const [guidelines, setGuidelines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/guidelines')
        if (res.ok) {
          const data = await res.json()
          setGuidelines(data.guidelines || [])
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">General Guidelines</h1>
        <p className="text-gray-500 mb-8">Society rules, bylaws, and general information for all residents.</p>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : guidelines.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400">No guidelines documents uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {guidelines.map(doc => {
              const icon = getFileIcon(doc.file_type)
              return (
                <div key={doc.id} className="bg-white rounded-xl border shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className={`w-12 h-12 ${icon.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-xs font-bold ${icon.text}`}>{icon.label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                    {doc.description && <p className="text-sm text-gray-500 mt-0.5">{doc.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{doc.file_name}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                      className="text-primary text-sm font-medium hover:underline">
                      View
                    </a>
                    <a href={doc.file_url} download={doc.file_name}
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
