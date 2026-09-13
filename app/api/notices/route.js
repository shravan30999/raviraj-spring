import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

// GET all notices (filtered by type via query param)
export async function GET(request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'agm' or 'general'

  const supabase = getServiceSupabase()
  let query = supabase
    .from('notices')
    .select('*, members!created_by(owner_name)')
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('notice_type', type)
  }

  const { data: notices, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 })
  }

  return NextResponse.json({ notices })
}

// POST — create a new notice (admin only)
export async function POST(request) {
  const session = await getSession()
  if (!session || !session.member.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { title, content, notice_type } = await request.json()

    if (!title || !content || !notice_type) {
      return NextResponse.json({ error: 'Title, content, and type are required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()
    const { data: notice, error } = await supabase
      .from('notices')
      .insert({
        title,
        content,
        notice_type,
        created_by: session.member.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 })
    }

    return NextResponse.json({ notice }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
