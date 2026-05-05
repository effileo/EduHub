"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react'

export default function LecturerGradesOverview() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/assignments')
      .then(res => res.json())
      .then(data => setAssignments(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Group assignments by courseId
  const grouped = assignments.reduce((acc, curr) => {
    if (!acc[curr.courseId]) acc[curr.courseId] = []
    acc[curr.courseId].push(curr)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Assignment Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Create assignments and grade student submissions</p>
        </div>
        
        {/* Normally a modal for creation, kept simple here */}
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:scale-[1.02] active:scale-95">
          <Plus size={20} />
          New Assignment
        </button>
      </div>

      {loading ? (
        <div className="space-y-8">
          {[1, 2].map(i => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-[32px]" />)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-[40px] p-16 text-center text-slate-400">
          <p className="font-bold text-lg">No assignments created yet.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([courseId, courseAssignments]) => (
            <div key={courseId}>
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-3 h-8 bg-indigo-500 rounded-full inline-block" />
                {courseId}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courseAssignments.map(assignment => {
                  const subCount = assignment._count.submissions
                  // Simple calculation for average score
                  const gradedSubs = assignment.submissions.filter((s: any) => s.score != null)
                  const avgScore = gradedSubs.length > 0 
                    ? gradedSubs.reduce((acc: number, curr: any) => acc + curr.score, 0) / gradedSubs.length
                    : null

                  return (
                    <div key={assignment.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-xl hover:border-indigo-100 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{assignment.title}</h3>
                        <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-lg whitespace-nowrap">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-[40px]">
                        {assignment.description || 'No description provided.'}
                      </p>
                      
                      <div className="flex items-center gap-4 mb-6 text-sm font-bold">
                        <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">
                          <Users size={16} />
                          {subCount} Submissions
                        </div>
                        {avgScore !== null ? (
                          <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">
                            <CheckCircle2 size={16} />
                            Avg: {avgScore.toFixed(1)}/{assignment.maxScore}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">
                            <AlertCircle size={16} />
                            Needs Grading
                          </div>
                        )}
                      </div>
                      
                      <Link
                        href={`/lecturer/grades/${assignment.id}`}
                        className="mt-auto w-full py-3 bg-slate-50 text-indigo-600 font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all"
                      >
                        Grade Submissions <ChevronRight size={18} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
