import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  if (user.dbUser?.role === 'LECTURER') {
    redirect('/lecturer')
  } else {
    redirect('/student')
  }
}
