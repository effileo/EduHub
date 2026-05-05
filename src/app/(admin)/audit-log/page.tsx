"use client"

import { useEffect, useState } from 'react'
import { ClipboardList, Filter, Clock, User, Target, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchLogs = async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: page.toString(),
      ...(actionFilter && { action: actionFilter })
    })
    const res = await fetch(`/api/admin/audit-log?${params}`)
    const data = await res.json()
    setLogs(data.logs)
    setTotalPages(data.pages)
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [page, actionFilter])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Audit Log</h1>
          <p className="text-slate-500 font-medium mt-1">Chronological history of system-wide administrative actions.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="">All Actions</option>
            <option value="UPDATE_ROLE">Role Update</option>
            <option value="BULK_ENROLL">Bulk Enrollment</option>
            <option value="CREATE_DEPARTMENT">Department Creation</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Actor</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Action</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                      <Clock size={14} className="text-slate-300" />
                      {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{log.actor?.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{log.actor?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <Target size={14} className="text-slate-300" />
                      {log.targetModel}: <span className="text-slate-400 font-medium">{log.targetId}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
