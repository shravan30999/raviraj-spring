'use client'
import { useState, useEffect } from 'react'
import PublicNavbar from '@/components/PublicNavbar'

export default function CommitteePage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/committee')
        if (res.ok) {
          const data = await res.json()
          setMembers(data.members || [])
        }
      } catch (e) {}
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Managing Committee</h1>
        <p className="text-gray-500 mb-8">Current committee members of Raviraj Spring Housing Society.</p>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : members.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-400">Committee member details will be added soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map(m => (
              <div key={m.id} className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-lg">{m.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{m.name}</h3>
                    <p className="text-sm text-primary font-medium">{m.designation}</p>
                  </div>
                </div>
                <div className="mt-3 pl-16 space-y-1">
                  {m.flat_number && (
                    <p className="text-sm text-gray-500">Flat: {m.flat_number}</p>
                  )}
                  {m.phone && (
                    <p className="text-sm text-gray-500">
                      <a href={`tel:${m.phone}`} className="hover:text-primary">{m.phone}</a>
                    </p>
                  )}
                  {m.email && (
                    <p className="text-sm text-gray-500">
                      <a href={`mailto:${m.email}`} className="hover:text-primary">{m.email}</a>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
