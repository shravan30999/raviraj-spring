import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(request) {
  const session = await getSession()
  if (!session || !session.member.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll('files')

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const supabase = getServiceSupabase()
    const uploaded = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const ext = file.name.split('.').pop()
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const filePath = `uploads/${uniqueName}`

      const { error: uploadError } = await supabase.storage
        .from('society-files')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      const { data: urlData } = supabase.storage
        .from('society-files')
        .getPublicUrl(filePath)

      uploaded.push({
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      })
    }

    return NextResponse.json({ files: uploaded })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
