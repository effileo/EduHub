import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  
  const { id } = await params;

  const thread = await prisma.thread.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      replies: {
        orderBy: [
          { isAcceptedAnswer: 'desc' },
          { upvotes: 'desc' },
          { createdAt: 'asc' }
        ],
        include: {
          author: { select: { id: true, name: true, avatar: true, role: true } }
        }
      }
    }
  })

  if (!thread) return new NextResponse('Not Found', { status: 404 })

  return NextResponse.json(thread)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { id } = await params;
  const { isPinned, isResolved } = await request.json()

  const existing = await prisma.thread.findUnique({ where: { id } })
  if (!existing) return new NextResponse('Not Found', { status: 404 })

  // Only OP or LECTURER can update
  if (user.dbUser?.role !== 'LECTURER' && existing.authorId !== user.id) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const updateData: any = {}
  if (isPinned !== undefined) updateData.isPinned = isPinned
  if (isResolved !== undefined) updateData.isResolved = isResolved

  const thread = await prisma.thread.update({
    where: { id },
    data: updateData
  })

  return NextResponse.json(thread)
}
