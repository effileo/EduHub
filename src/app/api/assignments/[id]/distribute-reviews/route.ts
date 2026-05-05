import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { notify } from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params;
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { submissions: true }
  })

  if (!assignment) return new NextResponse('Assignment not found', { status: 404 })

  const submissions = assignment.submissions
  if (submissions.length < assignment.reviewsRequired + 1) {
    return NextResponse.json({ error: 'Not enough submissions to distribute reviews' }, { status: 400 })
  }

  // Distribution Algorithm (Random Shuffle)
  const studentIds = submissions.map(s => s.studentId)
  const submissionMap = new Map(submissions.map(s => [s.studentId, s.id]))

  // For each student, assign N reviews
  const peerReviewAssignments: any[] = []

  studentIds.forEach((studentId, index) => {
    let assigned = 0
    let offset = 1
    
    while (assigned < assignment.reviewsRequired) {
      const reviewerIndex = (index + offset) % studentIds.length
      const reviewerId = studentIds[reviewerIndex]
      const submissionToReviewId = submissionMap.get(studentId)

      if (submissionToReviewId) {
        peerReviewAssignments.push({
          submissionId: submissionToReviewId,
          reviewerId: reviewerId
        })
      }
      
      assigned++
      offset++
    }
  })

  // Create PeerReviewAssignment records
  await prisma.peerReviewAssignment.createMany({
    data: peerReviewAssignments,
    skipDuplicates: true
  })

  // Notify students
  const uniqueReviewers = [...new Set(peerReviewAssignments.map(a => a.reviewerId))]
  await Promise.all(uniqueReviewers.map(reviewerId => 
    notify(reviewerId, {
      type: 'ASSIGNMENT_DUE',
      title: 'Peer Reviews Assigned',
      body: `You have new peer reviews to complete for ${assignment.title}`,
      link: '/student/peer-review'
    })
  ))

  return NextResponse.json({ message: 'Reviews distributed successfully', count: peerReviewAssignments.length })
}
