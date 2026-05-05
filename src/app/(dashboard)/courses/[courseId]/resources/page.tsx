"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ResourceCard from '@/components/resources/ResourceCard'
import FileUploader from '@/components/resources/FileUploader'
import { Plus, BookOpen, ChevronRight, Loader2, FolderOpen } from 'lucide-react'

export default function CourseResourcesPage() {
  const params = useParams()
  const courseId = typeof params.courseId === 'string' ? decodeURIComponent(params.courseId) : ''
  
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<'STUDENT' | 'LECTURER' | null>(null)
  
  // UI State
  const [uploadingToWeek, setUploadingToWeek] = useState<number | null | undefined>(undefined)

  const fetchResources = async () => {
    try {
      const res = await fetch(`/api/resources?courseId=${encodeURIComponent(courseId)}`)
      const data = await res.json()
      setResources(data)
      
      const authRes = await fetch('/api/auth/me')
      if (authRes.ok) {
        const userData = await authRes.json()
        setUserRole(userData.dbUser.role)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [courseId])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return
    await fetch(`/api/resources/${id}`, { method: 'DELETE' })
    fetchResources()
  }

  const handleUpdate = async (resource: any) => {
    // Basic implementation for now
    fetchResources()
  }

  const handleDrop = async (e: React.DragEvent, targetWeek: number | null) => {
    e.preventDefault()
    const resourceId = e.dataTransfer.getData('resourceId')
    if (!resourceId) return

    await fetch(`/api/resources/${resourceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week: targetWeek })
    })
    fetchResources()
  }

  // Group resources by week
  const grouped = resources.reduce((acc, curr) => {
    const w = curr.week === null ? 'General' : `Week ${curr.week}`
    if (!acc[w]) acc[w] = []
    acc[w].push(curr)
    return acc
  }, {} as Record<string, any[]>)

  // Ensure we have at least weeks 1-4 visible for lecturers to drop into
  if (userRole === 'LECTURER') {
    for (let i = 1; i <= 4; i++) {
      if (!grouped[`Week ${i}`]) grouped[`Week ${i}`] = []
    }
    if (!grouped['General']) grouped['General'] = []
  }

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Course Materials</h1>
          <p className="text-slate-500 mt-1 font-medium">{courseId}</p>
        </div>
        
        {userRole === 'LECTURER' && (
          <button 
            onClick={() => setUploadingToWeek(null)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus size={20} />
            Quick Upload
          </button>
        )}
      </div>

      <div className="space-y-12">
        {Object.entries(grouped)
          .sort(([a], [b]) => {
            if (a === 'General') return -1
            if (b === 'General') return 1
            return parseInt(a.replace('Week ', '')) - parseInt(b.replace('Week ', ''))
          })
          .map(([weekName, weekResources]) => {
            const weekNum = weekName === 'General' ? null : parseInt(weekName.replace('Week ', ''))
            
            return (
              <div 
                key={weekName}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, weekNum)}
                className={`p-1 rounded-[40px] transition-all ${userRole === 'LECTURER' ? 'hover:bg-slate-50/50' : ''}`}
              >
                <div className="flex justify-between items-center mb-6 px-4">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <span className={`w-3 h-8 rounded-full ${weekName === 'General' ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                    {weekName}
                  </h2>
                  {userRole === 'LECTURER' && (
                    <button 
                      onClick={() => setUploadingToWeek(weekNum)}
                      className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                  {weekResources.map(resource => (
                    <ResourceCard 
                      key={resource.id} 
                      resource={resource} 
                      isLecturer={userRole === 'LECTURER'}
                      onDelete={handleDelete}
                      onUpdate={handleUpdate}
                    />
                  ))}
                  
                  {weekResources.length === 0 && userRole === 'LECTURER' && (
                    <div className="col-span-full border-2 border-dashed border-slate-100 rounded-[32px] p-8 text-center text-slate-300 font-bold italic">
                      Drag materials here to assign to {weekName}
                    </div>
                  )}
                  
                  {weekResources.length === 0 && userRole === 'STUDENT' && (
                    <p className="col-span-full text-slate-400 italic px-4 font-medium">No materials posted yet for this period.</p>
                  )}
                </div>
              </div>
            )
          })}
      </div>

      {/* Upload Modal Overlay */}
      {uploadingToWeek !== undefined && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setUploadingToWeek(undefined)} />
          <div className="relative w-full max-w-xl animate-in zoom-in-95 duration-200">
            <FileUploader 
              courseId={courseId}
              week={uploadingToWeek}
              onCancel={() => setUploadingToWeek(undefined)}
              onComplete={() => {
                setUploadingToWeek(undefined)
                fetchResources()
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
