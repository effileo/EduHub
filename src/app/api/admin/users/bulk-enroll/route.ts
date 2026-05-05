import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user || user.dbUser?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const text = await file.text()
  const rows = text.split('\n').filter(row => row.trim() !== '')
  
  // Skip header if it exists
  const startIndex = rows[0].includes('email') ? 1 : 0
  
  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (let i = startIndex; i < rows.length; i++) {
    const [email, courseId, roleStr] = rows[i].split(',').map(s => s.trim())
    
    if (!email || !courseId) {
      errors.push(`Row ${i + 1}: Missing email or courseId`)
      skipped++
      continue
    }

    try {
      const role = (roleStr?.toUpperCase() as Role) || Role.STUDENT
      
      // 1. Find or create user
      const targetUser = await prisma.user.upsert({
        where: { email },
        update: {}, // Don't change existing users
        create: {
          email,
          name: email.split('@')[0], // Placeholder name
          role: role,
        }
      })

      // 2. Add to course
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: targetUser.id,
            courseId: courseId
          }
        },
        update: { role }, // Update role if already enrolled
        create: {
          userId: targetUser.id,
          courseId: courseId,
          role: role
        }
      })
      
      created++
    } catch (err: any) {
      errors.push(`Row ${i + 1}: ${err.message}`)
      skipped++
    }
  }

  // Create audit log for bulk enrollment
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'BULK_ENROLL',
      targetModel: 'Enrollment',
      targetId: 'multiple',
      payload: { created, skipped, errorsCount: errors.length },
    },
  })

  return NextResponse.json({ created, skipped, errors })
}
