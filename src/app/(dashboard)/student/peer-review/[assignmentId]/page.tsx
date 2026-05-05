"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Send, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import Link from 'next/link'

export default function PeerReviewFormPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.assignmentId as string

  const [reviews, setReviews] = useState<any[]>([])
  const [activeReviewIdx, setActiveReviewIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Rubric state (Anonymized for demo: Criteria A, B, C)
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({
    'Clarity of Thought': 0,
    'Technical Accuracy': 0,
    'Structure & Flow': 0
  })
  const [feedback, setFeedback] = useState('')

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/peer-reviews/${assignmentId}`)
      const data = await res.json()
      setReviews(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [assignmentId])

  const activeReview = reviews[activeReviewIdx]

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (feedback.length < 50) return
    setIsSubmitting(true)
    
    try {
      await fetch(`/api/peer-reviews/${assignmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peerReviewAssignmentId: activeReview.id,
          rubricScores,
          feedback
        })
      })
      
      // Move to next or finish
      if (activeReviewIdx < reviews.length - 1) {
        setActiveReviewIdx(prev => prev + 1)
        setFeedback('')
        setRubricScores({ 'Clarity of Thought': 0, 'Technical Accuracy': 0, 'Structure & Flow': 0 })
      } else {
        router.push('/student/peer-review')
      }
      fetchReviews()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>
  if (reviews.length === 0) return <div className="p-12 text-center text-slate-500">No assigned reviews found.</div>

  const allDone = reviews.every(r => r.completed)

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link 
        href="/student/peer-review" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-6 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Tasks
      </Link>

      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Assignment Review</h1>
          <p className="text-slate-500 mt-1 font-medium">Review {activeReviewIdx + 1} of {reviews.length}</p>
        </div>
        <div className="flex gap-1.5">
          {reviews.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all ${
                i === activeReviewIdx ? 'w-8 bg-indigo-600' : reviews[i].completed ? 'w-2 bg-green-500' : 'w-2 bg-slate-200'
              }`} 
            />
          ))}
        </div>
      </div>

      {activeReview.completed ? (
        <div className="bg-white rounded-[40px] p-12 text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Review Completed</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">You've successfully submitted your feedback for this submission.</p>
          
          {activeReviewIdx < reviews.length - 1 ? (
            <button 
              onClick={() => setActiveReviewIdx(prev => prev + 1)}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
            >
              Go to Next Review
            </button>
          ) : (
            <Link 
              href="/student/peer-review"
              className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
            >
              Back to Task List
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submission Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl">
              <h3 className="text-lg font-black mb-4">Submission to Review</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed italic">
                (Student identity is hidden to ensure unbiased feedback)
              </p>
              
              <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 mb-6">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Attached File</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm truncate pr-4">submission_file.pdf</span>
                  <a 
                    href={activeReview.submission.fileUrl} 
                    target="_blank" 
                    className="p-2 bg-slate-700 hover:bg-indigo-600 rounded-lg transition-colors"
                  >
                    <Download size={18} />
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <Info size={18} className="text-indigo-400 shrink-0" />
                <p className="text-xs font-medium text-indigo-200 leading-tight">
                  Read the submission carefully before assigning rubric scores.
                </p>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmitReview} className="lg:col-span-7 bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-8">
            <h3 className="text-xl font-black text-slate-800">Review Rubric</h3>
            
            <div className="space-y-6">
              {Object.keys(rubricScores).map(criterion => (
                <div key={criterion} className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-bold text-slate-700">{criterion}</label>
                    <span className="text-xs font-black px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">
                      {rubricScores[criterion]}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={rubricScores[criterion]}
                    onChange={(e) => setRubricScores(prev => ({ ...prev, [criterion]: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Detailed Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did they do well? What could be improved? (Min 50 characters)"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[160px] text-sm leading-relaxed"
                required
              />
              <p className={`text-[10px] font-black uppercase tracking-widest text-right ${feedback.length >= 50 ? 'text-green-500' : 'text-slate-400'}`}>
                {feedback.length} / 50 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || feedback.length < 50}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Submit Review Anonymously</>}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
