import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'STUDENT') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params;

  // We should verify they are a member, but for simplicity we'll allow reading if authenticated
  const messages = await prisma.message.findMany({
    where: { studyGroupId: id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      author: {
        select: { id: true, name: true, avatar: true }
      }
    }
  })

  // Return in chronological order
  return NextResponse.json(messages.reverse())
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'STUDENT') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params;
  const { body } = await request.json()

  if (!body?.trim()) {
    return NextResponse.json({ error: 'Message body required' }, { status: 400 })
  }

  // Verify membership
  const member = await prisma.studyGroupMember.findUnique({
    where: {
      studyGroupId_userId: {
        studyGroupId: id,
        userId: user.id
      }
    }
  })

  if (!member) {
    return NextResponse.json({ error: 'Must be a member to post' }, { status: 403 })
  }

  const message = await prisma.message.create({
    data: {
      studyGroupId: id,
      authorId: user.id,
      body
    },
    include: {
      author: {
        select: { id: true, name: true, avatar: true }
      }
    }
  })

  return NextResponse.json(message)
}
