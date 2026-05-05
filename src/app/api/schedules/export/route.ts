import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import ical from 'ical-generator'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const calendar = ical({ name: 'EduHub Timetable' })

  // 1. Add Course Schedules
  const schedules = await prisma.courseSchedule.findMany()
  schedules.forEach(s => {
    const startHour = parseInt(s.startTime.split(':')[0])
    const startMin = parseInt(s.startTime.split(':')[1])
    const endHour = parseInt(s.endTime.split(':')[0])
    const endMin = parseInt(s.endTime.split(':')[1])

    const eventDate = new Date(s.startDate)
    // Adjust to the correct day of week
    const diff = s.dayOfWeek - eventDate.getDay()
    eventDate.setDate(eventDate.getDate() + (diff < 0 ? diff + 7 : diff))

    calendar.createEvent({
      start: new Date(eventDate.setHours(startHour, startMin)),
      end: new Date(eventDate.setHours(endHour, endMin)),
      summary: s.courseId,
      location: s.room || 'TBA',
      repeating: s.isRecurring ? { freq: 'WEEKLY' } : undefined
    })
  })

  // 2. Add Assignment Deadlines
  const assignments = await prisma.assignment.findMany()
  assignments.forEach(a => {
    calendar.createEvent({
      start: new Date(a.dueDate),
      end: new Date(new Date(a.dueDate).getTime() + 60 * 60 * 1000), // 1 hour duration
      summary: `DUE: ${a.title}`,
      description: a.description || ''
    })
  })

  return new NextResponse(calendar.toString(), {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': 'attachment; filename="eduhub-timetable.ics"'
    }
  })
}
