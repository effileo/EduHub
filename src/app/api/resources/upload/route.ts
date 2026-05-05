import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { filename, contentType } = await request.json()
  const supabase = createClient()

  // Generate a unique path for the file
  const path = `${Date.now()}-${filename}`

  const { data, error } = await (await supabase).storage
    .from('course-materials')
    .createSignedUploadUrl(path)

  if (error) {
    console.error('Supabase Storage Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    uploadUrl: data.signedUrl,
    token: data.token,
    path: data.path
  })
}
