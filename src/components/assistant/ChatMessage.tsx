import { User, Bot, BookOpen } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

export default function ChatMessage({ role, content, sources }: ChatMessageProps) {
  const isAI = role === 'assistant'

  return (
    <div className={`flex gap-4 ${isAI ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
      {isAI && (
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
          <Bot size={20} className="text-white" />
        </div>
      )}

      <div className={`max-w-[80%] space-y-4`}>
        <div className={`p-6 rounded-[28px] ${
          isAI 
            ? 'bg-white border border-slate-100 shadow-sm text-slate-800' 
            : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 rounded-tr-none'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{content}</p>
        </div>

        {isAI && sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2">
            {sources.map((source, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-colors cursor-pointer">
                <BookOpen size={12} />
                {source}
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAI && (
        <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200">
          <User size={20} className="text-slate-400" />
        </div>
      )}
    </div>
  )
}
