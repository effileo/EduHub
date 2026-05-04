import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'STUDENT') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Ideally, filter by courses the student is enrolled in.
  // For now, we return all groups to match "available groups".
  const groups = await prisma.studyGroup.findMany({
    include: {
      _count: { select: { members: true } },
      members: {
        where: { userId: user.id },
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Add an `isMember` boolean for convenience
  const formattedGroups = groups.map(g => ({
    ...g,
    isMember: g.members.length > 0
  }))

  return NextResponse.json(formattedGroups)
}

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'STUDENT') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { courseId, title, tags } = await request.json()

  if (!courseId || !title) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Create the group AND automatically add the creator as a member
  const group = await prisma.studyGroup.create({
    data: {
      courseId,
      title,
      tags: tags || [],
      members: {
        create: {
          userId: user.id
        }
      }
    }
  })

  return NextResponse.json(group)
}
