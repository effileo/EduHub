import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { notify } from '@/lib/notifications'
import { differenceInMinutes } from 'date-fns'
import { NotificationType, AttendanceStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'STUDENT') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { code } = await request.json()

  const session = await prisma.labSession.findUnique({
    where: { code },
  })

  if (!session) {
    return NextResponse.json({ error: 'Invalid session code' }, { status: 404 })
  }

  if (!session.active) {
    return NextResponse.json({ error: 'Session is closed' }, { status: 400 })
  }

  if (new Date() > session.expiresAt) {
    return NextResponse.json({ error: 'Session has expired' }, { status: 400 })
  }

  // Check if already attended
  const existing = await prisma.attendance.findUnique({
    where: {
      studentId_labSessionId: {
        studentId: user.id,
        labSessionId: session.id,
      },
    },
  })

  if (existing) {
    return NextResponse.json({ error: 'Attendance already recorded' }, { status: 400 })
  }

  // Determine status (Late threshold)
  const minutesPast = differenceInMinutes(new Date(), session.createdAt)
  const status: AttendanceStatus = minutesPast > session.lateThreshold ? 'LATE' : 'PRESENT'

  const attendance = await prisma.attendance.create({
    data: {
      studentId: user.id,
      labSessionId: session.id,
      status,
    },
  })

  // Notify lecturer
  await notify(session.lecturerId, {
    type: 'ANNOUNCEMENT' as NotificationType,
    title: 'New Lab Attendance',
    body: `${user.dbUser?.name} checked into lab ${session.courseId} (${status})`,
    link: `/lecturer/attendance/${session.id}`,
  })

  return NextResponse.json(attendance)
}
