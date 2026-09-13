import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

// GET all members (admin only)
export async function GET() {
  const session = await getSession()
  if (!session || !session.member.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const supabase = getServiceSupabase()
  const { data: members } = await supabase
    .from('members')
    .select('id, flat_number, owner_name, email, phone, is_admin, created_at')
    .order('flat_number')

  return NextResponse.json({ members: members || [] })
}

// POST — add a new member (admin only)
export async function POST(request) {
  const session = await getSession()
  if (!session || !session.member.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { flat_number, owner_name, email, phone, password } = await request.json()

    if (!flat_number || !owner_name || !password) {
      return NextResponse.json({ error: 'Flat number, name, and password are required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Check if flat number already exists
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('flat_number', flat_number.toUpperCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Flat number already registered' }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const { data: member, error } = await supabase
      .from('members')
      .insert({
        flat_number: flat_number.toUpperCase(),
        owner_name,
        email: email || null,
        phone: phone || null,
        password_hash,
      })
      .select('id, flat_number, owner_name, email, phone')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
    }

    return NextResponse.json({ member }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
