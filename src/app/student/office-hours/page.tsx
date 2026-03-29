"use client";

import { useState } from "react";
import { Clock, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";

export default function StudentOfficeHours() {
  const [inQueue, setInQueue] = useState(false);
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [position] = useState(3);
  const [waitTime] = useState(12);

  const handleJoinQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (course && topic) setInQueue(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Live Office Hours</h1>
        <p className="text-slate-500 mt-1">Join the waitlist to speak with your lecturers one-on-one.</p>
      </div>

      {!inQueue ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-center mb-6">Join the Waitlist</h2>
            
            <form onSubmit={handleJoinQueue} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Module</label>
                <select 
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 transition-all text-slate-900"
                  required
                >
                  <option value="" disabled>Choose an active session...</option>
                  <option value="CS400">Software Engineering (Dr. O'Brien)</option>
                  <option value="CS301">Data Structures (Dr. Smith)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specific Topic / Question</label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 transition-all text-slate-900 resize-none h-24"
                  placeholder="e.g., Question about the BFS traversal algorithm."
                  required
                ></textarea>
                <p className="text-xs text-slate-400 mt-1">Providing context helps the lecturer prepare for your turn.</p>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center"
              >
                Join Queue
                <CheckCircle2 size={18} className="ml-2" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-indigo-100 text-indigo-600 mb-6 relative">
            <Clock size={48} className="animate-pulse" />
            <span className="absolute -top-2 -right-2 flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">You are currently in line</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Please wait for the lecturer to call you. Do not close this page.</p>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center">
               <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Your Position</p>
               <h3 className="text-6xl font-black text-slate-900">
                {position}
                <span className="text-2xl font-bold text-slate-400 align-top">nd</span>
               </h3>
               <p className="text-sm font-medium text-indigo-600 mt-2 bg-indigo-50 py-1 px-3 rounded-full inline-block w-max mx-auto">Moving up...</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center">
               <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Est. Wait</p>
               <h3 className="text-6xl font-black text-slate-900">
                ~{waitTime}
                <span className="text-2xl font-bold text-slate-400 align-top">m</span>
               </h3>
               <p className="text-sm font-medium text-slate-500 mt-2 flex items-center justify-center">
                 <AlertCircle size={14} className="mr-1" />
                 Based on average
               </p>
            </div>
          </div>

          <div className="w-full mt-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start text-left text-sm text-indigo-800">
             <MessageSquare size={20} className="mr-3 mt-0.5 flex-shrink-0 text-indigo-500" />
             <div>
               <strong>Topic submitted:</strong> {topic}
             </div>
          </div>

          <button 
            onClick={() => setInQueue(false)}
            className="mt-8 px-6 py-2 border-2 border-slate-200 text-slate-500 font-medium rounded-full hover:bg-slate-50 transition-colors hover:text-red-500 hover:border-red-200"
          >
            Leave Queue
          </button>
        </div>
      )}
    </div>
  );
}
