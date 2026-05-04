import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { id } = await params;

  const labSession = await prisma.labSession.findUnique({
    where: { id },
    include: {
      attendances: {
        include: {
          student: {
            select: { name: true, email: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return NextResponse.json(labSession)
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
  const { active } = await request.json()

  const updated = await prisma.labSession.update({
    where: { id },
    data: { active },
  })

  return NextResponse.json(updated)
}
