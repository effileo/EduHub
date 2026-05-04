"use client"

import { useState, useEffect } from 'react'
import GroupMatchCard from '@/components/study-groups/GroupMatchCard'
import { Plus, Search, Users, Loader2 } from 'lucide-react'

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'my_groups' | 'find_group'>('find_group')
  const [searchQuery, setSearchQuery] = useState('')
  const [joiningId, setJoiningId] = useState<string | null>(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newGroup, setNewGroup] = useState({ courseId: '', title: '', tags: '' })
  const [creating, setCreating] = useState(false)

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/study-groups')
      const data = await res.json()
      setGroups(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleJoin = async (id: string) => {
    setJoiningId(id)
    try {
      await fetch(`/api/study-groups/${id}/join`, { method: 'POST' })
      fetchGroups()
      setActiveTab('my_groups')
    } catch (err) {
      console.error(err)
    } finally {
      setJoiningId(null)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    const tagsArray = newGroup.tags.split(',').map(t => t.trim()).filter(Boolean)
    try {
      await fetch('/api/study-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newGroup, tags: tagsArray }),
      })
      setIsModalOpen(false)
      setNewGroup({ courseId: '', title: '', tags: '' })
      fetchGroups()
      setActiveTab('my_groups')
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const myGroups = groups.filter(g => g.isMember)
  const discoverGroups = groups.filter(g => !g.isMember && g.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Study Groups</h1>
          <p className="text-slate-500 mt-1 font-medium">Find study partners and collaborate in real-time</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={20} />
          Create Group
        </button>
      </div>

      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl mb-8 w-fit">
        <button
          onClick={() => setActiveTab('find_group')}
          className={`px-8 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'find_group' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Find a Group
        </button>
        <button
          onClick={() => setActiveTab('my_groups')}
          className={`px-8 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'my_groups' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          My Groups <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{myGroups.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[32px]" />)}
        </div>
      ) : activeTab === 'find_group' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
            />
          </div>
          
          {discoverGroups.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-[40px] border border-dashed border-slate-300">
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No groups found</h3>
              <p className="text-slate-500">Try adjusting your search or create a new group.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {discoverGroups.map(group => (
                <GroupMatchCard 
                  key={group.id} 
                  group={group} 
                  onJoin={handleJoin} 
                  isJoining={joiningId === group.id} 
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {myGroups.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-[40px] border border-dashed border-slate-300">
              <h3 className="text-xl font-bold text-slate-700 mb-2">You haven't joined any groups yet</h3>
              <p className="text-slate-500 mb-6">Find a group to start collaborating with your peers.</p>
              <button
                onClick={() => setActiveTab('find_group')}
                className="px-6 py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
              >
                Browse Groups
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myGroups.map(group => (
                <GroupMatchCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Start a Study Group</h2>
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Course Code</label>
                  <input
                    type="text"
                    required
                    value={newGroup.courseId}
                    onChange={e => setNewGroup({...newGroup, courseId: e.target.value})}
                    placeholder="e.g. CS101"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Group Title</label>
                  <input
                    type="text"
                    required
                    value={newGroup.title}
                    onChange={e => setNewGroup({...newGroup, title: e.target.value})}
                    placeholder="e.g. Midterm Prep Squad"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newGroup.tags}
                    onChange={e => setNewGroup({...newGroup, tags: e.target.value})}
                    placeholder="e.g. java, algorithms, casual"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">Cancel</button>
                  <button type="submit" disabled={creating} className="flex-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center">
                    {creating ? <Loader2 className="animate-spin" size={20} /> : 'Create Group'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
