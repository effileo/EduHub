import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { notify } from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'STUDENT') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params;

  // Check if group exists
  const group = await prisma.studyGroup.findUnique({
    where: { id },
    include: {
      members: {
        select: { userId: true }
      }
    }
  })

  if (!group) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Check if already a member
  const existingMember = group.members.find(m => m.userId === user.id)
  if (existingMember) {
    return NextResponse.json({ error: 'Already a member' }, { status: 400 })
  }

  const member = await prisma.studyGroupMember.create({
    data: {
      studyGroupId: id,
      userId: user.id,
    }
  })

  // Notify existing members
  const notifications = group.members.map(m => 
    notify(m.userId, {
      type: 'STUDY_GROUP_INVITE',
      title: 'New Member Joined!',
      body: `${user.dbUser?.name} just joined your study group: ${group.title}.`,
      link: `/student/study-groups/${group.id}`,
    })
  )
  await Promise.all(notifications)

  return NextResponse.json(member)
}
