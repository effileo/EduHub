"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Users, AlertCircle, TrendingUp, ShieldCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function PeerReviewResultsPage() {
  const params = useParams()
  const assignmentId = params.assignmentId as string
  
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/peer-reviews/${assignmentId}/results`)
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [assignmentId])

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/lecturer/grades`} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Peer Review Analysis</h1>
          <p className="text-slate-500 font-medium">Aggregated student feedback and score distribution</p>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Participants</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="text-3xl font-black text-slate-800">{results.length}</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Completion Rate</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <span className="text-3xl font-black text-slate-800">
              {Math.round((results.filter(r => r.count > 0).length / results.length) * 100)}%
            </span>
          </div>
        </div>
        <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative z-10">
            <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-2">Outlier Detection</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <span className="text-3xl font-black">Active (IQR 1.5x)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-800">Student Peer Scores</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-400 font-black uppercase tracking-widest text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-6 pl-10">Student</th>
                <th className="p-6 text-center">Reviews Received</th>
                <th className="p-6 text-center">Avg Peer Score</th>
                <th className="p-6 text-center">Outliers Flagged</th>
                <th className="p-6 pr-10 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {results.map((res, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 pl-10">
                    <div className="flex items-center gap-4">
                      <img 
                        src={res.student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.student.name)}`} 
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      />
                      <span className="font-bold text-slate-800">{res.student.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center font-bold text-slate-600">{res.count}</td>
                  <td className="p-6 text-center">
                    {res.avgScore !== null ? (
                      <span className="text-lg font-black text-indigo-600">{res.avgScore}<span className="text-[10px] text-slate-400">/30</span></span>
                    ) : (
                      <span className="text-slate-300 italic text-sm">No data</span>
                    )}
                  </td>
                  <td className="p-6 text-center">
                    {res.outliers > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black">
                        <AlertCircle size={14} /> {res.outliers} Flagged
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="p-6 pr-10 text-right">
                    {res.count >= 2 ? (
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Credible</span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Low Data</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
