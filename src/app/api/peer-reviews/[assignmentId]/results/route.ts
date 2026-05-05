import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { assignmentId } = await params;

  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    include: {
      student: { select: { id: true, name: true, avatar: true } },
      peerReviewAssignments: {
        where: { completed: true },
        include: { review: true }
      }
    }
  })

  const results = submissions.map(sub => {
    const scores = sub.peerReviewAssignments
      .map(pra => {
        const rubric = pra.review?.rubricScores as Record<string, number>
        if (!rubric) return null
        return Object.values(rubric).reduce((a, b) => a + b, 0)
      })
      .filter((s): s is number => s !== null)

    if (scores.length === 0) return { student: sub.student, avgScore: null, count: 0, outliers: [] }

    // Simple Outlier Detection: IQR method
    // If score deviates > 1.5 * IQR from Q1/Q3
    const sorted = [...scores].sort((a, b) => a - b)
    const q1 = sorted[Math.floor(sorted.length * 0.25)]
    const q3 = sorted[Math.floor(sorted.length * 0.75)]
    const iqr = q3 - q1
    
    const validScores = scores.filter(s => s >= q1 - 1.5 * iqr && s <= q3 + 1.5 * iqr)
    const outliers = scores.filter(s => s < q1 - 1.5 * iqr || s > q3 + 1.5 * iqr)
    
    const avgScore = validScores.reduce((a, b) => a + b, 0) / validScores.length

    return {
      student: sub.student,
      avgScore: Number(avgScore.toFixed(2)),
      count: scores.length,
      outliers: outliers.length
    }
  })

  return NextResponse.json(results)
}
