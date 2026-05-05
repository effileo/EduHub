import prisma from './prisma'

export async function calculateGPA(studentId: string): Promise<void> {
  // Fetch all graded submissions for the student, including the assignment details for maxScore and weight
  const submissions = await prisma.submission.findMany({
    where: {
      studentId: studentId,
      score: { not: null }
    },
    include: {
      assignment: true
    }
  })

  if (submissions.length === 0) {
    // If no graded submissions, maybe reset or leave alone? We will set it to null.
    await prisma.user.update({
      where: { id: studentId },
      data: { gpa: null }
    })
    return
  }

  let totalWeightedScore = 0
  let totalWeights = 0

  for (const sub of submissions) {
    if (sub.score !== null && sub.assignment.maxScore > 0) {
      const weight = sub.assignment.weight
      const percentage = sub.score / sub.assignment.maxScore
      totalWeightedScore += percentage * weight
      totalWeights += weight
    }
  }

  if (totalWeights === 0) return

  // GPA on a 4.0 scale based on weighted average percentage
  // 100% = 4.0, 90% = 3.6, etc. Or just raw weighted percentage * 4.0
  const weightedAveragePercentage = totalWeightedScore / totalWeights
  const gpa = Number((weightedAveragePercentage * 4.0).toFixed(2))

  // Update user
  await prisma.user.update({
    where: { id: studentId },
    data: { gpa }
  })
}
