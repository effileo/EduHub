import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { notify } from '@/lib/notifications'
import { calculateGPA } from '@/lib/gpa'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { id } = await params;

  if (user.dbUser?.role === 'LECTURER') {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        submissions: {
          include: {
            student: { select: { id: true, name: true, email: true, avatar: true } }
          }
        }
      }
    })

    if (!assignment || assignment.lecturerId !== user.id) {
      return new NextResponse('Not Found or Unauthorized', { status: 404 })
    }

    // Also fetch all students in the course to show who hasn't submitted
    // For demo, we just fetch all students and match
    const allStudents = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, name: true, avatar: true } })

    return NextResponse.json({ assignment, allStudents })
  } else {
    // For students
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        submissions: {
          where: { studentId: user.id }
        }
      }
    })

    if (!assignment) return new NextResponse('Not Found', { status: 404 })
    return NextResponse.json(assignment)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params;
  const { submissionId, score, feedback } = await request.json()

  // Ensure assignment belongs to lecturer
  const assignment = await prisma.assignment.findUnique({ where: { id } })
  if (!assignment || assignment.lecturerId !== user.id) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      score: score !== '' ? Number(score) : null,
      feedback: feedback || null,
      gradedAt: new Date(),
      gradedBy: user.id
    },
    include: {
      assignment: true
    }
  })

  // Notify student
  await notify(submission.studentId, {
    type: 'GRADE_POSTED',
    title: 'Grade Posted',
    body: `Your grade for ${submission.assignment.title} is now available.`,
    link: '/student/grades'
  })

  // Recalculate GPA
  await calculateGPA(submission.studentId)

  return NextResponse.json(submission)
}
