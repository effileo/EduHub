import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { notify } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  if (user.dbUser?.role === 'STUDENT') {
    // For students: Return assignments. 
    // Usually, we'd filter by enrolled courses. We'll return all assignments here, including their submissions if any.
    const assignments = await prisma.assignment.findMany({
      orderBy: { dueDate: 'asc' },
      include: {
        submissions: {
          where: { studentId: user.id }
        }
      }
    })
    return NextResponse.json(assignments)
  } else if (user.dbUser?.role === 'LECTURER') {
    // For lecturers: Return assignments they created
    const assignments = await prisma.assignment.findMany({
      where: { lecturerId: user.id },
      orderBy: { dueDate: 'asc' },
      include: {
        _count: { select: { submissions: true } },
        submissions: {
          select: { score: true }
        }
      }
    })
    return NextResponse.json(assignments)
  }

  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { courseId, title, description, dueDate, maxScore, weight } = await request.json()

  if (!courseId || !title || !dueDate || maxScore == null || weight == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const assignment = await prisma.assignment.create({
    data: {
      courseId,
      lecturerId: user.id,
      title,
      description,
      dueDate: new Date(dueDate),
      maxScore: Number(maxScore),
      weight: Number(weight),
    }
  })

  // Notify students
  // Fetch enrolled students for the course. For demo, we just notify all STUDENT users.
  const students = await prisma.user.findMany({ where: { role: 'STUDENT' } })
  
  const notifications = students.map(student => 
    notify(student.id, {
      type: 'ASSIGNMENT_DUE',
      title: 'New Assignment Posted',
      body: `${title} is due on ${new Date(dueDate).toLocaleDateString()}`,
      link: '/student/grades'
    })
  )
  await Promise.all(notifications)

  return NextResponse.json(assignment)
}
