import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

// DELETE a notice (admin only)
export async function DELETE(request, { params }) {
  const session = await getSession()
  if (!session || !session.member.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const supabase = getServiceSupabase()
  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
