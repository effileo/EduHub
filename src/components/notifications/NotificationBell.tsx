"use client"

import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?page=1')
      const data = await res.json()
      setNotifications(data)
      setUnreadCount(data.filter((n: any) => !n.isRead).length)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkRead = async (id: string, link?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      fetchNotifications()
      if (link) {
        setIsOpen(false)
        router.push(link)
      }
    } catch (err) {
      console.error('Failed to mark read', err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/50 border border-slate-200 hover:bg-white hover:border-indigo-300 transition-all text-slate-600 hover:text-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            <Link 
              href="/notifications" 
              className="text-xs text-indigo-600 hover:underline font-medium"
              onClick={() => setIsOpen(false)}
            >
              View all
            </Link>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <Bell className="mx-auto mb-3 opacity-20" size={32} />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleMarkRead(n.id, n.link)}
                  className="w-full p-4 flex gap-3 text-left hover:bg-indigo-50/50 transition-colors border-b border-slate-50 last:border-0 relative group"
                >
                  {!n.isRead && (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className={`text-sm font-semibold ${n.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {n.body}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <button 
              className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              onClick={async () => {
                // Implementation for mark all read could go here or via API
                setIsOpen(false)
              }}
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
