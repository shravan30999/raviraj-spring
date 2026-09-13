'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import NoticeCard from '@/components/NoticeCard'

export default function AdminPanel() {
  const [member, setMember] = useState(null)
  const [notices, setNotices] = useState([])
  const [activeTab, setActiveTab] = useState('create')
  const [loading, setLoading] = useState(true)

  // Create notice form
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [noticeType, setNoticeType] = useState('general')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')

  // Members management
  const [members, setMembers] = useState([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({ flat_number: '', owner_name: '', email: '', phone: '', password: '' })

  const router = useRouter()

  useEffect(() => {
    async function load() {
      const authRes = await fetch('/api/auth/me')
      if (!authRes.ok) {
        router.push('/login')
        return
      }
      const authData = await authRes.json()
      if (!authData.member.is_admin) {
        router.push('/dashboard')
        return
      }
      setMember(authData.member)
      setLoading(false)
    }
    load()
  }, [router])

  async function fetchNotices() {
    const res = await fetch('/api/notices')
    if (res.ok) {
      const data = await res.json()
      setNotices(data.notices || [])
    }
  }

  async function fetchMembers() {
    const res = await fetch('/api/members')
    if (res.ok) {
      const data = await res.json()
      setMembers(data.members || [])
    }
  }

  useEffect(() => {
    if (activeTab === 'notices') fetchNotices()
    if (activeTab === 'members') fetchMembers()
  }, [activeTab])

  async function handleCreateNotice(e) {
    e.preventDefault()
    setCreating(true)
    setMessage('')

    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, notice_type: noticeType }),
      })

      if (!res.ok) {
        setMessage('Failed to create notice')
        setCreating(false)
        return
      }

      const data = await res.json()

      // Send email notification for general notices
      if (noticeType === 'general') {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            noticeId: data.notice.id,
            title,
            content,
          }),
        })
      }

      setMessage('Notice created successfully!')
      setTitle('')
      setContent('')
      setCreating(false)
    } catch (err) {
      setMessage('Something went wrong')
      setCreating(false)
    }
  }

  async function handleDeleteNotice(id) {
    if (!confirm('Delete this notice?')) return
    await fetch(`/api/notices/${id}`, { method: 'DELETE' })
    fetchNotices()
  }

  async function handleAddMember(e) {
    e.preventDefault()
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMember),
    })

    if (res.ok) {
      setNewMember({ flat_number: '', owner_name: '', email: '', phone: '', password: '' })
      setShowAddMember(false)
      fetchMembers()
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to add member')
    }
  }

  async function handleDeleteMember(id) {
    if (!confirm('Remove this member?')) return
    await fetch(`/api/members/${id}`, { method: 'DELETE' })
    fetchMembers()
  }

  function getWhatsAppLink() {
    const text = `*${title}*\n\nRaviraj Spring Society Notice\n\n${content}\n\n— Society Admin`
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }

  if (loading || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar member={member} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-6 border-b pb-3">
          {['create', 'notices', 'members'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'create' ? 'Create Notice' : tab === 'notices' ? 'All Notices' : 'Members'}
            </button>
          ))}
        </div>

        {/* CREATE NOTICE TAB */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">New Notice</h3>

            <form onSubmit={handleCreateNotice}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Notice Type</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="general"
                      checked={noticeType === 'general'}
                      onChange={() => setNoticeType('general')}
                      className="text-primary"
                    />
                    <span className="text-sm">General Notice</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="agm"
                      checked={noticeType === 'agm'}
                      onChange={() => setNoticeType('agm')}
                      className="text-primary"
                    />
                    <span className="text-sm">AGM Notice</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Notice heading"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Content</label>
                <textarea
                  className="input-field min-h-[200px]"
                  placeholder="Write the notice content here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                />
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                <button type="submit" disabled={creating} className="btn-primary disabled:opacity-50">
                  {creating ? 'Publishing...' : 'Publish Notice'}
                </button>

                {title && content && (
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-600 transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Share to WhatsApp
                  </a>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ALL NOTICES TAB */}
        {activeTab === 'notices' && (
          <div>
            {notices.length === 0 ? (
              <p className="text-center py-12 text-gray-400">No notices yet</p>
            ) : (
              notices.map(notice => (
                <div key={notice.id} className="relative">
                  <NoticeCard notice={notice} />
                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">{members.length} members</p>
              <button onClick={() => setShowAddMember(!showAddMember)} className="btn-primary text-sm">
                + Add Member
              </button>
            </div>

            {showAddMember && (
              <div className="bg-white rounded-xl shadow-sm border p-5 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">Add New Member</h4>
                <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text" placeholder="Flat Number (e.g. A-101)" className="input-field"
                    value={newMember.flat_number}
                    onChange={e => setNewMember({...newMember, flat_number: e.target.value.toUpperCase()})}
                    required
                  />
                  <input
                    type="text" placeholder="Owner Name" className="input-field"
                    value={newMember.owner_name}
                    onChange={e => setNewMember({...newMember, owner_name: e.target.value})}
                    required
                  />
                  <input
                    type="email" placeholder="Email (optional)" className="input-field"
                    value={newMember.email}
                    onChange={e => setNewMember({...newMember, email: e.target.value})}
                  />
                  <input
                    type="tel" placeholder="Phone (optional)" className="input-field"
                    value={newMember.phone}
                    onChange={e => setNewMember({...newMember, phone: e.target.value})}
                  />
                  <input
                    type="text" placeholder="Password" className="input-field"
                    value={newMember.password}
                    onChange={e => setNewMember({...newMember, password: e.target.value})}
                    required
                  />
                  <button type="submit" className="btn-accent">Add Member</button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Flat</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.filter(m => !m.is_admin).map(m => (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{m.flat_number}</td>
                      <td className="px-4 py-3">{m.owner_name}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{m.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{m.phone || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteMember(m.id)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {members.filter(m => !m.is_admin).length === 0 && (
                <p className="text-center py-8 text-gray-400">No members added yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
