"use client";

import { useState } from "react";
import { Users, Search, BookmarkPlus, CalendarDays, ExternalLink, MessageCircle } from "lucide-react";

export default function StudyGroups() {
  const [lookingFor, setLookingFor] = useState(true);

  const groups = [
    { id: 1, course: "Software Engineering (CS400)", title: "Sprint 3 Prep", members: 4, time: "Tomorrow, 4 PM", tags: ["Backend", "Express"] },
    { id: 2, course: "Data Structures (CS301)", title: "Tree Traversals review", members: 2, time: "Friday, 1 PM", tags: ["C++", "Graphs"] },
    { id: 3, course: "Web Tech (CS405)", title: "React Hooks Discussion", members: 5, time: "Today, 6 PM", tags: ["Frontend", "React"] },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Study Group Finder</h1>
          <p className="text-slate-500 mt-1">Match with peers in your modules to collaborate on concepts.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col items-end">
             <span className="text-sm font-semibold text-slate-800">Looking for a group?</span>
             <span className="text-xs text-slate-500">Toggle to be discoverable</span>
          </div>
          <div className="relative inline-block w-14 align-middle select-none transition duration-200 ease-in">
            <input 
              type="checkbox" 
              id="lookingForToggle" 
              checked={lookingFor}
              onChange={() => setLookingFor(!lookingFor)}
              className="toggle-checkbox absolute block w-7 h-7 rounded-full bg-white border-4 border-slate-200 appearance-none cursor-pointer checked:right-0 checked:border-blue-500 transition-all z-10" 
            />
            <label 
              htmlFor="lookingForToggle" 
              className={`block overflow-hidden h-7 rounded-full cursor-pointer transition-colors ${lookingFor ? 'bg-blue-400' : 'bg-slate-200'}`}
            ></label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by topic or course..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-shadow shadow-sm"
            />
          </div>
          <button className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors">
            <BookmarkPlus size={18} className="mr-2" />
            Create Match Request
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-6">Matched Groups for You</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div key={group.id} className="border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all rounded-2xl p-6 bg-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:bg-blue-500/10 transition-colors"></div>
                
                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md mb-3">
                  {group.course}
                </span>
                <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{group.title}</h4>
                
                <div className="flex gap-2 mb-4 flex-wrap">
                  {group.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 border border-slate-200 text-slate-500 text-xs rounded-full bg-slate-50">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-6 py-4 border-y border-slate-100">
                  <div className="flex -space-x-2">
                    {Array.from({ length: group.members }).map((_, i) => (
                      <img
                        key={i}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student${group.id}${i}`}
                        alt="Member"
                      />
                    ))}
                    {group.members < 5 && (
                       <div className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white border-2 border-dashed border-slate-300 bg-white text-slate-400 text-xs font-medium">
                         +
                       </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 flex items-center">
                    <CalendarDays size={14} className="mr-1.5" />
                    {group.time}
                  </span>
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium transition-colors focus:ring-4 focus:ring-blue-100">
                    Join Match
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 rounded-xl transition-colors shrink-0">
                    <MessageCircle size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
