"use client"

import { useState, useEffect } from 'react'
import EvaluationForm from '@/components/evaluations/EvaluationForm'
import { CheckCircle2, FileText, ChevronRight, Check } from 'lucide-react'

export default function StudentEvaluationsPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState(false)

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/evaluations')
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleEvaluationComplete = () => {
    setSuccessMessage(true)
    setSelectedCourse(null)
    fetchCourses()
    setTimeout(() => setSuccessMessage(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">Course Evaluations</h1>
        <p className="text-slate-500 mt-1 font-medium">Your feedback is anonymous and helps improve our teaching</p>
      </div>

      {successMessage && (
        <div className="mb-8 p-4 bg-green-50 text-green-700 border border-green-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 size={24} />
          <p className="font-bold">Thank you! Your anonymous evaluation was submitted successfully.</p>
        </div>
      )}

      {selectedCourse ? (
        <EvaluationForm 
          courseId={selectedCourse}
          onComplete={handleEvaluationComplete}
          onCancel={() => setSelectedCourse(null)}
        />
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {courses.map((course, idx) => (
                <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      course.status === 'Submitted' ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-500'
                    }`}>
                      {course.status === 'Submitted' ? <Check size={24} /> : <FileText size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{course.courseId}</h3>
                      <p className={`text-sm font-bold uppercase tracking-widest mt-1 ${
                        course.status === 'Submitted' ? 'text-green-500' : 'text-amber-500'
                      }`}>
                        {course.status}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => course.status !== 'Submitted' && setSelectedCourse(course.courseId)}
                    disabled={course.status === 'Submitted'}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                      course.status === 'Submitted' 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 group-hover:shadow-md'
                    }`}
                  >
                    {course.status === 'Submitted' ? 'Completed' : 'Evaluate'}
                    {course.status !== 'Submitted' && <ChevronRight size={18} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
