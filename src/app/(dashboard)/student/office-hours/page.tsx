"use client"

import { useState, useEffect } from 'react'
import { useQueue } from '@/components/office-hours/QueueProvider'
import { Video, Clock, X, RotateCcw, AlertCircle, Send, Loader2 } from 'lucide-react'

import QueueProvider from '@/components/office-hours/QueueProvider'

export default function StudentOfficeHoursPage() {
  return (
    <QueueProvider>
      <StudentOfficeHours />
    </QueueProvider>
  )
}

function StudentOfficeHours() {
  const { queue, refreshQueue } = useQueue()
  const [lecturers, setLecturers] = useState<any[]>([])
  const [selectedLecturer, setSelectedLecturer] = useState<any>(null)
  const [topic, setTopic] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    fetch('/api/lecturers')
      .then(res => res.json())
      .then(data => setLecturers(data))
  }, [])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsJoining(true)
    try {
      await fetch('/api/office-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lecturerId: selectedLecturer.id, topic }),
      })
      setSelectedLecturer(null)
      setTopic('')
      refreshQueue()
    } catch (err) {
      console.error(err)
    } finally {
      setIsJoining(false)
    }
  }

  const handleCancel = async (id: string) => {
    await fetch(`/api/office-hours/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    })
    refreshQueue()
  }

  const handleReschedule = async (id: string) => {
    await fetch(`/api/office-hours/${id}/reschedule`, { method: 'POST' })
    refreshQueue()
  }

  const activeEntry = queue.find(q => q.status === 'ACTIVE')
  const waitingEntries = queue.filter(q => q.status === 'WAITING')

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">Office Hours</h1>
        <p className="text-slate-500 mt-1 font-medium">Join a queue to get 1-on-1 help from your lecturers</p>
      </div>

      {activeEntry && (
        <div className="bg-indigo-600 rounded-[40px] shadow-2xl p-8 relative overflow-hidden animate-in zoom-in-95 duration-500 border-4 border-indigo-200">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img 
                  src={activeEntry.lecturer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeEntry.lecturer.name)}`} 
                  alt={activeEntry.lecturer.name} 
                  className="w-20 h-20 rounded-3xl bg-indigo-500 ring-4 ring-indigo-400 shadow-xl"
                />
                <span className="absolute -top-2 -right-2 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-indigo-600"></span>
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-black mb-1">It's Your Turn!</h2>
                <p className="text-indigo-200 font-medium">{activeEntry.lecturer.name} is ready for you to discuss: <span className="font-bold text-white">{activeEntry.topic}</span></p>
              </div>
            </div>
            
            {activeEntry.meetingLink ? (
              <a 
                href={activeEntry.meetingLink} 
                target="_blank" 
                rel="noreferrer"
                className="w-full md:w-auto px-8 py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 active:scale-95"
              >
                <Video size={24} />
                Join Meeting Now
              </a>
            ) : (
              <div className="px-6 py-3 bg-indigo-500/50 rounded-2xl border border-indigo-400/30 flex items-center gap-2 text-indigo-100">
                <Loader2 className="animate-spin" size={18} />
                Waiting for meeting link...
              </div>
            )}
          </div>
        </div>
      )}

      {waitingEntries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Your Active Queues</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {waitingEntries.map((entry) => {
              // Fake position index since we don't have the full queue logic for the student easily accessible here without more APIs.
              // For a real app, the API would return the student's exact position index. 
              // We will just use the entry's position field directly if it exists, though absolute position might not mean "index in line".
              return (
                <div key={entry.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => handleReschedule(entry.id)} className="p-2 bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-xl transition-colors" title="Move to back">
                      <RotateCcw size={16} />
                    </button>
                    <button onClick={() => handleCancel(entry.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-colors" title="Cancel Request">
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={entry.lecturer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.lecturer.name)}`} 
                      alt={entry.lecturer.name} 
                      className="w-12 h-12 rounded-2xl bg-slate-100"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900">{entry.lecturer.name}</h3>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">{entry.topic}</p>
                    </div>
                  </div>
                  
                  <div className="flex bg-slate-50 rounded-2xl p-4 gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</p>
                      <p className="font-bold text-amber-600 flex items-center gap-1"><Clock size={14} /> Waiting</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Available Lecturers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lecturers.map((lecturer) => (
            <div key={lecturer.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center text-center hover:shadow-lg transition-all hover:border-indigo-100 group">
              <img 
                src={lecturer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(lecturer.name)}`} 
                alt={lecturer.name} 
                className="w-24 h-24 rounded-[32px] bg-slate-100 mb-4 group-hover:scale-105 transition-transform shadow-sm"
              />
              <h3 className="font-bold text-slate-900 text-lg mb-1">{lecturer.name}</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">Office Hours Available</p>
              
              <button
                onClick={() => setSelectedLecturer(lecturer)}
                className="w-full py-3 bg-slate-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
              >
                Join Queue
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Join Modal */}
      {selectedLecturer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedLecturer(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Join {selectedLecturer.name}'s Queue</h2>
            <p className="text-slate-500 mb-6 font-medium">Briefly describe what you'd like to discuss so the lecturer can prepare.</p>
            
            <form onSubmit={handleJoin}>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Question about Assignment 3"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none h-32 mb-6 text-slate-700"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLecturer(null)}
                  className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining || !topic.trim()}
                  className="flex-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isJoining ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} className="mr-2" /> Confirm</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
