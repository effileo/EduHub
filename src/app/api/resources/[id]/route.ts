import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { id } = await params;
  const resource = await prisma.resource.findUnique({ where: { id } })

  if (!resource) return new NextResponse('Not Found', { status: 404 })

  const supabase = createClient()
  const { data, error } = await (await supabase).storage
    .from('course-materials')
    .createSignedUrl(resource.fileUrl, 3600) // Valid for 1 hour

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ downloadUrl: data.signedUrl })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params;
  const { title, week, sortOrder } = await request.json()

  const resource = await prisma.resource.update({
    where: { id },
    data: {
      title,
      week: week !== undefined ? (week === null ? null : Number(week)) : undefined,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined
    }
  })

  return NextResponse.json(resource)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params;
  await prisma.resource.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
