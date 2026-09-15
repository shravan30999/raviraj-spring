import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// Public endpoint — no auth required
export async function GET() {
  try {
    const supabase = getServiceSupabase()
    const { data: notices, error } = await supabase
      .from('notices')
      .select('id, title, notice_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      return NextResponse.json({ notices: [] })
    }

    return NextResponse.json({ notices })
  } catch {
    return NextResponse.json({ notices: [] })
  }
}
