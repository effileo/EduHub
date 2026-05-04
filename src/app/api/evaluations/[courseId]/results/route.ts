import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { courseId } = await params;

  // We assume the lecturer owns this course. In reality, verify ownership via Course model.

  const evaluations = await prisma.evaluation.findMany({
    where: { courseId }
  })

  const count = evaluations.length

  // Privacy Threshold
  if (count < 5) {
    return NextResponse.json({ protected: true, count })
  }

  // Aggregate data
  let sumContent = 0, sumDelivery = 0, sumPace = 0, sumMaterials = 0, sumSupport = 0
  let positive = 0, neutral = 0, negative = 0
  const scoreDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const feedbackList: string[] = []

  evaluations.forEach(ev => {
    sumContent += ev.contentScore
    sumDelivery += ev.deliveryScore
    sumPace += ev.paceScore
    sumMaterials += ev.materialsScore
    sumSupport += ev.supportScore

    // Overall average for distribution
    const overall = Math.round((ev.contentScore + ev.deliveryScore + ev.paceScore + ev.materialsScore + ev.supportScore) / 5)
    scoreDistribution[overall as keyof typeof scoreDistribution]++

    if (ev.sentiment === 'Positive') positive++
    else if (ev.sentiment === 'Negative') negative++
    else neutral++

    if (ev.feedback) feedbackList.push(ev.feedback)
  })

  const results = {
    protected: false,
    count,
    averages: {
      Content: Number((sumContent / count).toFixed(1)),
      Delivery: Number((sumDelivery / count).toFixed(1)),
      Pace: Number((sumPace / count).toFixed(1)),
      Materials: Number((sumMaterials / count).toFixed(1)),
      Support: Number((sumSupport / count).toFixed(1)),
    },
    overallAverage: Number(((sumContent + sumDelivery + sumPace + sumMaterials + sumSupport) / (5 * count)).toFixed(1)),
    distribution: scoreDistribution,
    sentiment: {
      Positive: Math.round((positive / count) * 100),
      Neutral: Math.round((neutral / count) * 100),
      Negative: Math.round((negative / count) * 100),
    },
    feedback: feedbackList
  }

  return NextResponse.json(results)
}
