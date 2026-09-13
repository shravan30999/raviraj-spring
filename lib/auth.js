import { cookies } from 'next/headers'
import { getServiceSupabase } from './supabase'

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get('session_token')?.value

  if (!token) return null

  const supabase = getServiceSupabase()
  const { data: session } = await supabase
    .from('sessions')
    .select('*, members(*)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!session) return null

  return {
    member: session.members,
    token: session.token,
  }
}

export function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
