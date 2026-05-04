import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Supabase Seeding...')

  // Clean up existing data to prevent conflict
  await prisma.officeHourQueue.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.labSession.deleteMany()
  await prisma.evaluation.deleteMany()
  await prisma.studyGroup.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Core Users (Auth matching)
  // Note: These should match your actual Supabase Auth emails if using combined Supabase Auth.
  const student = await prisma.user.create({
    data: {
      id: 'S-001',
      email: 'student@eduhub.edu',
      name: 'Alex Student',
      role: 'STUDENT',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
    },
  })

  const lecturer = await prisma.user.create({
    data: {
      id: 'L-001',
      email: 'lecturer@eduhub.edu',
      name: 'Dr. Alan Turing',
      role: 'LECTURER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lecturer',
    },
  })

  console.log('✅ Created User records (Alex & Dr. Turing)')

  // 2. Create sample Lab Sessions
  const session1 = await prisma.labSession.create({
    data: {
      course: 'Software Engineering (CS400)',
      code: '4912',
      active: true,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Appears active for 1 hour
      lecturerId: lecturer.id,
    },
  })

  const session2 = await prisma.labSession.create({
    data: {
      course: 'Data Structures (CS301)',
      code: '8821',
      active: false,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
      lecturerId: lecturer.id,
    },
  })

  console.log('✅ Created mock Lab Sessions')

  // 3. Create Sample Attendances for student
  await prisma.attendance.create({
    data: {
      studentId: student.id,
      sessionId: session2.id,
      status: 'Missed',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Created mock Attendance history')

  // 4. Create dummy live queue
  await prisma.officeHourQueue.createMany({
    data: [
      { topic: 'Assignment 3 Clarification', studentId: student.id, lecturerId: lecturer.id, status: 'WAITING' },
    ]
  })

  console.log('✅ Created mock Office Hours Queue entries')

  // 5. Create Study Groups
  await prisma.studyGroup.createMany({
    data: [
      { course: 'Software Engineering (CS400)', title: 'Sprint 3 Prep', time: 'Tomorrow, 4 PM', tags: ['Backend', 'Express'], members: 4 },
      { course: 'Data Structures (CS301)', title: 'Tree Traversals review', time: 'Friday, 1 PM', tags: ['C++', 'Graphs'], members: 2 },
    ]
  })

  console.log('✅ Created mock Study Groups')

  // 6. Create Anonymous Evaluations
  await prisma.evaluation.createMany({
    data: [
      { course: 'Software Engineering (CS400)', rating: 5, feedback: 'Excellent teaching methodology. The real-world examples used in class really helped solidify my understanding.' },
      { course: 'Data Structures (CS301)', rating: 4, feedback: 'Great class but the workload is a bit heavy towards the final weeks.' },
      { course: 'Web Technologies (CS405)', rating: 5, feedback: 'Simply the best module this semester. Very interactive.' },
    ]
  })

  console.log('✅ Created mock Anonymous Evaluations')

  console.log('🎉 Database correctly seeded for EduHub Connect!')
}

main()
  .catch((e) => {
    console.error('❌ SEED ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
