import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  if (!email) return new NextResponse('Email required', { status: 400 })

  try {
    // Manually force confirm the user in Supabase auth table
    await prisma.$executeRawUnsafe(
      `UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = $1`,
      email
    )
    
    return NextResponse.json({ message: `User ${email} confirmed. You can now login.` })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
