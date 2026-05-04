"use client"

import { useState, useEffect } from 'react'
import { Plus, Users, Clock, ArrowRight, Download, Eye, Power, Loader2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function LecturerAttendancePage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/lab-sessions')
      const data = await res.json()
      setSessions(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/lab-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseName }),
      })
      if (res.ok) {
        setIsModalOpen(false)
        setCourseName('')
        fetchSessions()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const toggleSession = async (id: string, currentActive: boolean) => {
    try {
      await fetch(`/api/lab-sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      })
      fetchSessions()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lab Attendance</h1>
          <p className="text-slate-500 mt-1">Manage and track student check-ins in real-time</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={20} />
          New Lab Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
          ))
        ) : sessions.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-16 text-center border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Lab Sessions Found</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Create your first lab session to start tracking student attendance with QR codes.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div 
              key={session.id}
              className={`group bg-white rounded-3xl border transition-all hover:shadow-xl ${
                session.active ? 'border-indigo-100' : 'border-slate-100 opacity-80'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    session.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {session.active ? '● Active' : '○ Closed'}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock size={12} />
                    {format(new Date(session.createdAt), 'MMM d, h:mm a')}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {session.courseId}
                </h3>
                
                <div className="flex items-center gap-4 mt-6">
                  <div className="bg-slate-50 rounded-2xl p-3 flex-1 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Code</p>
                    <p className="text-lg font-mono font-bold text-slate-700 tracking-wider">{session.code}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-2xl p-3 flex-1 border border-indigo-100">
                    <p className="text-[10px] text-indigo-400 font-bold uppercase mb-1">Attendees</p>
                    <p className="text-lg font-bold text-indigo-700">{session._count.attendances}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/50 rounded-b-3xl border-t border-slate-100 flex items-center gap-2">
                <Link
                  href={`/lecturer/attendance/${session.id}`}
                  className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex-1 flex justify-center items-center gap-2 text-sm font-semibold"
                >
                  <Eye size={16} />
                  View
                </Link>
                <button
                  onClick={() => toggleSession(session.id, session.active)}
                  className={`p-2.5 rounded-xl transition-all flex-1 flex justify-center items-center gap-2 text-sm font-semibold ${
                    session.active 
                      ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white' 
                      : 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  <Power size={16} />
                  {session.active ? 'Close' : 'Open'}
                </button>
                <a
                  href={`/api/lab-sessions/export/${session.id}`}
                  className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
                  title="Export CSV"
                >
                  <Download size={16} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleCreateSession}>
              <div className="p-8">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen size={28} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Lab Session</h2>
                <p className="text-slate-500 mb-6">Enter the course name to generate a unique attendance code and QR.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">Course Name</label>
                    <input
                      type="text"
                      required
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="e.g. CS101 - Computer Science"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
                >
                  {creating ? <Loader2 className="animate-spin" size={20} /> : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
