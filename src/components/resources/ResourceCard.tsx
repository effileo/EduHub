"use client"

import { useState } from 'react'
import { FileText, Video, Image, File, Download, MoreVertical, Trash2, Edit2, Loader2, FileArchive } from 'lucide-react'
import { format } from 'date-fns'

interface ResourceCardProps {
  resource: any
  isLecturer: boolean
  onDelete: (id: string) => void
  onUpdate: (resource: any) => void
}

export default function ResourceCard({ resource, isLecturer, onDelete, onUpdate }: ResourceCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const getIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="text-red-500" />
    if (type.includes('video')) return <Video className="text-blue-500" />
    if (type.includes('image')) return <Image className="text-green-500" />
    if (type.includes('zip') || type.includes('archive')) return <FileArchive className="text-amber-500" />
    return <File className="text-slate-400" />
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const res = await fetch(`/api/resources/${resource.id}`)
      const { downloadUrl } = await res.json()
      window.open(downloadUrl, '_blank')
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div 
      className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative flex items-center gap-4"
      draggable={isLecturer}
      onDragStart={(e) => e.dataTransfer.setData('resourceId', resource.id)}
    >
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        {getIcon(resource.fileType)}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-800 truncate pr-8" title={resource.title}>
          {resource.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
          <span>{resource.uploader.name}</span>
          <span>•</span>
          <span>{format(new Date(resource.createdAt), 'MMM d, yyyy')}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-all disabled:opacity-50"
          title="Download"
        >
          {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        </button>

        {isLecturer && (
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className={`p-2.5 rounded-xl transition-all ${showActions ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300 hover:text-slate-600'}`}
            >
              <MoreVertical size={18} />
            </button>
            
            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-20 animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={() => { setShowActions(false); /* Implement rename modal later */ }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 transition-colors"
                  >
                    <Edit2 size={16} /> Rename
                  </button>
                  <button 
                    onClick={() => { setShowActions(false); onDelete(resource.id); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 rounded-xl text-sm font-bold text-red-500 transition-colors"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
