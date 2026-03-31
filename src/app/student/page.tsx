"use client";

import { useAuth } from "@/lib/AuthContext";
import { CheckCircle2, Clock, Users, BellRing, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name.split(" ")[0]}!</h1>
        <p className="text-slate-500 mt-1">Here's your academic overview for today.</p>
      </header>

      {/* High Priority Alerts */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl md:flex items-center justify-between mb-8 shadow-sm">
        <div className="flex items-start">
          <BellRing className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-red-800 font-semibold mb-1">Room Change: Data Structures (CS301)</h3>
            <p className="text-red-700 text-sm">Today&apos;s 2:00 PM lecture is moved to LT-3. Please arrive on time.</p>
          </div>
        </div>
        <button className="hidden md:ml-6 md:block text-red-700 font-medium text-sm hover:underline">
          View Details
        </button>
      </div>

      {/* Dashboard widget cards: Attendance, Office Hours, and Study Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center">
              <CheckCircle2 size={18} className="text-emerald-500 mr-2" />
              Attendance Risk
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Safe</span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="relative h-32 w-32 flex items-center justify-center rounded-full border-8 border-slate-100">
              {/* Simulated donut chart using border trick */}
              <div className="absolute inset-[-8px] rounded-full border-8 border-emerald-500 [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] transform rotate-45 border-r-transparent border-b-transparent"></div>
              <div className="text-center">
                <span className="text-3xl font-bold text-slate-800">85%</span>
                <p className="text-xs text-slate-500">Overall</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-4 text-center">You need 75% to avoid the "NG" grade.</p>
          </div>
          
          <Link href="/student/attendance" className="mt-auto w-full inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors text-slate-700 group">
            Log Attendance Code
            <ChevronRight size={16} className="ml-1 text-slate-400 group-hover:text-slate-600" />
          </Link>
        </div>

        {/* Office Hours Queue */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center">
              <Clock size={18} className="text-indigo-500 mr-2" />
              Office Hours Queue
            </h2>
          </div>
          
          <div className="flex-1 flex flex-col justify-center gap-4">
            <div className="bg-indigo-50 p-4 rounded-xl text-center border border-indigo-100 border-dashed">
              <p className="text-sm text-indigo-700 font-medium mb-1">Not in any queue currently</p>
              <p className="text-xs text-indigo-500">Join a queue to speak with your lecturers today.</p>
            </div>
            
            <div className="space-y-3 mt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Now</p>
              <div className="flex items-center p-3 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer">
                <div className="h-10 w-10 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center text-slate-600 font-medium text-sm">
                  JD
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-slate-900">Dr. John Doe</p>
                  <p className="text-xs text-slate-500">Software Eng. • 3 waiting</p>
                </div>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">Open</span>
              </div>
            </div>
          </div>
          
          <Link href="/student/office-hours" className="mt-4 w-full inline-flex items-center justify-center p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm">
            Join a Queue
          </Link>
        </div>

        {/* Study Groups */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center">
              <Users size={18} className="text-blue-500 mr-2" />
              Study Groups
            </h2>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-slate-200 appearance-none cursor-pointer checked:right-0 checked:border-blue-500 transition-all" />
              <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-200 cursor-pointer"></label>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-6">Toggle your matching status to find peers in your modules.</p>
          
          <div className="flex-1 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Meets</p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-slate-800 text-sm">Mobile App Dev Prep</h4>
                <span className="text-xs text-slate-400">Tomorrow, 4 PM</span>
              </div>
              <div className="flex -space-x-2 overflow-hidden mb-3">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student${i}`}
                    alt=""
                  />
                ))}
              </div>
              <button className="text-xs text-blue-600 font-medium hover:underline">Open Shared Notes</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
