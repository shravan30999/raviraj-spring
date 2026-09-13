import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  return NextResponse.json({
    member: {
      id: session.member.id,
      flat_number: session.member.flat_number,
      owner_name: session.member.owner_name,
      is_admin: session.member.is_admin,
    },
  })
}
