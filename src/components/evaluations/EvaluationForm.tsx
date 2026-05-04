import { useState } from 'react'
import { Star, ShieldCheck, Send, Loader2, CheckCircle2 } from 'lucide-react'

interface EvaluationFormProps {
  courseId: string
  onComplete: () => void
  onCancel: () => void
}

export default function EvaluationForm({ courseId, onComplete, onCancel }: EvaluationFormProps) {
  const [scores, setScores] = useState({
    contentScore: 0,
    deliveryScore: 0,
    paceScore: 0,
    materialsScore: 0,
    supportScore: 0,
  })
  const [feedback, setFeedback] = useState('')
  const [hoveredStar, setHoveredStar] = useState<{ category: string, value: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { key: 'contentScore', label: 'Course Content', desc: 'Relevance and depth of material' },
    { key: 'deliveryScore', label: 'Instruction Delivery', desc: 'Clarity and engagement' },
    { key: 'paceScore', label: 'Course Pace', desc: 'Speed and workload distribution' },
    { key: 'materialsScore', label: 'Learning Materials', desc: 'Quality of slides, readings, labs' },
    { key: 'supportScore', label: 'Student Support', desc: 'Availability and helpfulness' },
  ]

  const handleStarClick = (category: string, value: number) => {
    setScores(prev => ({ ...prev, [category]: value }))
  }

  const isFormComplete = Object.values(scores).every(score => score > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormComplete) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, ...scores, feedback }),
      })
      
      if (res.ok) {
        onComplete()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit evaluation')
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
      <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-1">Evaluate {courseId}</h2>
          <p className="text-indigo-200 flex items-center gap-2 font-medium">
            <ShieldCheck size={18} />
            Your identity is never stored with your feedback
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold">
            {error}
          </div>
        )}

        <div className="space-y-6 mb-8">
          {categories.map(cat => (
            <div key={cat.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
              <div>
                <p className="font-bold text-slate-800">{cat.label}</p>
                <p className="text-xs text-slate-500">{cat.desc}</p>
              </div>
              <div className="flex gap-1" onMouseLeave={() => setHoveredStar(null)}>
                {[1, 2, 3, 4, 5].map(val => {
                  const currentScore = scores[cat.key as keyof typeof scores]
                  const isHovered = hoveredStar?.category === cat.key && hoveredStar.value >= val
                  const isActive = currentScore >= val
                  return (
                    <button
                      key={val}
                      type="button"
                      onMouseEnter={() => setHoveredStar({ category: cat.key, value: val })}
                      onClick={() => handleStarClick(cat.key, val)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-90"
                    >
                      <Star 
                        size={28} 
                        className={`transition-colors ${
                          isHovered 
                            ? 'fill-amber-400 text-amber-400' 
                            : isActive 
                              ? 'fill-amber-500 text-amber-500' 
                              : 'fill-transparent text-slate-300'
                        }`} 
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <label className="block font-bold text-slate-800 mb-2 ml-1">Written Feedback (Optional)</label>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="What went well? What could be improved?"
            className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none h-32"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-4 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormComplete || isSubmitting}
            className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Submit Anonymously</>}
          </button>
        </div>
      </form>
    </div>
  )
}
