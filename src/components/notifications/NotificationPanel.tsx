"use client"

import { useState, useEffect } from 'react'
import { Bell, Search, Filter, CheckCircle2, Clock } from 'lucide-react'
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns'

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.isRead
  )

  const groupedNotifications = filteredNotifications.reduce((acc: any, n: any) => {
    const date = new Date(n.createdAt)
    let label = 'Earlier'
    if (isToday(date)) label = 'Today'
    else if (isYesterday(date)) label = 'Yesterday'
    else label = format(date, 'MMMM d, yyyy')

    if (!acc[label]) acc[label] = []
    acc[label].push(n)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">Stay updated with your academic activities</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === 'unread' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : Object.keys(groupedNotifications).length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No notifications found</h2>
          <p className="text-slate-500">You're all caught up! New updates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedNotifications).map(([label, items]: [string, any]) => (
            <div key={label}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1 flex items-center gap-2">
                <Clock size={12} />
                {label}
              </h2>
              <div className="space-y-3">
                {items.map((n: any) => (
                  <div
                    key={n.id}
                    className={`group relative bg-white rounded-2xl p-5 border transition-all hover:shadow-md hover:border-indigo-200 flex items-start gap-4 ${
                      n.isRead ? 'border-slate-100 opacity-80' : 'border-indigo-100 shadow-sm'
                    }`}
                  >
                    {!n.isRead && (
                      <span className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-1.5 h-12 bg-indigo-500 rounded-r-full" />
                    )}
                    <div className={`p-3 rounded-xl shrink-0 ${
                      n.isRead ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      <Bell size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <h3 className={`font-bold leading-tight ${n.isRead ? 'text-slate-600' : 'text-slate-900 text-lg'}`}>
                          {n.title}
                        </h3>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {format(new Date(n.createdAt), 'h:mm a')}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${n.isRead ? 'text-slate-500' : 'text-slate-600'}`}>
                        {n.body}
                      </p>
                      {n.link && (
                        <a 
                          href={n.link} 
                          className="inline-flex items-center text-xs font-bold text-indigo-600 mt-4 group-hover:underline gap-1"
                        >
                          View Details
                          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </a>
                      )}
                    </div>
                    {!n.isRead && (
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-indigo-600">
                        <CheckCircle2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
