"use client"

import { useState } from 'react'
import { QrCode, Send, ShieldAlert, CheckCircle2, TrendingUp, PieChart as PieChartIcon, Loader2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const MOCK_STATS = [
  { course: 'CS101 - Comp Sci', total: 10, attended: 9, status: 'GOOD' },
  { course: 'MATH202 - Calc', total: 12, attended: 8, status: 'WARNING' },
  { course: 'ENG303 - Lit', total: 8, attended: 8, status: 'EXCELLENT' },
]

export default function StudentAttendancePage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleAttend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/lab-sessions/attend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage({ type: 'success', text: `Successfully checked in! Status: ${data.status}` })
        setCode('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to check in' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  // Calculate overall stats
  const totalPossible = MOCK_STATS.reduce((acc, s) => acc + s.total, 0)
  const totalAttended = MOCK_STATS.reduce((acc, s) => acc + s.attended, 0)
  const overallPercentage = Math.round((totalAttended / totalPossible) * 100)
  
  const chartData = [
    { name: 'Attended', value: totalAttended },
    { name: 'Missed', value: totalPossible - totalAttended },
  ]
  const COLORS = ['#4f46e5', '#f1f5f9']

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">Attendance</h1>
        <p className="text-slate-500 mt-1 font-medium">Join a lab session or track your academic presence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Join Session Card */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-indigo-500 to-blue-500" />
            <div className="p-10">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                <QrCode size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Check-in to Lab</h2>
              <p className="text-slate-500 mb-8 font-medium">Enter the 6-digit code shown by your lecturer or on the QR poster.</p>

              <form onSubmit={handleAttend} className="space-y-6">
                <div className="relative group">
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full text-center text-4xl font-black tracking-[0.4em] py-6 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono uppercase text-slate-800 placeholder:text-slate-200"
                    placeholder="000000"
                    required
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
                    <p className="text-sm font-bold">{message.text}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Join Session</>}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Percentage Chart */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="relative w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900">{overallPercentage}%</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Presence</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <h3 className="font-bold text-slate-800">Overall Status</h3>
                <p className="text-sm text-green-600 font-bold flex items-center justify-center gap-1">
                  <TrendingUp size={14} /> Good Standing
                </p>
              </div>
            </div>

            {/* Attendance Alert */}
            {MOCK_STATS.some(s => (s.attended/s.total) < 0.75) && (
              <div className="bg-amber-50 rounded-[40px] p-8 border border-amber-100 flex flex-col justify-center">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-xl font-black text-amber-900 mb-2">Attention Required</h3>
                <p className="text-amber-700 text-sm font-medium leading-relaxed">
                  Your attendance in <span className="font-bold">MATH202</span> is below 75%. Please attend the next session to avoid risk.
                </p>
              </div>
            )}
          </div>

          {/* Detailed Stats Table */}
          <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <PieChartIcon size={20} className="text-indigo-500" />
                Course Presence
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Course</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Sessions</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Percentage</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_STATS.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                      <td className="px-8 py-5 font-bold text-slate-800">{s.course}</td>
                      <td className="px-8 py-5 font-medium text-slate-500">{s.attended} / {s.total}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                s.status === 'EXCELLENT' ? 'bg-green-500' : s.status === 'GOOD' ? 'bg-indigo-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${(s.attended/s.total)*100}%` }}
                            />
                          </div>
                          <span className="text-sm font-black text-slate-700">{Math.round((s.attended/s.total)*100)}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          s.status === 'EXCELLENT' ? 'bg-green-100 text-green-700' : s.status === 'GOOD' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
