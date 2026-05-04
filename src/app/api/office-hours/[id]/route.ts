import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { notify } from '@/lib/notifications'
import { QueueStatus } from '@prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { id } = await params
  const { status, meetingLink } = await request.json()

  // Verify access
  const existingEntry = await prisma.officeHourQueue.findUnique({
    where: { id }
  })

  if (!existingEntry) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Lecturer can update any status. Student can only CANCEL their own entry.
  if (user.dbUser?.role === 'STUDENT') {
    if (existingEntry.studentId !== user.id || status !== 'CANCELLED') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  } else if (user.dbUser?.role === 'LECTURER') {
    if (existingEntry.lecturerId !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  // Update logic
  const updateData: any = {}
  if (status) updateData.status = status as QueueStatus
  if (meetingLink !== undefined) updateData.meetingLink = meetingLink

  const updatedEntry = await prisma.officeHourQueue.update({
    where: { id },
    data: updateData,
    include: {
      lecturer: { select: { name: true } }
    }
  })

  // Notifications
  if (status === 'ACTIVE' && user.dbUser?.role === 'LECTURER') {
    await notify(existingEntry.studentId, {
      type: 'QUEUE_UPDATE',
      title: "It's your turn!",
      body: `${updatedEntry.lecturer.name} is ready to see you now.`,
      link: `/student/office-hours`,
    })
  }

  return NextResponse.json(updatedEntry)
}
