"use client"

import { GraduationCap, Users, Clock, Plus, BarChart3, Settings, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function LecturerDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Lecturer Control Panel</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your courses, students, and active sessions.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/lecturer/attendance" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <Plus size={20} />
            New Lab Session
          </Link>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Students', value: '412', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Active Labs', value: '3', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Queue Length', value: '8', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { title: 'Average Score', value: '74%', icon: BarChart3, color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.title}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Active Sessions */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">Active Lab Sessions</h3>
              <Link href="/lecturer/attendance" className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:underline">Manage All</Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { course: 'CS101', section: 'Lab B', code: '849 201', time: 'Ends in 45m' },
                  { course: 'CS101', section: 'Lab A', code: 'EXPIRED', time: 'Completed' }
                ].map((lab, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                        <GraduationCap size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{lab.course} - {lab.section}</p>
                        <p className="text-xs text-slate-400 font-medium">{lab.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Access Code</p>
                      <p className={`text-xl font-black ${lab.code === 'EXPIRED' ? 'text-slate-300' : 'text-indigo-600'}`}>{lab.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:scale-150 transition-transform" />
              <h3 className="text-2xl font-black mb-2">Office Hours</h3>
              <p className="text-indigo-100 mb-6 text-sm font-medium">Open your queue to start meeting with students.</p>
              <Link href="/lecturer/office-hours" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-xs">
                Open Queue <ExternalLink size={14} />
              </Link>
            </div>
            
            <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:scale-150 transition-transform" />
              <h3 className="text-2xl font-black mb-2">Evaluations</h3>
              <p className="text-slate-400 mb-6 text-sm font-medium">Review anonymous feedback from your courses.</p>
              <Link href="/lecturer/evaluations" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs">
                View Feedback <BarChart3 size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Settings size={24} className="text-slate-400" />
              Settings
            </h3>
            <div className="space-y-4">
              <button className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl transition-all font-bold text-slate-700 text-sm">Course Management</button>
              <button className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl transition-all font-bold text-slate-700 text-sm">Notification Preferences</button>
              <button className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl transition-all font-bold text-slate-700 text-sm">Office Hour Availability</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
