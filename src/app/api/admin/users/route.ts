import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') as Role | null
  const query = searchParams.get('query') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  const where: any = {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ],
  }

  if (role && Object.values(Role).includes(role)) {
    where.role = role
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    users,
    total,
    pages: Math.ceil(total / limit),
  })
}

export async function PATCH(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { userId, role } = await request.json()

  if (!Object.values(Role).includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  // Create audit log
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'UPDATE_ROLE',
      targetModel: 'User',
      targetId: userId,
      payload: { oldRole: updatedUser.role, newRole: role },
    },
  })

  return NextResponse.json(updatedUser)
}
