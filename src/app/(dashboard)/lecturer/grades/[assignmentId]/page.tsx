"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ArrowLeft, CheckCircle2, Save, ExternalLink, Loader2 } from 'lucide-react'

export default function AssignmentGradingPage() {
  const params = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Local state for grading inputs
  const [grades, setGrades] = useState<Record<string, { score: string, feedback: string }>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/assignments/${params.assignmentId}`)
      const json = await res.json()
      setData(json)
      
      // Initialize local grade state with existing submissions
      const initialGrades: any = {}
      json.allStudents.forEach((student: any) => {
        const sub = json.assignment.submissions.find((s: any) => s.studentId === student.id)
        initialGrades[student.id] = {
          submissionId: sub?.id,
          score: sub?.score !== null && sub?.score !== undefined ? String(sub.score) : '',
          feedback: sub?.feedback || ''
        }
      })
      setGrades(initialGrades)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [params.assignmentId])

  const handleGradeChange = (studentId: string, field: 'score' | 'feedback', value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }))
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    
    // Filter to only those that have a submissionId (meaning they actually submitted)
    // AND have either a score or feedback entered
    const updates = Object.entries(grades)
      .filter(([_, data]) => data.submissionId && (data.score !== '' || data.feedback !== ''))
      .map(async ([_, data]) => {
        return fetch(`/api/assignments/${params.assignmentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId: data.submissionId,
            score: data.score,
            feedback: data.feedback
          })
        })
      })

    try {
      await Promise.all(updates)
      setSaveSuccess(true)
      fetchData() // Refresh chart data
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || !data) {
    return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>
  }

  const { assignment, allStudents } = data

  // Prepare Histogram Data
  const scores = assignment.submissions.filter((s: any) => s.score != null).map((s: any) => s.score)
  
  // Create bins based on maxScore (e.g. 5 bins: 0-20%, 21-40%, etc)
  const binData = [
    { name: '0-20%', count: 0 },
    { name: '21-40%', count: 0 },
    { name: '41-60%', count: 0 },
    { name: '61-80%', count: 0 },
    { name: '81-100%', count: 0 },
  ]
  
  scores.forEach((score: number) => {
    const percent = score / assignment.maxScore
    if (percent <= 0.2) binData[0].count++
    else if (percent <= 0.4) binData[1].count++
    else if (percent <= 0.6) binData[2].count++
    else if (percent <= 0.8) binData[3].count++
    else binData[4].count++
  })

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/lecturer/grades" className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900">{assignment.title}</h1>
          <p className="text-slate-500 font-medium">{assignment.courseId} • Max Score: {assignment.maxScore}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grading Table */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50">
            <h2 className="text-xl font-black text-slate-800">Submissions</h2>
            
            <div className="flex items-center gap-4">
              {saveSuccess && <span className="text-green-600 font-bold flex items-center gap-1 animate-in fade-in"><CheckCircle2 size={16}/> Saved!</span>}
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save All Grades
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-white border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 pl-8">Student</th>
                  <th className="p-4">Submission</th>
                  <th className="p-4 w-32">Score</th>
                  <th className="p-4">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allStudents.map((student: any) => {
                  const sub = assignment.submissions.find((s: any) => s.studentId === student.id)
                  const gState = grades[student.id]

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-4 pl-8">
                        <div className="flex items-center gap-3">
                          <img src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}`} className="w-8 h-8 rounded-full bg-slate-100" />
                          <p className="font-bold text-slate-800">{student.name}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {sub?.fileUrl ? (
                          <a href={sub.fileUrl} target="_blank" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg">
                            View Work <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-100 rounded-lg">Missing</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max={assignment.maxScore}
                            value={gState.score}
                            onChange={(e) => handleGradeChange(student.id, 'score', e.target.value)}
                            disabled={!sub}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800 disabled:opacity-50 disabled:bg-slate-100"
                            placeholder="-"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">/{assignment.maxScore}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <textarea
                          value={gState.feedback}
                          onChange={(e) => handleGradeChange(student.id, 'feedback', e.target.value)}
                          disabled={!sub}
                          placeholder={sub ? "Great job on..." : ""}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm disabled:opacity-50 resize-none h-10"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">Grade Distribution</h3>
            {scores.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 font-medium text-center">
                No grades posted yet.<br/>Start grading to see stats!
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={binData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {scores.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center text-center">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Average</p>
                  <p className="text-2xl font-black text-slate-800">
                    {(scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Highest</p>
                  <p className="text-2xl font-black text-green-500">
                    {Math.max(...scores)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
