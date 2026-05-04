import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  })

  return { ...user, dbUser }
}

export async function getUserOrRedirect() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}
