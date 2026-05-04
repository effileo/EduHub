"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/AuthContext'
import { Send, Hash, Users, MessageSquare, StickyNote, ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function StudyGroupWorkspace() {
  const params = useParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat')
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isSending, setIsSending] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // We normally fetch group details, but for brevity we'll focus on messages and notes
  useEffect(() => {
    // Fetch initial messages
    fetch(`/api/study-groups/${params.id}/messages`)
      .then(res => res.json())
      .then(data => setMessages(data))

    // Fetch initial notes
    fetch(`/api/study-groups/${params.id}/notes`)
      .then(res => res.json())
      .then(data => setNotes(data.notes || ''))

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`room_${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `studyGroupId=eq.${params.id}`,
        },
        async (payload) => {
          // In a real app we might fetch the author details if they aren't embedded
          // For simplicity, we just trigger a full refetch to ensure we have the author info
          const res = await fetch(`/api/study-groups/${params.id}/messages`)
          const data = await res.json()
          setMessages(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id, supabase])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    setIsSending(true)
    
    try {
      await fetch(`/api/study-groups/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newMessage }),
      })
      setNewMessage('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    try {
      await fetch(`/api/study-groups/${params.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsSavingNotes(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <Link 
        href="/student/study-groups" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-6 transition-colors group w-fit"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Groups
      </Link>

      <div className="flex-1 bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-100 flex flex-col">
          <div className="p-8 border-b border-slate-200/60">
            <h2 className="text-2xl font-black text-slate-900 mb-1">Workspace</h2>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
              <Hash size={14} /> {params.id}
            </p>
          </div>
          
          <div className="p-4 flex-1">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'chat' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MessageSquare size={18} />
                Live Chat
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === 'notes' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <StickyNote size={18} />
                Shared Notes
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
          {activeTab === 'chat' ? (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p className="font-bold">No messages yet.</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isMe = msg.authorId === user?.id
                    return (
                      <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <img 
                          src={msg.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.author.name)}`} 
                          alt={msg.author.name} 
                          className="w-10 h-10 rounded-full bg-slate-100 shrink-0"
                        />
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          <div className="flex items-baseline gap-2 mb-1 mx-1">
                            <span className="text-xs font-bold text-slate-700">{msg.author.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {format(new Date(msg.createdAt), 'h:mm a')}
                            </span>
                          </div>
                          <div className={`px-5 py-3 rounded-3xl ${
                            isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Chat Input */}
              <div className="p-6 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50 active:scale-95 shrink-0"
                  >
                    {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="ml-1" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col h-full bg-yellow-50/30">
              <div className="p-6 flex justify-between items-center border-b border-yellow-100 bg-yellow-50/50">
                <h3 className="font-bold text-yellow-800 flex items-center gap-2">
                  <StickyNote size={18} /> Group Whiteboard
                </h3>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSavingNotes ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save Notes
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Start typing collaborative notes here..."
                className="flex-1 w-full p-8 bg-transparent outline-none resize-none font-mono text-slate-700 text-sm leading-loose placeholder:text-slate-300"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
