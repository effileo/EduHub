import prisma from './prisma'
import { NotificationType } from '@prisma/client'

export async function notify(userId: string, payload: {
  type: NotificationType,
  title: string,
  body: string,
  link?: string
}) {
  await prisma.notification.create({
    data: {
      userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      link: payload.link,
    },
  })
}

export async function markRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })
}

export async function getUnreadCount(userId: string) {
  return await prisma.notification.count({
    where: { userId, read: false },
  })
}
