"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { QrCode, Users, Clock, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function LabSessionDetailPage() {
  const params = useParams()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/lab-sessions/${params.id}`)
      const data = await res.json()
      setSession(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
    const interval = setInterval(fetchSession, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [params.id])

  if (loading && !session) return <div className="flex items-center justify-center min-h-[400px]"><RefreshCw className="animate-spin text-indigo-500" size={40} /></div>

  return (
    <div className="max-w-7xl mx-auto">
      <Link 
        href="/lecturer/attendance" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Session Code & QR Card */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-indigo-500 to-blue-500" />
            <div className="p-10 text-center">
              <h1 className="text-4xl font-black text-slate-900 mb-2">{session.courseId}</h1>
              <p className="text-slate-500 mb-8 flex items-center justify-center gap-2 font-medium">
                <Clock size={16} />
                Session started at {format(new Date(session.createdAt), 'h:mm a')}
              </p>

              <div className="relative group mx-auto w-64 h-64 mb-10">
                <div className="absolute inset-0 bg-indigo-500 rounded-[30px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative bg-white p-4 rounded-[32px] border-4 border-indigo-50 shadow-inner">
                  {session.qrCode && (
                    <img 
                      src={session.qrCode} 
                      alt="Session QR Code" 
                      className="w-full h-full object-contain rounded-2xl"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Join with Code</p>
                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200">
                  <span className="text-6xl font-black text-slate-800 tracking-[0.2em] font-mono select-all">
                    {session.code}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <Users size={18} className="text-indigo-500" />
                {session.attendances.length} Students Checked-in
              </div>
              <div className={`px-4 py-2 rounded-xl text-xs font-bold ${
                session.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {session.active ? 'Session Active' : 'Session Closed'}
              </div>
            </div>
          </div>
        </div>

        {/* Live Attendance List */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 min-h-[600px] flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                Live Feed
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {session.attendances.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 text-slate-400">
                  <Users size={64} className="mb-6 opacity-10" />
                  <p className="text-lg font-bold">Waiting for students...</p>
                  <p className="text-sm">Students will appear here as they scan the code.</p>
                </div>
              ) : (
                session.attendances.map((a: any) => (
                  <div 
                    key={a.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all group animate-in slide-in-from-right-4 duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={a.student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.student.name)}&background=random`} 
                          alt={a.student.name} 
                          className="w-12 h-12 rounded-2xl bg-white shadow-sm ring-2 ring-white"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                          a.status === 'PRESENT' ? 'bg-green-500' : 'bg-amber-500'
                        }`}>
                          {a.status === 'PRESENT' ? <CheckCircle2 size={12} className="text-white" /> : <AlertCircle size={12} className="text-white" />}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{a.student.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{a.student.email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-xs font-black uppercase tracking-widest ${
                        a.status === 'PRESENT' ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {a.status}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {format(new Date(a.createdAt), 'h:mm:ss a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
