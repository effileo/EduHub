import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'STUDENT') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params;
  const { fileUrl } = await request.json()

  // We use upsert so a student can resubmit (if allowed, for simplicity we allow it here)
  const submission = await prisma.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: id,
        studentId: user.id
      }
    },
    update: {
      fileUrl: fileUrl || null,
      createdAt: new Date() // reset submission time
    },
    create: {
      assignmentId: id,
      studentId: user.id,
      fileUrl: fileUrl || null,
    }
  })

  return NextResponse.json(submission)
}
