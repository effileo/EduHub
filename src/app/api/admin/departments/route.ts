import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Count lecturers and courses per department
  const departments = await prisma.department.findMany()
  
  // Since Department is simple, we might want to manually count or 
  // if there's a relation we'd use include.
  // But the schema shows Department has no relations.
  // We'll return them as is for now.
  
  return NextResponse.json(departments)
}

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { name, institutionId, adminId } = await request.json()

  const department = await prisma.department.create({
    data: { name, institutionId, adminId },
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'CREATE_DEPARTMENT',
      targetModel: 'Department',
      targetId: department.id,
      payload: { name },
    },
  })

  return NextResponse.json(department)
}
