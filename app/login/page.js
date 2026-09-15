'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [flatNumber, setFlatNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false)
  const [forgotFlat, setForgotFlat] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flatNumber, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      if (data.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    setForgotMsg('')
    setForgotLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flatNumber: forgotFlat, email: forgotEmail }),
      })

      const data = await res.json()
      setForgotMsg(data.message || 'If the details match, you will receive an email with a new password.')
    } catch {
      setForgotMsg('Something went wrong. Please try again.')
    }
    setForgotLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-blue-800 px-4">
      <div className="w-full max-w-md">
        {/* Society Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full p-4 mb-4 shadow-lg">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Raviraj Spring</h1>
          <p className="text-blue-200 mt-1">Housing Society Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!showForgot ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Member Login</h2>

              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Flat Number
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. A-101"
                    value={flatNumber}
                    onChange={e => setFlatNumber(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-6 text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary text-center py-3 text-lg disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-gray-500">
                Contact society office for login credentials
              </p>

              <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-primary hover:underline">
                  Back to Home
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Forgot Password</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your flat number and registered email. We will send you a new password.</p>

              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Flat Number
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. A-101"
                    value={forgotFlat}
                    onChange={e => setForgotFlat(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                {forgotMsg && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                    {forgotMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full btn-primary text-center py-3 disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send New Password'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => { setShowForgot(false); setForgotMsg('') }}
                  className="text-sm text-primary hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
