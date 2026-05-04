"use client"

import { useState } from 'react'
import { useQueue } from '@/components/office-hours/QueueProvider'
import { CheckCircle2, Play, Link as LinkIcon, User, Save, Loader2, ListVideo } from 'lucide-react'

import QueueProvider from '@/components/office-hours/QueueProvider'

export default function LecturerOfficeHoursPage() {
  return (
    <QueueProvider>
      <LecturerOfficeHours />
    </QueueProvider>
  )
}

function LecturerOfficeHours() {
  const { queue, refreshQueue } = useQueue()
  const [meetingLink, setMeetingLink] = useState('')
  const [isUpdatingLink, setIsUpdatingLink] = useState(false)

  const handleUpdateStatus = async (id: string, status: 'ACTIVE' | 'COMPLETED') => {
    await fetch(`/api/office-hours/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, meetingLink }),
    })
    refreshQueue()
  }

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingLink(true)
    // Here we could save the link to the lecturer's profile, but for now we just hold it in state
    // and send it with every "Admit Next" request so the student receives it.
    setTimeout(() => setIsUpdatingLink(false), 500)
  }

  const activeEntry = queue.find(q => q.status === 'ACTIVE')
  const waitingEntries = queue.filter(q => q.status === 'WAITING')

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Queue Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your virtual office hours</p>
        </div>
        
        <form onSubmit={handleSaveLink} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="Your Zoom/Meet Link"
              required
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium text-slate-700"
            />
          </div>
          <button
            type="submit"
            className="px-6 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
          >
            {isUpdatingLink ? <Loader2 className="animate-spin" size={20} /> : 'Save Link'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Session Area */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative min-h-[400px] flex flex-col">
            <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-amber-500 to-orange-500" />
            <div className="p-8 border-b border-slate-50">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <ListVideo size={24} className="text-amber-500" />
                Current Session
              </h2>
            </div>
            
            <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
              {activeEntry ? (
                <div className="w-full animate-in zoom-in-95 duration-300">
                  <img 
                    src={activeEntry.student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeEntry.student.name)}`} 
                    alt={activeEntry.student.name} 
                    className="w-24 h-24 rounded-full mx-auto mb-6 bg-slate-100 ring-4 ring-amber-100 shadow-xl"
                  />
                  <h3 className="text-2xl font-black text-slate-900 mb-1">{activeEntry.student.name}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">is in your office</p>
                  
                  <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-8 w-full text-left">
                    <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2">Topic</p>
                    <p className="font-medium text-amber-900">{activeEntry.topic}</p>
                  </div>
                  
                  <button
                    onClick={() => handleUpdateStatus(activeEntry.id, 'COMPLETED')}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-xl shadow-amber-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 size={20} />
                    Complete Session
                  </button>
                </div>
              ) : (
                <div className="text-slate-400">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User size={40} className="opacity-20" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-500 mb-2">No Active Session</h3>
                  <p className="text-sm font-medium">Admit a student from the queue to start.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* The Queue */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900">Waiting Line</h2>
              <div className="px-4 py-1.5 bg-indigo-100 text-indigo-700 font-black rounded-full text-sm">
                {waitingEntries.length} Waiting
              </div>
            </div>
            
            <div className="p-4">
              {waitingEntries.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <p className="font-medium">The queue is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {waitingEntries.map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-black rounded-2xl flex items-center justify-center">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{entry.student.name}</p>
                          <p className="text-xs font-medium text-slate-500 line-clamp-1 max-w-[200px] sm:max-w-xs">{entry.topic}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleUpdateStatus(entry.id, 'ACTIVE')}
                        disabled={!!activeEntry || !meetingLink}
                        className="px-6 py-3 bg-white border-2 border-indigo-100 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        title={!meetingLink ? 'Set a meeting link first' : !!activeEntry ? 'Complete current session first' : 'Admit student'}
                      >
                        <Play size={16} className="fill-current" />
                        Admit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
