import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  // Return all schedules for the current user's courses
  // In a real system, we'd filter by enrolled courses. For now, we return all.
  const schedules = await prisma.courseSchedule.findMany({
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' }
    ]
  })

  return NextResponse.json(schedules)
}

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role === 'STUDENT') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { courseId, dayOfWeek, startTime, endTime, room, isRecurring, startDate } = await request.json()

  if (!courseId || dayOfWeek === undefined || !startTime || !endTime || !startDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const schedule = await prisma.courseSchedule.create({
    data: {
      courseId,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      room,
      isRecurring: !!isRecurring,
      startDate: new Date(startDate)
    }
  })

  return NextResponse.json(schedule)
}
