import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'
import { subDays } from 'date-fns'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const sevenDaysAgo = subDays(new Date(), 7)

  const [
    counts,
    avgAttendance,
    avgEval,
    activeUsers,
    topCourses
  ] = await Promise.all([
    // 1. Total counts by role
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),

    // 2. Average attendance
    prisma.attendance.aggregate({
      _avg: {
        // Attendance status is an enum, we need to calculate based on PRESENT
      }
    }),

    // 3. Average evaluation
    prisma.evaluation.aggregate({
      _avg: {
        contentScore: true,
        deliveryScore: true,
        paceScore: true,
        materialsScore: true,
        supportScore: true,
      }
    }),

    // 4. Active users last 7 days
    prisma.user.count({
      where: { updatedAt: { gte: sevenDaysAgo } }
    }),

    // 5. Most active courses
    // This is complex, we'll do a simple count of resources/threads/attendances per courseId
    prisma.thread.groupBy({
      by: ['courseId'],
      _count: true,
      orderBy: { _count: { id: 'desc' } },
      take: 5
    })
  ])

  // Custom calculation for attendance rate
  const totalAttendance = await prisma.attendance.count()
  const presentAttendance = await prisma.attendance.count({ where: { status: 'PRESENT' } })
  const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0

  // Calculate average eval overall
  const evalAvgOverall = avgEval._avg ? (
    (avgEval._avg.contentScore || 0) + 
    (avgEval._avg.deliveryScore || 0) + 
    (avgEval._avg.paceScore || 0) + 
    (avgEval._avg.materialsScore || 0) + 
    (avgEval._avg.supportScore || 0)
  ) / 5 : 0

  return NextResponse.json({
    counts: Object.fromEntries(counts.map(c => [c.role, c._count])),
    attendanceRate,
    evaluationScore: evalAvgOverall,
    activeUsersLast7Days: activeUsers,
    topCourses
  })
}
