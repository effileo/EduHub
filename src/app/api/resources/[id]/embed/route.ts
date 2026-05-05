import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import pdf from 'pdf-parse'
import { embedAndStore } from '@/lib/embeddings'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params;
  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) return new NextResponse('Resource not found', { status: 404 })

  try {
    const supabase = createClient()
    
    // 1. Fetch file from Supabase Storage
    const { data, error } = await (await supabase).storage
      .from('course-materials')
      .download(resource.fileUrl)

    if (error) throw error

    // 2. Extract text (assuming PDF for now, can add others)
    let text = ''
    if (resource.fileType.includes('pdf')) {
      const buffer = Buffer.from(await data.arrayBuffer())
      const pdfData = await pdf(buffer)
      text = pdfData.text
    } else {
      // For other types, maybe just use title or skip for now
      text = resource.title
    }

    // 3. Chunk, embed, and store
    await embedAndStore(id, text)

    return NextResponse.json({ message: 'Embedding complete' })
  } catch (err: any) {
    console.error('Embedding failed:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
