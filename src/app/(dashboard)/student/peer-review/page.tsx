"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ClipboardCheck, ArrowRight, Loader2, Clock, CheckCircle2 } from 'lucide-react'

export default function StudentPeerReviewPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/assignments')
      .then(res => res.json())
      .then(data => {
        // Filter for peer-review assignments that have been distributed
        setAssignments(data.filter((a: any) => a.isPeerReviewed))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">Peer Review Tasks</h1>
        <p className="text-slate-500 mt-1 font-medium">Review your classmates' submissions and provide helpful feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-slate-200 border-dashed rounded-[40px] p-16 text-center text-slate-400 font-bold">
            No peer review tasks available yet.
          </div>
        ) : (
          assignments.map(a => (
            <Link 
              key={a.id}
              href={`/student/peer-review/${a.id}`}
              className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <ClipboardCheck size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 text-slate-500 rounded-lg">
                  {a.courseId}
                </span>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2">{a.title}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-8">
                <Clock size={16} />
                Due {new Date(a.dueDate).toLocaleDateString()}
              </div>
              
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <CheckCircle2 size={16} className="text-green-500" />
                  Help your peers improve
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
