import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { markRead } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip,
  })

  return NextResponse.json(notifications)
}

export async function PATCH(request: NextRequest) {
  const user = await getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { id } = await request.json()
  await markRead(id)

  return new NextResponse('OK', { status: 200 })
}
