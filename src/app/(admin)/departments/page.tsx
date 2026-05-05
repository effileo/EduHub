"use client"

import { useEffect, useState } from 'react'
import { Building2, Plus, Users, BookOpen, Trash2 } from 'lucide-react'

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ name: '', institutionId: '', adminId: '' })

  const fetchDepartments = async () => {
    const res = await fetch('/api/admin/departments')
    const data = await res.json()
    setDepartments(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    if (res.ok) {
      setFormData({ name: '', institutionId: '', adminId: '' })
      setIsAdding(false)
      fetchDepartments()
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Departments</h1>
          <p className="text-slate-500 font-medium mt-1">Organize courses and staff by academic unit.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          {isAdding ? 'Cancel' : (
            <>
              <Plus size={20} />
              Add Department
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[40px] border-2 border-indigo-100 shadow-2xl shadow-indigo-50 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Dept Name</label>
              <input 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                placeholder="Computer Science"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Institution ID</label>
              <input 
                required
                value={formData.institutionId}
                onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                placeholder="INST_001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Admin User ID</label>
              <input 
                required
                value={formData.adminId}
                onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                placeholder="Admin UUID"
              />
            </div>
            <div className="md:col-span-3">
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Create Department
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Building2 size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{dept.name}</h3>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">{dept.institutionId}</p>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                <div>
                  <p className="text-lg font-black text-slate-900">12</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lecturers</p>
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900">45</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Courses</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {departments.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Building2 size={40} />
            </div>
            <p className="text-slate-500 font-bold">No departments found. Start by creating one!</p>
          </div>
        )}
      </div>
    </div>
  )
}
