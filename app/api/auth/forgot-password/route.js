import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getServiceSupabase } from '@/lib/supabase'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { flatNumber, email } = await request.json()

    if (!flatNumber || !email) {
      return NextResponse.json({ error: 'Flat number and email are required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Find member by flat number and email
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('flat_number', flatNumber.toUpperCase())
      .eq('email', email.toLowerCase())
      .single()

    if (error || !member) {
      // Don't reveal if member exists — return success either way
      return NextResponse.json({ success: true, message: 'If the details match, you will receive an email with a new password.' })
    }

    // Generate a new random password
    const newPassword = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 4).toUpperCase()
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Update the member's password
    const { error: updateError } = await supabase
      .from('members')
      .update({ password_hash: passwordHash })
      .eq('id', member.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    // Send email with new password
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Raviraj Spring <onboarding@resend.dev>',
      to: member.email,
      subject: 'Raviraj Spring — Your New Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a5276; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Raviraj Spring Society</h2>
            <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Password Reset</p>
          </div>
          <div style="padding: 24px; background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="color: #374151;">Dear ${member.owner_name},</p>
            <p style="color: #374151;">Your password has been reset. Here are your new login details:</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0 0 8px; color: #374151;"><strong>Flat Number:</strong> ${member.flat_number}</p>
              <p style="margin: 0; color: #374151;"><strong>New Password:</strong> ${newPassword}</p>
            </div>
            <p style="color: #374151;">Please login and change your password from your profile settings.</p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
              Login at <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.ravirajspring.com'}/login">ravirajspring.com</a>
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: 'If the details match, you will receive an email with a new password.' })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
