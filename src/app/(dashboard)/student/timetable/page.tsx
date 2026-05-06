"use client"

import { useState, useEffect } from 'react'
import WeekGrid from '@/components/timetable/WeekGrid'
import { Calendar, Download, ChevronLeft, ChevronRight, Clock, MapPin, Loader2, BookOpen } from 'lucide-react'
import { format, addDays, startOfWeek } from 'date-fns'

export default function StudentTimetablePage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedRes, assignRes] = await Promise.all([
          fetch('/api/schedules'),
          fetch('/api/assignments')
        ])
        setSchedules(await schedRes.json())
        setDeadlines(await assignRes.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const endDate = addDays(startDate, 6)

  const handleExport = () => {
    window.location.href = '/api/schedules/export'
  }

  const upcomingDeadlines = deadlines
    .filter(d => {
      const due = new Date(d.dueDate)
      return due >= startDate && due <= addDays(endDate, 7)
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Weekly Timetable</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your class schedule and upcoming deadlines</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button 
              onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <div className="px-4 py-2 font-black text-sm text-slate-700">
              {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
            </div>
            <button 
              onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95"
          >
            <Download size={20} />
            Export to Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Grid */}
        <div className="lg:col-span-3">
          <WeekGrid schedules={schedules} />
        </div>

        {/* Deadlines Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Calendar size={120} />
            </div>
            <h3 className="text-xl font-black mb-6 relative z-10">Deadlines this Week</h3>
            
            <div className="space-y-4 relative z-10">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-slate-400 font-medium italic">No deadlines for this period.</p>
              ) : (
                upcomingDeadlines.map(d => (
                  <div key={d.id} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">{d.courseId}</p>
                    <p className="font-bold text-sm mb-2">{d.title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={12} />
                      {format(new Date(d.dueDate), 'EEE, MMM d • HH:mm')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-4">Quick Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Classes</p>
                  <p className="font-black text-slate-800">{schedules.length}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Room</p>
                  <p className="font-black text-slate-800">L-204</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
