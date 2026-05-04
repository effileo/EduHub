"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type QueueContextType = {
  queue: any[]
  fetchQueue: () => Promise<void>
  refreshQueue: () => void
}

const QueueContext = createContext<QueueContextType>({
  queue: [],
  fetchQueue: async () => {},
  refreshQueue: () => {},
})

export const useQueue = () => useContext(QueueContext)

export default function QueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<any[]>([])
  const supabase = createClient()

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/office-hours')
      if (res.ok) {
        const data = await res.json()
        setQueue(data)
      }
    } catch (err) {
      console.error('Failed to fetch queue', err)
    }
  }

  const refreshQueue = () => {
    fetchQueue()
  }

  useEffect(() => {
    fetchQueue()

    // Subscribe to changes on the OfficeHourQueue table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'OfficeHourQueue',
        },
        (payload) => {
          console.log('Realtime change received!', payload)
          fetchQueue() // Refetch fully to ensure relations are loaded
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <QueueContext.Provider value={{ queue, fetchQueue, refreshQueue }}>
      {children}
    </QueueContext.Provider>
  )
}
