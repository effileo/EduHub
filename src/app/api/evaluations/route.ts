import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

// Simple sentiment analysis helper
function getSentiment(text: string): string {
  if (!text) return 'Neutral'
  const lower = text.toLowerCase()
  const positive = ['great', 'good', 'excellent', 'amazing', 'helpful', 'clear', 'love', 'best']
  const negative = ['bad', 'poor', 'terrible', 'confusing', 'hard', 'unhelpful', 'worst', 'boring']
  
  let score = 0
  positive.forEach(word => { if (lower.includes(word)) score++ })
  negative.forEach(word => { if (lower.includes(word)) score-- })
  
  if (score > 0) return 'Positive'
  if (score < 0) return 'Negative'
  return 'Neutral'
}

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'STUDENT') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { 
    courseId, 
    contentScore, 
    deliveryScore, 
    paceScore, 
    materialsScore, 
    supportScore, 
    feedback 
  } = await request.json()

  // Validate inputs
  if (!courseId || !contentScore || !deliveryScore || !paceScore || !materialsScore || !supportScore) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Generate unique submission token
  const semester = 'Spring2026' // Hardcoded for this demo, would normally come from app config
  const rawToken = `${user.id}-${courseId}-${semester}`
  const submissionToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  // Check if already submitted
  const existing = await prisma.evaluation.findUnique({
    where: { submissionToken }
  })

  if (existing) {
    return NextResponse.json({ error: 'Evaluation already submitted for this course' }, { status: 409 })
  }

  // Determine basic sentiment from feedback
  const sentiment = getSentiment(feedback || '')

  // Create evaluation (Notice: submitterId is intentionally omitted to preserve anonymity)
  const evaluation = await prisma.evaluation.create({
    data: {
      courseId,
      submissionToken,
      contentScore,
      deliveryScore,
      paceScore,
      materialsScore,
      supportScore,
      feedback: feedback || null,
      sentiment
    }
  })

  // We don't return the full evaluation to avoid leaking the token to the client unnecessarily
  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'STUDENT') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // In a real app, we'd query the student's enrolled courses.
  // Here, we'll return a static list of their courses and map which ones they've evaluated.
  const enrolledCourses = ['CS101 - Comp Sci', 'MATH202 - Calc', 'ENG303 - Lit']
  
  const semester = 'Spring2026'
  const statuses = await Promise.all(enrolledCourses.map(async (courseId) => {
    const rawToken = `${user.id}-${courseId}-${semester}`
    const submissionToken = crypto.createHash('sha256').update(rawToken).digest('hex')
    
    const existing = await prisma.evaluation.findUnique({
      where: { submissionToken }
    })
    
    return {
      courseId,
      status: existing ? 'Submitted' : 'Not Started'
    }
  }))

  return NextResponse.json(statuses)
}
