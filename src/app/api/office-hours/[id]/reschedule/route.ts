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

  const { id } = await params

  const existingEntry = await prisma.officeHourQueue.findUnique({
    where: { id }
  })

  if (!existingEntry || existingEntry.studentId !== user.id) {
    return new NextResponse('Not Found or Unauthorized', { status: 404 })
  }

  // Get max position for this lecturer
  const maxPositionResult = await prisma.officeHourQueue.aggregate({
    where: { 
      lecturerId: existingEntry.lecturerId, 
      status: { in: ['WAITING', 'ACTIVE'] } 
    },
    _max: { position: true },
  })
  
  const currentMax = maxPositionResult._max.position || 0
  const newPosition = currentMax + 1

  const updatedEntry = await prisma.officeHourQueue.update({
    where: { id },
    data: { position: newPosition },
  })

  return NextResponse.json(updatedEntry)
}
