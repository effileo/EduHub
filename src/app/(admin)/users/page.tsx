"use client"

import { useEffect, useState } from 'react'
import { Search, Filter, MoreVertical, Shield, User, GraduationCap, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkResult, setBulkResult] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      ...(roleFilter !== 'ALL' && { role: roleFilter })
    })
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users)
    setTotalPages(data.pages)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return
    
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole })
    })
    
    if (res.ok) {
      fetchUsers()
    }
  }

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkFile) return
    
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', bulkFile)
    
    const res = await fetch('/api/admin/users/bulk-enroll', {
      method: 'POST',
      body: formData
    })
    
    const data = await res.json()
    setBulkResult(data)
    setIsUploading(false)
    fetchUsers()
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 font-medium mt-1">Search, filter, and manage user permissions.</p>
        </div>
        <button 
          onClick={() => setIsBulkModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <Upload size={20} />
          Bulk Enroll
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          />
        </form>
        <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="LECTURER">Lecturers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">User</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Role</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Joined Date</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      {user.name?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-8 py-6 text-sm font-medium text-slate-500">
                  {format(new Date(user.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-8 py-6">
                  <select 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    value={user.role}
                    className="text-xs font-black bg-slate-100 px-3 py-2 rounded-lg cursor-pointer outline-none border-none"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="LECTURER">LECTURER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900">Bulk Enroll Users</h3>
              <button onClick={() => { setIsBulkModalOpen(false); setBulkResult(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              {!bulkResult ? (
                <form onSubmit={handleBulkUpload} className="space-y-6">
                  <div className="p-12 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-center group hover:border-indigo-400 transition-all cursor-pointer bg-slate-50/50">
                    <Upload size={48} className="text-slate-300 mb-4 group-hover:text-indigo-400 transition-all" />
                    <p className="text-slate-600 font-bold mb-1">Click to upload CSV</p>
                    <p className="text-xs text-slate-400 font-medium">Format: email, courseId, role (optional)</p>
                    <input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {bulkFile && (
                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <p className="text-sm font-bold text-indigo-700 truncate max-w-[80%]">{bulkFile.name}</p>
                      <button type="button" onClick={() => setBulkFile(null)} className="text-indigo-400 hover:text-indigo-600">
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={!bulkFile || isUploading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {isUploading ? 'Processing...' : 'Upload & Enroll'}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                    <div>
                      <p className="text-lg font-black text-emerald-900">Upload Complete</p>
                      <p className="text-sm font-medium text-emerald-700">Successfully processed your CSV file.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-6 bg-slate-50 rounded-3xl">
                      <p className="text-2xl font-black text-slate-900">{bulkResult.created}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enrolled</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl">
                      <p className="text-2xl font-black text-slate-900">{bulkResult.skipped}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Skipped</p>
                    </div>
                  </div>
                  {bulkResult.errors.length > 0 && (
                    <div className="max-h-40 overflow-y-auto p-4 bg-red-50 rounded-2xl border border-red-100 space-y-2">
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertCircle size={14} />
                        <span className="text-xs font-black uppercase tracking-widest">Errors Found</span>
                      </div>
                      {bulkResult.errors.map((err: string, i: number) => (
                        <p key={i} className="text-xs text-red-600 font-medium">• {err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const styles: any = {
    ADMIN: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    LECTURER: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    STUDENT: 'bg-slate-100 text-slate-700 border-slate-200'
  }
  
  const icons: any = {
    ADMIN: Shield,
    LECTURER: GraduationCap,
    STUDENT: User
  }
  
  const Icon = icons[role] || User

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles[role] || styles.STUDENT}`}>
      <Icon size={12} />
      {role}
    </span>
  )
}
