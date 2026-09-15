import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

export async function DELETE(request, { params }) {
  const session = await getSession()
  if (!session || !session.member.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const supabase = getServiceSupabase()
  const { error } = await supabase
    .from('guidelines')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
