import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const lecturers = await prisma.user.findMany({
    where: { role: 'LECTURER' },
    select: { id: true, name: true, email: true, avatar: true },
  })
  
  return NextResponse.json(lecturers)
}
