'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import PublicNavbar from '@/components/PublicNavbar'

export default function Home() {
  const [notices, setNotices] = useState([])

  useEffect(() => {
    async function loadNotices() {
      try {
        const res = await fetch('/api/notices/recent')
        if (res.ok) {
          const data = await res.json()
          setNotices(data.notices || [])
        }
      } catch (e) {}
    }
    loadNotices()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Logo + Welcome */}
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <img src="/logo.png" alt="Raviraj Spring" className="h-24 md:h-32 mx-auto mb-4" />
          <p className="text-lg md:text-xl text-gray-600">
            Housing Society Portal
          </p>
        </div>
      </section>

      {/* Building Images — prominent */}
      <section className="bg-gray-50 py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img src="/gate.jpg" alt="Raviraj Spring Entrance" className="rounded-xl shadow-sm w-full h-72 md:h-80 object-cover" />
            <img src="/building.jpg" alt="Raviraj Spring Building" className="rounded-xl shadow-sm w-full h-72 md:h-80 object-cover" />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/guidelines" className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">General Guidelines</h3>
              <p className="text-sm text-gray-500">Society rules, bylaws, and general information for all residents</p>
            </Link>

            <Link href="/forms" className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Standard Forms</h3>
              <p className="text-sm text-gray-500">Download application forms, NOC formats, and other standard documents</p>
            </Link>

            <Link href="/committee" className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Managing Committee</h3>
              <p className="text-sm text-gray-500">View details of current managing committee members</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Notices Ticker */}
      {notices.length > 0 && (
        <section className="py-10 md:py-14 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Notices</h2>
            <div className="space-y-3">
              {notices.map(notice => (
                <div key={notice.id} className="bg-white rounded-lg border p-4 flex items-start gap-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap mt-0.5 ${
                    notice.notice_type === 'agm' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {notice.notice_type === 'agm' ? 'AGM' : 'General'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">{notice.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <Link href="/login" className="text-primary text-sm font-medium whitespace-nowrap hover:underline">
                    Login to view
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-primary text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img src="/logo.png" alt="Raviraj Spring" className="h-14 mb-3 brightness-0 invert" />
              <p className="text-blue-200 text-sm leading-relaxed">
                Housing Society Portal for residents of Raviraj Spring, Mira Road East.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm text-blue-200">
                <Link href="/guidelines" className="block hover:text-white transition-colors">General Guidelines</Link>
                <Link href="/forms" className="block hover:text-white transition-colors">Standard Forms</Link>
                <Link href="/committee" className="block hover:text-white transition-colors">Managing Committee</Link>
                <Link href="/login" className="block hover:text-white transition-colors">Member Login</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Address</h4>
              <p className="text-blue-200 text-sm leading-relaxed">
                Raviraj Spring,<br />
                Poonam Garden Road,<br />
                Next to Tamil Church,<br />
                Mira Road East, Thane — 401107
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-6 text-center text-blue-200 text-xs">
            &copy; {new Date().getFullYear()} Raviraj Spring Housing Society. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
