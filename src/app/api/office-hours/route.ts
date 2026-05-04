import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { notify } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'STUDENT') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { lecturerId, topic } = await request.json()

  // Calculate position
  const maxPositionResult = await prisma.officeHourQueue.aggregate({
    where: { lecturerId, status: { in: ['WAITING', 'ACTIVE'] } },
    _max: { position: true },
  })
  
  const currentMax = maxPositionResult._max.position || 0
  const position = currentMax + 1

  const queueEntry = await prisma.officeHourQueue.create({
    data: {
      lecturerId,
      studentId: user.id,
      topic,
      position,
      status: 'WAITING',
    },
  })

  // Notify lecturer
  await notify(lecturerId, {
    type: 'QUEUE_UPDATE',
    title: 'New Student in Queue',
    body: `${user.dbUser?.name} joined the queue for: ${topic}`,
    link: `/lecturer/office-hours`,
  })

  return NextResponse.json(queueEntry)
}

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  if (user.dbUser?.role === 'LECTURER') {
    // Return all active/waiting queue entries for this lecturer
    const entries = await prisma.officeHourQueue.findMany({
      where: {
        lecturerId: user.id,
        status: { in: ['WAITING', 'ACTIVE'] }
      },
      orderBy: { position: 'asc' },
      include: {
        student: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    })
    return NextResponse.json(entries)
  } else {
    // Return all entries where this student is waiting or active
    const entries = await prisma.officeHourQueue.findMany({
      where: {
        studentId: user.id,
        status: { in: ['WAITING', 'ACTIVE'] }
      },
      include: {
        lecturer: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    })
    return NextResponse.json(entries)
  }
}
