"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ThreadCard from '@/components/discussion/ThreadCard'
import { Search, Plus, MessageSquare, Loader2, X } from 'lucide-react'

export default function CourseDiscussionBoard() {
  const params = useParams()
  const courseId = typeof params.courseId === 'string' ? decodeURIComponent(params.courseId) : ''
  
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'All' | 'Pinned' | 'Unanswered' | 'Resolved'>('All')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newThread, setNewThread] = useState({ title: '', body: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchThreads = async () => {
    setLoading(true)
    try {
      const url = new URL('/api/threads', window.location.origin)
      url.searchParams.set('courseId', courseId)
      if (searchQuery) url.searchParams.set('search', searchQuery)
      
      const res = await fetch(url.toString())
      const data = await res.json()
      setThreads(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchThreads()
    }, 300)
    return () => clearTimeout(timer)
  }, [courseId, searchQuery])

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, ...newThread }),
      })
      setIsModalOpen(false)
      setNewThread({ title: '', body: '' })
      fetchThreads()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Apply local filters (search is done via API)
  const filteredThreads = threads.filter(t => {
    if (filter === 'Pinned') return t.isPinned
    if (filter === 'Resolved') return t.isResolved
    if (filter === 'Unanswered') return t._count?.replies === 0
    return true
  })

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Discussion Board</h1>
          <p className="text-slate-500 mt-1 font-medium">{courseId}</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={20} />
          New Thread
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
          />
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shrink-0 overflow-x-auto hide-scrollbar">
          {['All', 'Pinned', 'Unanswered', 'Resolved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[24px]" />)}
        </div>
      ) : filteredThreads.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-dashed border-slate-300 p-16 text-center">
          <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No threads found</h3>
          <p className="text-slate-500 mb-6">Be the first to start a conversation about this topic!</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Start Discussion
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-500">
          {filteredThreads.map(thread => (
            <ThreadCard key={thread.id} thread={thread} courseId={courseId} />
          ))}
        </div>
      )}

      {/* New Thread Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-900">Create New Thread</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateThread} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Question or Title</label>
                <input
                  type="text"
                  required
                  value={newThread.title}
                  onChange={e => setNewThread({...newThread, title: e.target.value})}
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Details</label>
                <textarea
                  required
                  value={newThread.body}
                  onChange={e => setNewThread({...newThread, body: e.target.value})}
                  placeholder="Provide context, code snippets, or specific questions..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[200px] resize-y"
                />
              </div>
              
              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isSubmitting || !newThread.title.trim()} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Post Thread'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
