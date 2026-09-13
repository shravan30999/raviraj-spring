import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

// DELETE a member (admin only)
export async function DELETE(request, { params }) {
  const session = await getSession()
  if (!session || !session.member.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const supabase = getServiceSupabase()

  // Don't allow deleting the admin
  const { data: member } = await supabase
    .from('members')
    .select('is_admin')
    .eq('id', params.id)
    .single()

  if (member?.is_admin) {
    return NextResponse.json({ error: 'Cannot delete admin account' }, { status: 400 })
  }

  // Delete sessions first, then member
  await supabase.from('sessions').delete().eq('member_id', params.id)
  await supabase.from('notice_reads').delete().eq('member_id', params.id)
  const { error } = await supabase.from('members').delete().eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
