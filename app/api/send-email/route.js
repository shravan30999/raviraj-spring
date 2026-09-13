import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(request) {
  const session = await getSession()
  if (!session || !session.member.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { title, content } = await request.json()

    // Get all members with emails
    const supabase = getServiceSupabase()
    const { data: members } = await supabase
      .from('members')
      .select('email, owner_name')
      .not('email', 'is', null)
      .neq('email', '')

    if (!members || members.length === 0) {
      return NextResponse.json({ message: 'No members with email addresses' })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email to each member (Resend free tier: 100/day)
    const emailPromises = members.map(member =>
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Raviraj Spring <onboarding@resend.dev>',
        to: member.email,
        subject: `Society Notice: ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a5276; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0;">Raviraj Spring Society</h2>
              <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Notice Board</p>
            </div>
            <div style="padding: 24px; background: white; border: 1px solid #e5e7eb; border-top: none;">
              <h3 style="color: #1a5276; margin-top: 0;">${title}</h3>
              <div style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${content}</div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This is an automated notice from Raviraj Spring Housing Society.
                <br>Login at <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.ravirajspring.com'}">ravirajspring.com</a> to view all notices.
              </p>
            </div>
          </div>
        `,
      }).catch(err => {
        console.error(`Failed to email ${member.email}:`, err)
        return null
      })
    )

    await Promise.all(emailPromises)

    return NextResponse.json({
      success: true,
      sent: members.length,
    })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 })
  }
}
