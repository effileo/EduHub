import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
import { ShieldAlert, Quote, MessageSquare } from 'lucide-react'

interface EvaluationAnalyticsProps {
  data: any
  courseId: string
}

export default function EvaluationAnalytics({ data, courseId }: EvaluationAnalyticsProps) {
  if (data.protected) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-12 text-center animate-in zoom-in-95">
        <ShieldAlert size={48} className="mx-auto text-amber-500 mb-6" />
        <h3 className="text-2xl font-black text-slate-800 mb-2">Privacy Threshold Not Met</h3>
        <p className="text-slate-600 max-w-md mx-auto mb-6">
          To protect student anonymity, evaluation results are only visible once at least 5 students have submitted their feedback.
        </p>
        <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm">
          <span className="font-bold text-slate-700">Current Responses:</span>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 font-black rounded-lg">{data.count} / 5</span>
        </div>
      </div>
    )
  }

  const radarData = [
    { subject: 'Content', A: data.averages.Content, fullMark: 5 },
    { subject: 'Delivery', A: data.averages.Delivery, fullMark: 5 },
    { subject: 'Pace', A: data.averages.Pace, fullMark: 5 },
    { subject: 'Materials', A: data.averages.Materials, fullMark: 5 },
    { subject: 'Support', A: data.averages.Support, fullMark: 5 },
  ]

  const barData = Object.entries(data.distribution).map(([score, count]) => ({
    name: `${score} Stars`,
    count,
  }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 lg:col-span-1">
          <h3 className="text-lg font-black text-slate-800 mb-6 text-center">Category Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8' }} />
                <Radar name="Average Score" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Overall Score</p>
            <p className="text-4xl font-black text-indigo-600">{data.overallAverage}<span className="text-xl text-slate-400">/5</span></p>
          </div>
        </div>

        {/* Bar Chart & Sentiment */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-black text-slate-800 mb-6">Score Distribution</h3>
          <div className="h-48 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index > 2 ? '#22c55e' : index === 2 ? '#eab308' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-black text-green-500">{data.sentiment.Positive}%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Positive</p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-400">{data.sentiment.Neutral}%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Neutral</p>
            </div>
            <div>
              <p className="text-3xl font-black text-red-500">{data.sentiment.Negative}%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Written Feedback */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200">
        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          <MessageSquare size={20} className="text-indigo-500" /> 
          Anonymous Feedback
        </h3>
        
        {data.feedback.length === 0 ? (
          <p className="text-slate-500 italic text-center p-8 bg-slate-50 rounded-2xl">No written comments provided yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.feedback.map((comment: string, idx: number) => (
              <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative">
                <Quote size={40} className="absolute top-4 left-4 text-slate-200" />
                <p className="text-slate-700 leading-relaxed relative z-10 font-medium">"{comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
