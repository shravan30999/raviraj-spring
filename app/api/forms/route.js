import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

// Public GET
export async function GET() {
  try {
    const supabase = getServiceSupabase()
    const { data, error } = await supabase
      .from('standard_forms')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
    return NextResponse.json({ forms: data })
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
    const { title, description, file_url, file_name, file_type } = await request.json()

    if (!title || !file_url) {
      return NextResponse.json({ error: 'Title and file are required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()
    const { data, error } = await supabase
      .from('standard_forms')
      .insert({ title, description, file_url, file_name, file_type })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
    return NextResponse.json({ form: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
