import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { notify } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')
  const search = searchParams.get('search')

  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }

  // Build where clause
  const whereClause: any = { courseId }
  
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { body: { contains: search, mode: 'insensitive' } }
    ]
  }

  const threads = await prisma.thread.findMany({
    where: whereClause,
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' }
    ],
    include: {
      author: { select: { name: true, avatar: true } },
      _count: { select: { replies: true } }
    }
  })

  return NextResponse.json(threads)
}

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { courseId, title, body } = await request.json()

  if (!courseId || !title || !body) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const thread = await prisma.thread.create({
    data: {
      courseId,
      title,
      body,
      authorId: user.id
    }
  })

  // Notify lecturer (for demo, finding first lecturer. In reality, find course's lecturer)
  const lecturer = await prisma.user.findFirst({ where: { role: 'LECTURER' } })
  if (lecturer && lecturer.id !== user.id) {
    await notify(lecturer.id, {
      type: 'DISCUSSION_REPLY',
      title: 'New Discussion Thread',
      body: `${user.dbUser?.name} posted: ${title}`,
      link: `/courses/${courseId}/discussion/${thread.id}`
    })
  }

  return NextResponse.json(thread)
}
