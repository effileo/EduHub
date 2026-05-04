"use client"

import { useState, useEffect } from 'react'
import EvaluationAnalytics from '@/components/evaluations/EvaluationAnalytics'
import { BarChart3, ChevronRight } from 'lucide-react'

export default function LecturerEvaluationsPage() {
  const [courses] = useState([
    { id: 'CS101 - Comp Sci', label: 'Computer Science 101' },
    { id: 'MATH202 - Calc', label: 'Calculus II' }
  ])
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSelectCourse = async (courseId: string) => {
    setSelectedCourse(courseId)
    setLoading(true)
    try {
      const res = await fetch(`/api/evaluations/${courseId}/results`)
      const data = await res.json()
      setAnalyticsData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">Evaluation Analytics</h1>
        <p className="text-slate-500 mt-1 font-medium">Review aggregated, anonymous student feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Course List */}
        <div className="lg:col-span-4 space-y-4">
          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => handleSelectCourse(course.id)}
              className={`w-full text-left p-6 rounded-3xl transition-all border ${
                selectedCourse === course.id 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200 scale-105' 
                  : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <h3 className={`font-black text-lg ${selectedCourse === course.id ? 'text-white' : 'text-slate-900'}`}>
                {course.id}
              </h3>
              <p className={`text-sm mt-1 font-medium ${selectedCourse === course.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                {course.label}
              </p>
              <div className="mt-4 flex justify-end">
                <ChevronRight size={20} className={selectedCourse === course.id ? 'text-white' : 'text-slate-300'} />
              </div>
            </button>
          ))}
        </div>

        {/* Analytics Area */}
        <div className="lg:col-span-8">
          {!selectedCourse ? (
            <div className="bg-slate-50 border border-slate-200 rounded-[40px] h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12">
              <BarChart3 size={64} className="text-slate-300 mb-6" />
              <h3 className="text-2xl font-black text-slate-800 mb-2">Select a Course</h3>
              <p className="text-slate-500">Choose a course from the list to view its evaluation analytics.</p>
            </div>
          ) : loading ? (
            <div className="bg-white border border-slate-100 rounded-[40px] h-full min-h-[400px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="font-bold text-slate-500 animate-pulse">Aggregating responses...</p>
            </div>
          ) : analyticsData ? (
            <EvaluationAnalytics data={analyticsData} courseId={selectedCourse} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
