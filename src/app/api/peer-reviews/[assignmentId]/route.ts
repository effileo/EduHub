import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { assignmentId } = await params;

  const reviews = await prisma.peerReviewAssignment.findMany({
    where: {
      reviewerId: user.id,
      submission: { assignmentId: assignmentId }
    },
    include: {
      submission: {
        select: { id: true, fileUrl: true }
      },
      review: true
    }
  })

  return NextResponse.json(reviews)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { peerReviewAssignmentId, rubricScores, feedback } = await request.json()

  if (!peerReviewAssignmentId || !rubricScores || !feedback) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const result = await prisma.$transaction([
    prisma.peerReview.create({
      data: {
        assignmentId: peerReviewAssignmentId,
        rubricScores,
        feedback
      }
    }),
    prisma.peerReviewAssignment.update({
      where: { id: peerReviewAssignmentId },
      data: { completed: true }
    })
  ])

  return NextResponse.json(result[0])
}
