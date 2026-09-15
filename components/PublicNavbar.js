'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/guidelines', label: 'General Guidelines' },
    { href: '/forms', label: 'Standard Forms' },
    { href: '/committee', label: 'Managing Committee' },
  ]

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Raviraj Spring" className="h-10" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <Link key={link.href} href={link.href}
                className="text-gray-600 hover:text-primary text-sm font-medium transition-colors">
                {link.label}
              </Link>
            ))}
            <Link href="/login"
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
              Member Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t mt-2 pt-3">
            {links.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-gray-600 hover:text-primary text-sm font-medium">
                {link.label}
              </Link>
            ))}
            <Link href="/login"
              onClick={() => setMobileOpen(false)}
              className="block mt-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium text-center">
              Member Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
