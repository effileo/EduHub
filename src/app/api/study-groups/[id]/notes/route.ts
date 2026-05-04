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

  const group = await prisma.studyGroup.findUnique({
    where: { id },
    select: { notes: true, _count: { select: { members: true } } }
  })

  if (!group) return new NextResponse('Not Found', { status: 404 })

  return NextResponse.json({ notes: group.notes })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'STUDENT') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params;
  const { notes } = await request.json()

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
    return NextResponse.json({ error: 'Must be a member to edit notes' }, { status: 403 })
  }

  const updatedGroup = await prisma.studyGroup.update({
    where: { id },
    data: { notes }
  })

  return NextResponse.json({ notes: updatedGroup.notes })
}
