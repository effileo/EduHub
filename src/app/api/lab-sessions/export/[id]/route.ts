import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params;

  const session = await prisma.labSession.findUnique({
    where: { id },
    include: {
      attendances: {
        include: {
          student: true,
        },
      },
    },
  })

  if (!session) return new NextResponse('Not Found', { status: 404 })

  // Generate CSV
  const headers = ['Student Name', 'Email', 'Status', 'Check-in Time']
  const rows = session.attendances.map((a) => [
    a.student.name,
    a.student.email,
    a.status,
    format(new Date(a.createdAt), 'yyyy-MM-dd HH:mm:ss'),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="lab-attendance-${session.courseId}-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
    },
  })
}
