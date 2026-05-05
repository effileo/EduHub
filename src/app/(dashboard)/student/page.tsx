"use client"

import { GraduationCap, Users, Clock, AlertCircle, BookOpen, Sparkles, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back, Student!</h1>
          <p className="text-slate-500 font-medium mt-1">Here is what's happening in your courses today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Class</p>
            <p className="text-sm font-bold text-slate-700">CS101 @ 2:00 PM</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/student/attendance" className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <GraduationCap size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-1">Attendance</h3>
          <p className="text-slate-500 font-medium">92% Overall Presence</p>
        </Link>

        <Link href="/student/study-groups" className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <Users size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-1">Study Groups</h3>
          <p className="text-slate-500 font-medium">3 Active Groups</p>
        </Link>

        <Link href="/student/office-hours" className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all">
            <Clock size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-1">Office Hours</h3>
          <p className="text-slate-500 font-medium">1 Professor Online</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={20} className="text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">AI Assistant Tip</span>
              </div>
              <h2 className="text-3xl font-black mb-4 leading-tight">Need help with CS101 exam prep?</h2>
              <p className="text-slate-400 font-medium mb-8 max-w-lg">
                Your AI Study Assistant has indexed the last 3 weeks of lecture notes. Try asking: "Summarize the key concepts of recursion."
              </p>
              <Link href="/courses/CS101/assistant" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-lg">
                Ask Assistant →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <BookOpen size={24} className="text-indigo-600" />
                Recent Resources
              </h3>
              <Link href="/courses/CS101/resources" className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:underline">View All</Link>
            </div>
            <div className="p-4 space-y-2">
              {[
                { title: 'Lecture 12: Binary Trees', week: 'Week 6', type: 'PDF' },
                { title: 'Homework 4: Algorithms', week: 'Week 6', type: 'DOC' },
                { title: 'Study Guide: Midterm', week: 'Week 5', type: 'PDF' }
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-all">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{r.title}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.week}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-md">{r.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <AlertCircle size={24} className="text-red-500" />
              Notifications
            </h3>
            <div className="space-y-6">
              {[
                { text: 'Grade released for Quiz 3', time: '2h ago' },
                { text: 'New reply in Discussion Board', time: '5h ago' },
                { text: 'Upcoming Lab in 30 mins', time: 'Just now' }
              ].map((n, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-1 h-10 bg-indigo-600 rounded-full shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">{n.text}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-xl shadow-indigo-200">
            <h3 className="text-2xl font-black mb-2">Need Help?</h3>
            <p className="text-indigo-100 font-medium mb-8 text-sm">
              Visit the help center or chat with our support team for any technical issues.
            </p>
            <button className="w-full py-4 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-sm transition-all backdrop-blur-md">
              Open Support Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
