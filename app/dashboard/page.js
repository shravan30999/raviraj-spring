'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import NoticeCard from '@/components/NoticeCard'

export default function Dashboard() {
  const [member, setMember] = useState(null)
  const [notices, setNotices] = useState([])
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      // Check auth
      const authRes = await fetch('/api/auth/me')
      if (!authRes.ok) {
        router.push('/login')
        return
      }
      const authData = await authRes.json()
      setMember(authData.member)

      // If admin, redirect to admin panel
      if (authData.member.is_admin) {
        router.push('/admin')
        return
      }

      // Fetch notices
      await fetchNotices('general')
    }
    load()
  }, [router])

  async function fetchNotices(type) {
    setActiveTab(type)
    setLoading(true)
    const res = await fetch(`/api/notices?type=${type}`)
    if (res.ok) {
      const data = await res.json()
      setNotices(data.notices || [])
    }
    setLoading(false)
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar member={member} />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, {member.owner_name}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Flat {member.flat_number}</p>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => fetchNotices('general')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'general'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            General Notices
          </button>
          <button
            onClick={() => fetchNotices('agm')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'agm'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            AGM Notices
          </button>
        </div>

        {/* Notices list */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400">No {activeTab === 'agm' ? 'AGM' : 'general'} notices yet</p>
          </div>
        ) : (
          <div>
            {notices.map(notice => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
