import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

// Public GET
export async function GET() {
  try {
    const supabase = getServiceSupabase()
    const { data, error } = await supabase
      .from('committee_members')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
    return NextResponse.json({ members: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Admin POST
export async function POST(request) {
  const session = await getSession()
  if (!session || !session.member.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { name, designation, phone, email, flat_number } = await request.json()

    if (!name || !designation) {
      return NextResponse.json({ error: 'Name and designation are required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()
    const { data, error } = await supabase
      .from('committee_members')
      .insert({ name, designation, phone, email, flat_number })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
    return NextResponse.json({ member: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
