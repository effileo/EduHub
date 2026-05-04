import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import QRCode from 'qrcode'
import { addMinutes } from 'date-fns'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { courseId, lateThreshold = 15 } = await request.json()

  // Generate 6-char alphanumeric code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  // Generate QR Code as base64
  const qrCodeDataUrl = await QRCode.toDataURL(code)

  const expiresAt = addMinutes(new Date(), 90)

  const labSession = await prisma.labSession.create({
    data: {
      code,
      courseId,
      lecturerId: user.id,
      expiresAt,
      lateThreshold,
      qrCode: qrCodeDataUrl,
    },
  })

  return NextResponse.json(labSession)
}

export async function GET() {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'LECTURER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const labSessions = await prisma.labSession.findMany({
    where: { lecturerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { attendances: true },
      },
    },
  })

  return NextResponse.json(labSessions)
}
