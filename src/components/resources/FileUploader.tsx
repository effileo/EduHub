"use client"

import { useState, useRef } from 'react'
import { Upload, X, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface FileUploaderProps {
  courseId: string
  week?: number | null
  onComplete: (metadata: any) => void
  onCancel: () => void
}

export default function FileUploader({ courseId, week, onComplete, onCancel }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (selected.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB limit')
      return
    }

    setFile(selected)
    setError(null)
  }

  const uploadFile = async () => {
    if (!file) return
    setIsUploading(true)
    setError(null)

    try {
      // 1. Get signed upload URL
      const res = await fetch('/api/resources/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      })
      
      const { uploadUrl, path, error: signError } = await res.json()
      if (signError) throw new Error(signError)

      // 2. Upload directly to Supabase via XHR to track progress
      const xhr = new XMLHttpRequest()
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      const promise = new Promise((resolve, reject) => {
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve(xhr.response) : reject(new Error('Upload failed'))
        xhr.onerror = () => reject(new Error('Upload error'))
      })

      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)

      await promise

      // 3. Save metadata to Prisma
      const metadataRes = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title: file.name,
          fileType: file.type,
          week,
          fileUrl: path
        })
      })

      if (!metadataRes.ok) throw new Error('Failed to save file metadata')
      
      const savedResource = await metadataRes.json()
      onComplete(savedResource)
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload')
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-slate-800">Upload Material</h3>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <X size={20} />
        </button>
      </div>

      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-[24px] p-12 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
        >
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:text-indigo-500 transition-all">
            <Upload size={32} />
          </div>
          <p className="font-bold text-slate-600">Click to browse or drag & drop</p>
          <p className="text-xs text-slate-400 mt-2">Max file size: 50MB</p>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-500">
              <File size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            {!isUploading && (
              <button onClick={() => setFile(null)} className="text-red-400 hover:text-red-600 p-2">
                <X size={20} />
              </button>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-indigo-600">Uploading...</span>
                <span className="text-slate-400">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 animate-in shake-1">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isUploading}
              className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={uploadFile}
              disabled={isUploading}
              className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? <Loader2 size={20} className="animate-spin" /> : 'Start Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
