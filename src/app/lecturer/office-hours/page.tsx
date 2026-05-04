"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Power, Megaphone, CheckCircle2, X } from "lucide-react";

export default function LecturerOfficeHours() {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [queue, setQueue] = useState([
    { id: 1, name: "Alice Johnson", timeJoined: "10:15 AM", topic: "Assignment 3 Clarification" },
    { id: 2, name: "Bob Smith", timeJoined: "10:18 AM", topic: "Midterm Review" },
    { id: 3, name: "Charlie Davis", timeJoined: "10:25 AM", topic: "General Feedback" },
  ]);

  const toggleQueueStatus = () => {
    setIsActive(!isActive);
  };

  const handleCallNext = () => {
    if (queue.length > 0) {
      // Remove first student from queue
      setQueue(queue.slice(1));
    }
  };

  const handleRemove = (id: number) => {
    setQueue(queue.filter(q => q.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
      {/* Control Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3">Session Control</h2>
          
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <button 
              onClick={toggleQueueStatus}
              className={`w-32 h-32 rounded-full flex items-center justify-center border-8 transition-all duration-300 shadow-inner group
                ${isActive 
                  ? 'bg-emerald-100 border-emerald-50 text-emerald-600 hover:bg-emerald-200' 
                  : 'bg-slate-100 border-slate-50 text-slate-400 hover:bg-slate-200'}`}
            >
              <Power size={48} className={isActive ? 'drop-shadow-sm' : ''} />
            </button>
            <h3 className={`mt-6 text-xl font-bold ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isActive ? 'Session Live' : 'Offline'}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              {isActive ? 'Students can now join your queue.' : 'Queue is currently closed.'}
            </p>
          </div>
        </div>

        <div className="bg-linear-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-md p-6 text-white text-center">
          <h3 className="font-semibold mb-2">Queue Analytics</h3>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-indigo-100 text-sm">Waiting</p>
              <p className="text-3xl font-bold mt-1">{isActive ? queue.length : 0}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Avg Wait</p>
              <p className="text-3xl font-bold mt-1">{isActive ? '12m' : '--'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue View */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full min-h-[500px] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                Waiting Queue
                {isActive && <span className="ml-3 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Manage student order continuously</p>
            </div>
            
            <button 
              onClick={handleCallNext}
              disabled={queue.length === 0 || !isActive}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg font-medium transition-colors flex items-center shadow-sm"
            >
              <Megaphone size={18} className="mr-2" />
              Call Next
            </button>
          </div>

          {!isActive ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-70">
              <Power size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-600">Session is Offline</h3>
              <p className="text-slate-500 mt-2 max-w-sm">Turn on the session using the control panel to allow students to join the queue.</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-70">
              <CheckCircle2 size={48} className="text-emerald-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-600">Queue is Empty</h3>
              <p className="text-slate-500 mt-2">You have caught up with all students.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {/* Current Student Highlight */}
              <div className="bg-indigo-50 border-b border-indigo-100 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${queue[0].name}`} alt="Avatar" className="w-14 h-14 rounded-full bg-white ring-4 ring-indigo-200" />
                    <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-white">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{queue[0].name}</h3>
                    <p className="text-indigo-700 text-sm font-medium">{queue[0].topic}</p>
                    <p className="text-slate-500 text-xs mt-1">Waiting since {queue[0].timeJoined}</p>
                  </div>
                </div>
                <div>
                  <span className="px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-bold uppercase tracking-wider rounded">Up Next</span>
                </div>
              </div>

              {/* Rest of queue */}
              <ul className="divide-y divide-slate-100">
                {queue.slice(1).map((student, idx) => (
                  <li key={student.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                         <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                           {student.name.charAt(0)}
                         </div>
                         <span className="absolute -bottom-1 -right-1 bg-slate-200 text-slate-600 text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-white">{idx + 2}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{student.name}</h4>
                        <p className="text-slate-600 text-sm">{student.topic}</p>
                        <p className="text-slate-400 text-xs mt-0.5">Joined at {student.timeJoined}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleRemove(student.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      title="Remove from queue"
                    >
                      <X size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
