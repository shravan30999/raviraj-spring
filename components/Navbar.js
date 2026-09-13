'use client'
import { useRouter } from 'next/navigation'

export default function Navbar({ member }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <div>
            <h1 className="font-bold text-lg leading-tight">Raviraj Spring</h1>
            <p className="text-xs text-blue-200">Society Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200">
            {member?.flat_number} — {member?.owner_name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-lg transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
