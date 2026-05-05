import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')

  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }

  const resources = await prisma.resource.findMany({
    where: { courseId },
    orderBy: [
      { week: 'asc' },
      { sortOrder: 'asc' }
    ],
    include: {
      uploader: { select: { name: true } }
    }
  })

  return NextResponse.json(resources)
}

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { courseId, title, fileType, week, fileUrl } = await request.json()

  if (!courseId || !title || !fileType || !fileUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Find current max sortOrder for this course and week
  const maxSort = await prisma.resource.aggregate({
    where: { courseId, week: week || null },
    _max: { sortOrder: true }
  })

  const resource = await prisma.resource.create({
    data: {
      courseId,
      uploaderId: user.id,
      title,
      fileType,
      fileUrl,
      week: week ? Number(week) : null,
      sortOrder: (maxSort._max.sortOrder || 0) + 1
    }
  })

  return NextResponse.json(resource)
}
