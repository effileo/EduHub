import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function confirmUser(email: string) {
  try {
    console.log(`Attempting to confirm email for ${email}...`)
    // Using raw SQL to update the internal Supabase auth table
    // Note: This requires the database user to have permissions on the 'auth' schema
    const result = await prisma.$executeRawUnsafe(
      `UPDATE auth.users SET email_confirmed_at = NOW(), confirmed_at = NOW() WHERE email = $1`,
      email
    )

    if (result > 0) {
      console.log('User confirmed successfully!')
    } else {
      console.log('User not found or already confirmed.')
    }
  } catch (err) {
    console.error('Failed to confirm user:', err)
  } finally {
    await prisma.$disconnect()
  }
}

confirmUser('fitaalemayehu12@gmail.com')
