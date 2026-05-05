"use client"

import { useEffect, useState } from 'react'
import { Users, UserCheck, GraduationCap, Star, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading dashboard metrics...</div>

  const chartData = metrics ? Object.entries(metrics.counts).map(([role, count]) => ({
    name: role,
    value: count
  })) : []

  const colors = ['#6366f1', '#10b981', '#f59e0b']

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Institution Overview</h1>
        <p className="text-slate-500 font-medium mt-1">High-level performance and engagement metrics.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Users" 
          value={Object.values(metrics.counts).reduce((a: any, b: any) => a + b, 0)} 
          icon={Users} 
          trend="+12%" 
        />
        <StatCard 
          label="Active This Week" 
          value={metrics.activeUsersLast7Days} 
          icon={UserCheck} 
          trend="+5%" 
        />
        <StatCard 
          label="Avg Attendance" 
          value={`${metrics.attendanceRate.toFixed(1)}%`} 
          icon={TrendingUp} 
        />
        <StatCard 
          label="Avg Eval Score" 
          value={metrics.evaluationScore.toFixed(1)} 
          icon={Star} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Role Distribution Chart */}
        <div className="lg:col-span-7 bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
            <Users size={24} className="text-indigo-600" />
            User Distribution by Role
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Active Courses */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
            <GraduationCap size={24} className="text-emerald-600" />
            Most Active Courses
          </h3>
          <div className="space-y-4">
            {metrics.topCourses.map((course: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{course.courseId}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {course._count} Active Threads
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp size={14} />
                  <span className="text-xs font-black">Top</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, trend }: any) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl">
      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-black text-slate-900">{value}</p>
        {trend && <span className="text-xs font-black text-emerald-600 pb-1">{trend}</span>}
      </div>
    </div>
  )
}
