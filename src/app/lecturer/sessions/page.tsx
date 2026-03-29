"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Trash2, Clock, CheckCircle2 } from "lucide-react";

export default function LecturerSessions() {
  const { user } = useAuth();
  
  const [sessions, setSessions] = useState([
    { id: 1, course: "Software Engineering (CS400)", code: "4912", status: "Active", expiresAt: "12:00 PM", timestamp: "Today, 10:00 AM" },
    { id: 2, course: "Data Structures (CS301)", code: "8821", status: "Expired", expiresAt: "4:00 PM", timestamp: "Yesterday, 2:00 PM" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState("");
  const [newDuration, setNewDuration] = useState("60"); // Minutes

  const generateCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession = {
      id: Date.now(),
      course: newCourse,
      code: generateCode(),
      status: "Active",
      expiresAt: "In " + newDuration + " mins",
      timestamp: "Just now",
    };
    setSessions([newSession, ...sessions]);
    setIsModalOpen(false);
    setNewCourse("");
    setNewDuration("60");
  };

  const handleDeleteSession = (id: number) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const handleExtendSession = (id: number) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, expiresAt: "Extended by 15 mins" } : s));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lab Sessions</h1>
          <p className="text-sm text-slate-500 mt-1">Generate access codes and track student check-ins.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus size={18} className="mr-2" />
          Create Session
        </button>
      </div>

      <div className="bg-white border text-center border-slate-200 shadow-sm rounded-xl overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500 mb-2">No past or active sessions.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-indigo-600 font-medium hover:underline text-sm"
            >
              Generate your first lab code
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 text-left">
            {sessions.map((session) => (
              <li key={session.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900 text-lg">{session.course}</h3>
                      {session.status === "Active" ? (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 flex items-center">
                      <Clock size={14} className="mr-1.5" />
                      Started {session.timestamp}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-6 py-3 text-center min-w-[120px]">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Access Code</span>
                    <span className={`text-3xl font-mono font-bold tracking-widest ${session.status === 'Active' ? 'text-indigo-600' : 'text-slate-400 line-through'}`}>
                      {session.code}
                    </span>
                  </div>

                  <div className="flex md:flex-col gap-2 items-end justify-center">
                    {session.status === 'Active' && (
                      <button 
                        onClick={() => handleExtendSession(session.id)}
                        className="text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition"
                      >
                        Extend +15m
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-sm flex items-center font-medium text-red-600 hover:text-red-700 px-3 py-1.5 transition"
                    >
                      <Trash2 size={16} className="mr-1.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">New Lab Session</h2>
              <p className="text-sm text-slate-500 mt-1">Generate a time-limited PIN code for students.</p>
            </div>
            
            <form onSubmit={handleCreateSession} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course / Module Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Intro to Databases"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valid Duration (Minutes)</label>
                <select 
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="120">2 Hours</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 font-medium text-white rounded-lg shadow-sm">
                  Generate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
