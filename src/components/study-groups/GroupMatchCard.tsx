import { Users, Tag, ChevronRight, Check } from 'lucide-react'
import Link from 'next/link'

interface GroupMatchCardProps {
  group: any
  onJoin?: (id: string) => void
  isJoining?: boolean
}

export default function GroupMatchCard({ group, onJoin, isJoining }: GroupMatchCardProps) {
  return (
    <div className="bg-white rounded-[32px] border border-slate-100 p-6 hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col group">
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-widest rounded-full">
          {group.courseId}
        </span>
        <div className="flex items-center gap-1 text-slate-500 text-sm font-bold bg-slate-50 px-2 py-1 rounded-lg">
          <Users size={14} />
          {group._count?.members || 0}
        </div>
      </div>
      
      <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
        {group.title}
      </h3>
      
      <div className="flex flex-wrap gap-2 mb-8">
        {group.tags?.map((tag: string, i: number) => (
          <span key={i} className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            <Tag size={10} />
            {tag}
          </span>
        ))}
        {(!group.tags || group.tags.length === 0) && (
          <span className="text-xs text-slate-400 italic">No tags</span>
        )}
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-50 flex gap-3">
        {group.isMember ? (
          <Link
            href={`/student/study-groups/${group.id}`}
            className="flex-1 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            Open Workspace <ChevronRight size={16} />
          </Link>
        ) : (
          <button
            onClick={() => onJoin && onJoin(group.id)}
            disabled={isJoining}
            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isJoining ? 'Joining...' : 'Join Group'}
          </button>
        )}
      </div>
    </div>
  )
}
