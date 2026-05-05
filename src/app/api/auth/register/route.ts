import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { id, email, name, role } = await request.json()

  if (!id || !email || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const user = await prisma.user.upsert({
      where: { id },
      update: { name, email, role },
      create: { id, email, name, role }
    })

    return NextResponse.json(user)
  } catch (err: any) {
    console.error('Registration failed:', err)
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 })
  }
}
