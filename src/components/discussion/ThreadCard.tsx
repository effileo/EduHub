import Link from 'next/link'
import { MessageSquare, ThumbsUp, Pin, CheckCircle2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ThreadCardProps {
  thread: any
  courseId: string
}

export default function ThreadCard({ thread, courseId }: ThreadCardProps) {
  return (
    <Link 
      href={`/courses/${courseId}/discussion/${thread.id}`}
      className={`block p-6 rounded-[24px] border transition-all hover:shadow-lg ${
        thread.isPinned 
          ? 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-300' 
          : 'bg-white border-slate-100 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          {thread.isPinned && (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md">
              <Pin size={12} className="fill-current" /> Pinned
            </span>
          )}
          {thread.isResolved && (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-100 px-2 py-0.5 rounded-md">
              <CheckCircle2 size={12} /> Resolved
            </span>
          )}
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{thread.title}</h3>
        </div>
        
        <span className="text-xs font-medium text-slate-400 shrink-0">
          {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <img 
            src={thread.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.author.name)}`} 
            alt={thread.author.name}
            className="w-6 h-6 rounded-full bg-slate-100"
          />
          <span className="text-sm font-medium text-slate-600">{thread.author.name}</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5 text-sm font-bold">
            <MessageSquare size={16} />
            {thread._count?.replies || 0}
          </div>
        </div>
      </div>
    </Link>
  )
}
