"use client"

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { GraduationCap, FileText, CheckCircle2, Clock, Upload, Loader2, AlertCircle } from 'lucide-react'

export default function StudentGradesPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Submission modal state
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      // Get user for GPA
      const userRes = await fetch('/api/auth/me')
      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
      }
      
      const assignRes = await fetch('/api/assignments')
      const assignData = await assignRes.json()
      setAssignments(assignData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetch(`/api/assignments/${selectedAssignment.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl }),
      })
      setSelectedAssignment(null)
      setFileUrl('')
      fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const gradedAssignments = assignments.filter(a => a.submissions?.[0]?.score != null)
  const pendingAssignments = assignments.filter(a => !a.submissions?.length || a.submissions[0].score == null)
  const upcomingDeadlines = pendingAssignments
    .filter(a => new Date(a.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  // Trend chart data (cumulative GPA or just scores over time)
  // For simplicity, we just plot the scores of graded assignments over time
  const trendData = gradedAssignments.map(a => {
    const sub = a.submissions[0]
    return {
      name: a.title,
      score: sub.score ? (sub.score / a.maxScore) * 100 : 0
    }
  })

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Academic Performance</h1>
        <p className="text-slate-500 mt-1 font-medium">Track your grades, GPA, and upcoming deadlines</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-indigo-600 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-indigo-200 mb-2 font-bold uppercase tracking-widest text-xs">
              <GraduationCap size={16} /> Cumulative GPA
            </div>
            <div className="text-5xl font-black">{user?.gpa ? user.gpa.toFixed(2) : 'N/A'}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-slate-400 mb-2 font-bold uppercase tracking-widest text-xs">
            <FileText size={16} /> Total Assignments
          </div>
          <div className="text-4xl font-black text-slate-800">{assignments.length}</div>
        </div>

        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-green-500 mb-2 font-bold uppercase tracking-widest text-xs">
            <CheckCircle2 size={16} /> Graded
          </div>
          <div className="text-4xl font-black text-slate-800">{gradedAssignments.length}</div>
        </div>

        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-amber-500 mb-2 font-bold uppercase tracking-widest text-xs">
            <Clock size={16} /> Pending
          </div>
          <div className="text-4xl font-black text-slate-800">{pendingAssignments.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Trend & Table */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Trend Chart */}
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-6">Grade Progression (%)</h3>
            <div className="h-64">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                  Not enough data to display trend
                </div>
              )}
            </div>
          </div>

          {/* Detailed Assignment Table */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-xl font-black text-slate-800">All Assignments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="p-4 pl-8">Assignment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {assignments.map(a => {
                    const sub = a.submissions?.[0]
                    const isGraded = sub?.score != null
                    const isSubmitted = !!sub
                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-8">
                          <p className="font-bold text-slate-900">{a.title}</p>
                          <p className="text-xs text-slate-500">{a.courseId}</p>
                        </td>
                        <td className="p-4">
                          {isGraded ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg"><CheckCircle2 size={12} /> Graded</span>
                          ) : isSubmitted ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-lg"><Upload size={12} /> Submitted</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-lg"><Clock size={12} /> Pending</span>
                          )}
                        </td>
                        <td className="p-4 font-black">
                          {isGraded ? (
                            <span className={sub.score / a.maxScore >= 0.8 ? 'text-green-600' : sub.score / a.maxScore >= 0.6 ? 'text-amber-600' : 'text-red-600'}>
                              {sub.score} / {a.maxScore}
                            </span>
                          ) : (
                            <span className="text-slate-300">- / {a.maxScore}</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-slate-500">{a.weight}%</td>
                      </tr>
                    )
                  })}
                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No assignments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Clock size={120} />
            </div>
            <h3 className="text-xl font-black mb-6 relative z-10">Upcoming Deadlines</h3>
            
            <div className="space-y-4 relative z-10">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-slate-400 font-medium">You're all caught up!</p>
              ) : (
                upcomingDeadlines.map(a => {
                  const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                  return (
                    <div key={a.id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col gap-3">
                      <div>
                        <p className="text-xs text-indigo-400 font-bold mb-1 uppercase tracking-widest">{a.courseId}</p>
                        <h4 className="font-bold">{a.title}</h4>
                      </div>
                      
                      <div className="flex justify-between items-center mt-auto">
                        <span className={`text-sm font-black px-3 py-1 rounded-lg ${daysLeft <= 2 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                          {daysLeft === 0 ? 'Due Today' : `${daysLeft} days left`}
                        </span>
                        
                        <button
                          onClick={() => setSelectedAssignment(a)}
                          className="w-10 h-10 bg-indigo-500 hover:bg-indigo-400 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Upload size={18} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedAssignment(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Upload size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Submit Assignment</h2>
            <p className="text-slate-500 mb-6 font-medium">
              Submitting for <span className="font-bold text-slate-700">{selectedAssignment.title}</span>
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="text-sm font-bold text-slate-700 mb-2 block">File URL (e.g. Google Drive Link)</label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !fileUrl.trim()}
                  className="flex-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
