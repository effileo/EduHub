import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { notify } from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { id } = await params;
  const { body } = await request.json()

  if (!body?.trim()) {
    return NextResponse.json({ error: 'Body required' }, { status: 400 })
  }

  const thread = await prisma.thread.findUnique({ where: { id } })
  if (!thread) return new NextResponse('Thread not found', { status: 404 })

  const reply = await prisma.reply.create({
    data: {
      threadId: id,
      authorId: user.id,
      body
    }
  })

  // Notify thread author
  if (thread.authorId !== user.id) {
    await notify(thread.authorId, {
      type: 'DISCUSSION_REPLY',
      title: 'New Reply on your thread',
      body: `${user.dbUser?.name} replied: ${body.substring(0, 50)}...`,
      link: `/courses/${thread.courseId}/discussion/${thread.id}`
    })
  }

  return NextResponse.json(reply)
}
