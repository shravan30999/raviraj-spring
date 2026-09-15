'use client'
import { useState, useEffect, useRef } from 'react'
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
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Members management
  const [members, setMembers] = useState([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({ flat_number: '', owner_name: '', email: '', phone: '', password: '' })

  // Guidelines management
  const [guidelines, setGuidelines] = useState([])
  const [showAddGuideline, setShowAddGuideline] = useState(false)
  const [guidelineTitle, setGuidelineTitle] = useState('')
  const [guidelineDesc, setGuidelineDesc] = useState('')
  const [guidelineFile, setGuidelineFile] = useState(null)
  const guidelineFileRef = useRef(null)

  // Forms management
  const [forms, setForms] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formFile, setFormFile] = useState(null)
  const formFileRef = useRef(null)

  // Committee management
  const [committee, setCommittee] = useState([])
  const [showAddCommittee, setShowAddCommittee] = useState(false)
  const [newCommittee, setNewCommittee] = useState({ name: '', designation: '', phone: '', email: '', flat_number: '' })

  const router = useRouter()

  useEffect(() => {
    async function load() {
      const authRes = await fetch('/api/auth/me')
      if (!authRes.ok) { router.push('/login'); return }
      const authData = await authRes.json()
      if (!authData.member.is_admin) { router.push('/dashboard'); return }
      setMember(authData.member)
      setLoading(false)
    }
    load()
  }, [router])

  async function fetchNotices() {
    const res = await fetch('/api/notices')
    if (res.ok) { const data = await res.json(); setNotices(data.notices || []) }
  }
  async function fetchMembers() {
    const res = await fetch('/api/members')
    if (res.ok) { const data = await res.json(); setMembers(data.members || []) }
  }
  async function fetchGuidelines() {
    const res = await fetch('/api/guidelines')
    if (res.ok) { const data = await res.json(); setGuidelines(data.guidelines || []) }
  }
  async function fetchForms() {
    const res = await fetch('/api/forms')
    if (res.ok) { const data = await res.json(); setForms(data.forms || []) }
  }
  async function fetchCommittee() {
    const res = await fetch('/api/committee')
    if (res.ok) { const data = await res.json(); setCommittee(data.members || []) }
  }

  useEffect(() => {
    if (activeTab === 'notices') fetchNotices()
    if (activeTab === 'members') fetchMembers()
    if (activeTab === 'guidelines') fetchGuidelines()
    if (activeTab === 'forms') fetchForms()
    if (activeTab === 'committee') fetchCommittee()
  }, [activeTab])

  async function uploadFiles(fileList) {
    const formData = new FormData()
    for (const f of fileList) formData.append('files', f)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.files || []
  }

  async function handleCreateNotice(e) {
    e.preventDefault()
    setCreating(true)
    setMessage('')

    try {
      let attachments = []
      if (files.length > 0) {
        setUploading(true)
        attachments = await uploadFiles(files)
        setUploading(false)
      }

      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: content || null, notice_type: noticeType, attachments }),
      })

      if (!res.ok) { setMessage('Failed to create notice'); setCreating(false); return }
      const data = await res.json()

      // Send email notification
      if (noticeType === 'general') {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noticeId: data.notice.id, title, content: content || 'Please login to view the attached documents.' }),
        })
      }

      setMessage('Notice created successfully!')
      setTitle(''); setContent(''); setFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      setCreating(false)
    } catch (err) {
      setMessage('Something went wrong')
      setCreating(false)
      setUploading(false)
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

  async function handleAddGuideline(e) {
    e.preventDefault()
    if (!guidelineFile) { alert('Please select a file'); return }
    try {
      const uploaded = await uploadFiles([guidelineFile])
      if (uploaded.length === 0) { alert('Upload failed'); return }
      const res = await fetch('/api/guidelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: guidelineTitle,
          description: guidelineDesc,
          file_url: uploaded[0].file_url,
          file_name: uploaded[0].file_name,
          file_type: uploaded[0].file_type,
        }),
      })
      if (res.ok) {
        setGuidelineTitle(''); setGuidelineDesc(''); setGuidelineFile(null)
        if (guidelineFileRef.current) guidelineFileRef.current.value = ''
        setShowAddGuideline(false)
        fetchGuidelines()
      } else { alert('Failed to add guideline') }
    } catch { alert('Upload failed') }
  }

  async function handleDeleteGuideline(id) {
    if (!confirm('Delete this guideline?')) return
    await fetch(`/api/guidelines/${id}`, { method: 'DELETE' })
    fetchGuidelines()
  }

  async function handleAddForm(e) {
    e.preventDefault()
    if (!formFile) { alert('Please select a file'); return }
    try {
      const uploaded = await uploadFiles([formFile])
      if (uploaded.length === 0) { alert('Upload failed'); return }
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          file_url: uploaded[0].file_url,
          file_name: uploaded[0].file_name,
          file_type: uploaded[0].file_type,
        }),
      })
      if (res.ok) {
        setFormTitle(''); setFormDesc(''); setFormFile(null)
        if (formFileRef.current) formFileRef.current.value = ''
        setShowAddForm(false)
        fetchForms()
      } else { alert('Failed to add form') }
    } catch { alert('Upload failed') }
  }

  async function handleDeleteForm(id) {
    if (!confirm('Delete this form?')) return
    await fetch(`/api/forms/${id}`, { method: 'DELETE' })
    fetchForms()
  }

  async function handleAddCommittee(e) {
    e.preventDefault()
    const res = await fetch('/api/committee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCommittee),
    })
    if (res.ok) {
      setNewCommittee({ name: '', designation: '', phone: '', email: '', flat_number: '' })
      setShowAddCommittee(false)
      fetchCommittee()
    } else { alert('Failed to add committee member') }
  }

  async function handleDeleteCommittee(id) {
    if (!confirm('Remove this committee member?')) return
    await fetch(`/api/committee/${id}`, { method: 'DELETE' })
    fetchCommittee()
  }

  function getWhatsAppLink() {
    const text = `*${title}*\n\nRaviraj Spring Society Notice\n\n${content || '(See attached documents)'}\n\n— Society Admin`
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }

  if (loading || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  const tabs = [
    { key: 'create', label: 'Create Notice' },
    { key: 'notices', label: 'All Notices' },
    { key: 'members', label: 'Members' },
    { key: 'guidelines', label: 'Guidelines' },
    { key: 'forms', label: 'Forms' },
    { key: 'committee', label: 'Committee' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar member={member} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-6 border-b pb-3 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
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
                    <input type="radio" name="type" value="general" checked={noticeType === 'general'}
                      onChange={() => setNoticeType('general')} className="text-primary" />
                    <span className="text-sm">General Notice</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" value="agm" checked={noticeType === 'agm'}
                      onChange={() => setNoticeType('agm')} className="text-primary" />
                    <span className="text-sm">AGM Notice</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Title</label>
                <input type="text" className="input-field" placeholder="Notice heading"
                  value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Content (optional)</label>
                <textarea className="input-field min-h-[120px]" placeholder="Additional text (optional if uploading files)..."
                  value={content} onChange={e => setContent(e.target.value)} />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Attach Files (PDF, JPEG, PNG)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setFiles(Array.from(e.target.files))}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {files.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {files.length} file(s) selected: {files.map(f => f.name).join(', ')}
                  </div>
                )}
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
                  {uploading ? 'Uploading files...' : creating ? 'Publishing...' : 'Publish Notice'}
                </button>
                {title && (
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-600 transition-all">
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
                  <button onClick={() => handleDeleteNotice(notice.id)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 text-sm">
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
                  <input type="text" placeholder="Flat Number (e.g. A-101)" className="input-field"
                    value={newMember.flat_number}
                    onChange={e => setNewMember({...newMember, flat_number: e.target.value.toUpperCase()})} required />
                  <input type="text" placeholder="Owner Name" className="input-field"
                    value={newMember.owner_name}
                    onChange={e => setNewMember({...newMember, owner_name: e.target.value})} required />
                  <input type="email" placeholder="Email (optional)" className="input-field"
                    value={newMember.email}
                    onChange={e => setNewMember({...newMember, email: e.target.value})} />
                  <input type="tel" placeholder="Phone (optional)" className="input-field"
                    value={newMember.phone}
                    onChange={e => setNewMember({...newMember, phone: e.target.value})} />
                  <input type="text" placeholder="Password" className="input-field"
                    value={newMember.password}
                    onChange={e => setNewMember({...newMember, password: e.target.value})} required />
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
                        <button onClick={() => handleDeleteMember(m.id)}
                          className="text-red-400 hover:text-red-600 text-xs">Remove</button>
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

        {/* GUIDELINES TAB */}
        {activeTab === 'guidelines' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">{guidelines.length} documents</p>
              <button onClick={() => setShowAddGuideline(!showAddGuideline)} className="btn-primary text-sm">
                + Add Guideline
              </button>
            </div>
            {showAddGuideline && (
              <div className="bg-white rounded-xl shadow-sm border p-5 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">Add Guideline Document</h4>
                <form onSubmit={handleAddGuideline} className="space-y-3">
                  <input type="text" placeholder="Title" className="input-field"
                    value={guidelineTitle} onChange={e => setGuidelineTitle(e.target.value)} required />
                  <input type="text" placeholder="Description (optional)" className="input-field"
                    value={guidelineDesc} onChange={e => setGuidelineDesc(e.target.value)} />
                  <input ref={guidelineFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={e => setGuidelineFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary" required />
                  <button type="submit" className="btn-accent">Upload & Add</button>
                </form>
              </div>
            )}
            <div className="space-y-2">
              {guidelines.map(doc => (
                <div key={doc.id} className="bg-white rounded-lg border p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{doc.title}</p>
                    {doc.description && <p className="text-xs text-gray-500">{doc.description}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{doc.file_name}</p>
                  </div>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">View</a>
                  <button onClick={() => handleDeleteGuideline(doc.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                </div>
              ))}
              {guidelines.length === 0 && <p className="text-center py-8 text-gray-400">No guidelines yet</p>}
            </div>
          </div>
        )}

        {/* FORMS TAB */}
        {activeTab === 'forms' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">{forms.length} forms</p>
              <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary text-sm">
                + Add Form
              </button>
            </div>
            {showAddForm && (
              <div className="bg-white rounded-xl shadow-sm border p-5 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">Add Standard Form</h4>
                <form onSubmit={handleAddForm} className="space-y-3">
                  <input type="text" placeholder="Title" className="input-field"
                    value={formTitle} onChange={e => setFormTitle(e.target.value)} required />
                  <input type="text" placeholder="Description (optional)" className="input-field"
                    value={formDesc} onChange={e => setFormDesc(e.target.value)} />
                  <input ref={formFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={e => setFormFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary" required />
                  <button type="submit" className="btn-accent">Upload & Add</button>
                </form>
              </div>
            )}
            <div className="space-y-2">
              {forms.map(form => (
                <div key={form.id} className="bg-white rounded-lg border p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{form.title}</p>
                    {form.description && <p className="text-xs text-gray-500">{form.description}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{form.file_name}</p>
                  </div>
                  <a href={form.file_url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">View</a>
                  <button onClick={() => handleDeleteForm(form.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                </div>
              ))}
              {forms.length === 0 && <p className="text-center py-8 text-gray-400">No forms yet</p>}
            </div>
          </div>
        )}

        {/* COMMITTEE TAB */}
        {activeTab === 'committee' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">{committee.length} members</p>
              <button onClick={() => setShowAddCommittee(!showAddCommittee)} className="btn-primary text-sm">
                + Add Member
              </button>
            </div>
            {showAddCommittee && (
              <div className="bg-white rounded-xl shadow-sm border p-5 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">Add Committee Member</h4>
                <form onSubmit={handleAddCommittee} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Full Name" className="input-field"
                    value={newCommittee.name} onChange={e => setNewCommittee({...newCommittee, name: e.target.value})} required />
                  <input type="text" placeholder="Designation (e.g. Chairman)" className="input-field"
                    value={newCommittee.designation} onChange={e => setNewCommittee({...newCommittee, designation: e.target.value})} required />
                  <input type="text" placeholder="Flat Number (optional)" className="input-field"
                    value={newCommittee.flat_number} onChange={e => setNewCommittee({...newCommittee, flat_number: e.target.value})} />
                  <input type="tel" placeholder="Phone (optional)" className="input-field"
                    value={newCommittee.phone} onChange={e => setNewCommittee({...newCommittee, phone: e.target.value})} />
                  <input type="email" placeholder="Email (optional)" className="input-field"
                    value={newCommittee.email} onChange={e => setNewCommittee({...newCommittee, email: e.target.value})} />
                  <button type="submit" className="btn-accent">Add</button>
                </form>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Designation</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Flat</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {committee.map(m => (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{m.name}</td>
                      <td className="px-4 py-3 text-primary">{m.designation}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{m.flat_number || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{m.phone || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteCommittee(m.id)}
                          className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {committee.length === 0 && (
                <p className="text-center py-8 text-gray-400">No committee members added yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
