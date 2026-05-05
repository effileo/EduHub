import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string, replyId: string } }
) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { id, replyId } = await params;

  const thread = await prisma.thread.findUnique({ where: { id } })
  if (!thread) return new NextResponse('Not Found', { status: 404 })

  // Only OP or LECTURER can mark as accepted
  if (user.dbUser?.role !== 'LECTURER' && thread.authorId !== user.id) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Transaction to update reply AND thread
  const result = await prisma.$transaction([
    prisma.reply.updateMany({
      where: { threadId: id },
      data: { isAcceptedAnswer: false } // Reset others
    }),
    prisma.reply.update({
      where: { id: replyId },
      data: { isAcceptedAnswer: true }
    }),
    prisma.thread.update({
      where: { id },
      data: { isResolved: true }
    })
  ])

  return NextResponse.json(result[1])
}
