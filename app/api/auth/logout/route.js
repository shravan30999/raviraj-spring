import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST() {
  const cookieStore = cookies()
  const token = cookieStore.get('session_token')?.value

  if (token) {
    const supabase = getServiceSupabase()
    await supabase.from('sessions').delete().eq('token', token)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('session_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}
