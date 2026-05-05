"use client"

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ChatMessage from '@/components/assistant/ChatMessage'
import { Send, Sparkles, Loader2, RefreshCcw, AlertCircle } from 'lucide-react'

export default function AIAssistantPage() {
  const params = useParams()
  const courseId = typeof params.courseId === 'string' ? decodeURIComponent(params.courseId) : ''
  
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [queriesUsed, setQueriesUsed] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const studentQuestion = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: studentQuestion }])
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          question: studentQuestion,
          sessionHistory: messages
        })
      })

      if (!response.ok) throw new Error('Failed to connect to AI')

      const reader = response.body?.getReader()
      const decoder = new TextEncoder()
      let aiResponse = ''
      let sources: string[] = []

      // Create initial message placeholder
      setMessages(prev => [...prev, { role: 'assistant', content: '', sources: [] }])

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        
        // Handle sources metadata
        if (chunk.startsWith('__SOURCES__:')) {
          const sourcesStr = chunk.split('\n')[0].replace('__SOURCES__:', '')
          sources = JSON.parse(sourcesStr)
          continue
        }

        aiResponse += chunk
        
        // Update the last message
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = { 
            role: 'assistant', 
            content: aiResponse,
            sources: sources
          }
          return newMessages
        })
      }
      
      setQueriesUsed(prev => prev + 1)
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col space-y-6">
      <div className="flex justify-between items-center px-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={24} />
            Study Assistant
          </h1>
          <p className="text-sm text-slate-400 font-medium">Asking about {courseId}</p>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Limit</p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${queriesUsed >= 18 ? 'bg-red-500' : 'bg-indigo-500'}`}
                style={{ width: `${(queriesUsed / 20) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-600">{queriesUsed}/20</span>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 bg-slate-50/50 rounded-[40px] border border-slate-100 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 text-indigo-600 animate-bounce">
              <Sparkles size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">How can I help you today?</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              I've read all the course materials, slides, and notes. Ask me anything about the content, or for help preparing for exams!
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-lg">
              {[
                "Summarize last week's lecture",
                "Explain the key concepts of unit 2",
                "Create a 5-question practice quiz",
                "What's the difference between X and Y?"
              ].map(q => (
                <button 
                  key={q}
                  onClick={() => setInput(q)}
                  className="p-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:border-indigo-300 hover:shadow-md transition-all text-left"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <ChatMessage key={idx} role={m.role} content={m.content} sources={m.sources} />
        ))}
        
        {isTyping && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <Loader2 size={20} className="text-indigo-400 animate-spin" />
            </div>
            <div className="h-12 w-24 bg-slate-100 rounded-2xl" />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4">
        <form 
          onSubmit={handleSend}
          className="relative bg-white p-2 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-2 group focus-within:border-indigo-500 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            disabled={isTyping || queriesUsed >= 20}
            className="flex-1 bg-transparent px-6 py-4 outline-none font-medium text-slate-800 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || queriesUsed >= 20}
            className="w-12 h-12 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <Send size={20} />
          </button>
        </form>
        
        {queriesUsed >= 20 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-500 font-bold text-xs">
            <AlertCircle size={14} /> Daily question limit reached. Resets at midnight.
          </div>
        )}
      </div>
    </div>
  )
}
