"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Pin, MessageSquare, ThumbsUp, Send, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ThreadDetailPage() {
  const params = useParams()
  const courseId = typeof params.courseId === 'string' ? decodeURIComponent(params.courseId) : ''
  const threadId = params.threadId as string

  const [thread, setThread] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Reply input state
  const [newReply, setNewReply] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/auth/me')
      if (userRes.ok) setCurrentUser(await userRes.json())

      const res = await fetch(`/api/threads/${threadId}`)
      if (res.ok) setThread(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [threadId])

  const handleTogglePin = async () => {
    await fetch(`/api/threads/${threadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !thread.isPinned })
    })
    fetchData()
  }

  const handleUpvote = async (replyId: string) => {
    // Optimistic UI update could go here
    await fetch(`/api/threads/${threadId}/replies/${replyId}/upvote`, { method: 'POST' })
    fetchData()
  }

  const handleAcceptAnswer = async (replyId: string) => {
    await fetch(`/api/threads/${threadId}/replies/${replyId}/accept`, { method: 'PATCH' })
    fetchData()
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReply.trim()) return
    setIsReplying(true)
    try {
      await fetch(`/api/threads/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newReply })
      })
      setNewReply('')
      fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setIsReplying(false)
    }
  }

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>
  if (!thread) return <div className="p-12 text-center text-slate-500">Thread not found</div>

  const isOP = currentUser?.id === thread.authorId
  const isLecturer = currentUser?.dbUser?.role === 'LECTURER'
  const canModerate = isOP || isLecturer

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link 
        href={`/courses/${courseId}/discussion`} 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-6 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Discussions
      </Link>

      {/* Original Post */}
      <div className={`bg-white rounded-[32px] border shadow-sm mb-8 relative overflow-hidden ${thread.isPinned ? 'border-indigo-200' : 'border-slate-200'}`}>
        {thread.isPinned && <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />}
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{thread.title}</h1>
            
            {canModerate && (
              <button 
                onClick={handleTogglePin}
                className={`p-2 rounded-xl border transition-colors shrink-0 ml-4 ${
                  thread.isPinned ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-indigo-600'
                }`}
                title={thread.isPinned ? "Unpin" : "Pin to top"}
              >
                <Pin size={20} className={thread.isPinned ? "fill-current" : ""} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3 mb-8">
            <img 
              src={thread.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.author.name)}`} 
              alt={thread.author.name}
              className="w-10 h-10 rounded-full bg-slate-100 ring-2 ring-white shadow-sm"
            />
            <div>
              <p className="font-bold text-slate-800">{thread.author.name}</p>
              <p className="text-xs font-medium text-slate-400">
                {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="prose prose-slate max-w-none font-medium leading-relaxed whitespace-pre-wrap">
            {thread.body}
          </div>
        </div>
      </div>

      {/* Replies Section */}
      <div className="mb-8">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <MessageSquare size={20} className="text-indigo-500" />
          {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        
        <div className="space-y-6">
          {thread.replies.map((reply: any) => {
            const isAccepted = reply.isAcceptedAnswer
            return (
              <div key={reply.id} className={`p-6 rounded-[24px] border ${
                isAccepted ? 'bg-green-50/30 border-green-200 shadow-sm' : 'bg-white border-slate-100'
              }`}>
                {isAccepted && (
                  <div className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest mb-4 bg-green-100 w-fit px-3 py-1 rounded-lg">
                    <CheckCircle2 size={14} /> Accepted Answer
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <img 
                    src={reply.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author.name)}`} 
                    alt={reply.author.name}
                    className="w-10 h-10 rounded-full bg-slate-100 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{reply.author.name}</span>
                        {reply.author.role === 'LECTURER' && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-black uppercase px-2 py-0.5 rounded-full">Lecturer</span>
                        )}
                        {reply.author.id === thread.authorId && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-black uppercase px-2 py-0.5 rounded-full">Author</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
                      {reply.body}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleUpvote(reply.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 font-bold text-sm rounded-lg transition-colors border border-slate-100"
                      >
                        <ThumbsUp size={14} />
                        {reply.upvotes}
                      </button>
                      
                      {canModerate && !isAccepted && (
                        <button 
                          onClick={() => handleAcceptAnswer(reply.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-green-600 font-bold text-sm rounded-lg transition-colors"
                        >
                          <CheckCircle2 size={14} />
                          Mark as Answer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reply Input */}
      <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Your Answer</h3>
        <form onSubmit={handleSubmitReply}>
          <textarea
            value={newReply}
            onChange={e => setNewReply(e.target.value)}
            placeholder="Type your reply here..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none min-h-[120px] mb-4"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isReplying || !newReply.trim()}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isReplying ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Post Reply
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
