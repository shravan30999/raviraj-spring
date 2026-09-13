import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServiceSupabase } from '@/lib/supabase'
import { generateToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const { flatNumber, password } = await request.json()

    if (!flatNumber || !password) {
      return NextResponse.json({ error: 'Flat number and password are required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Find member by flat number
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('flat_number', flatNumber.toUpperCase())
      .single()

    if (error || !member) {
      return NextResponse.json({ error: 'Invalid flat number or password' }, { status: 401 })
    }

    // Check password
    const validPassword = await bcrypt.compare(password, member.password_hash)
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid flat number or password' }, { status: 401 })
    }

    // Create session token (valid for 30 days)
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await supabase.from('sessions').insert({
      member_id: member.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    // Set cookie
    const response = NextResponse.json({
      success: true,
      member: {
        id: member.id,
        flat_number: member.flat_number,
        owner_name: member.owner_name,
        is_admin: member.is_admin,
      },
      isAdmin: member.is_admin,
    })

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
