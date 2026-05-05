import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string, replyId: string } }
) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { replyId } = await params;

  const reply = await prisma.reply.update({
    where: { id: replyId },
    data: {
      upvotes: { increment: 1 }
    }
  })

  return NextResponse.json(reply)
}
