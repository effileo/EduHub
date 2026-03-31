"use client";

import { useAuth } from "@/lib/AuthContext";
import { PlusCircle, Users, BarChart, Settings, Mail } from "lucide-react";
import Link from "next/link";

export default function LecturerDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          Lecturer Dashboard
          <span className="ml-3 px-2 py-0.5 rounded text-xs leading-5 bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
            Active: {user?.name}
          </span>
        </h1>
        <p className="text-slate-500 mt-1">Manage your sessions, queues, and student evaluations.</p>
      </header>

      {/* Quick Actions Bar - primary lecturer shortcuts for managing sessions and alerts */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button className="flex-shrink-0 flex items-center px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          <PlusCircle size={18} className="mr-2" />
          New Lab Session
        </button>
        <button className="flex-shrink-0 flex items-center px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <Users size={18} className="mr-2 text-indigo-600" />
          Open Office Hours
        </button>
        <button className="flex-shrink-0 flex items-center px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors shadow-sm">
          <Mail size={18} className="mr-2" />
          Broadcast Alert
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Lab Sessions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-slate-900 border-b-2 border-indigo-500 pb-1 inline-block">Today's Lab Sessions</h2>
            <Link href="/lecturer/sessions" className="text-indigo-600 text-sm font-medium hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors bg-slate-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-slate-800">Software Engineering (CS400)</h3>
                  <p className="text-sm text-slate-500">10:00 AM - 12:00 PM • Lab 2</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-semibold uppercase text-emerald-600 tracking-wider">Active Code</span>
                  <span className="text-2xl font-mono font-bold tracking-widest text-slate-900">4912</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                <div className="flex -space-x-2">
                  <span className="z-10 inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 ring-2 ring-white">
                    <span className="text-xs font-medium leading-none text-indigo-700">+34</span>
                  </span>
                  <p className="ml-10 text-xs font-medium text-slate-500">students checked in (85%)</p>
                </div>
                
                <button className="text-sm text-red-600 font-medium hover:underline">Close Session</button>
              </div>
            </div>
            
            {/* Empty State Mock */}
            <div className="p-6 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <PlusCircle size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">No other sessions today</p>
              <p className="text-xs text-slate-400 max-w-xs">You can pre-generate access codes for upcoming classes in advance.</p>
            </div>
          </div>
        </div>

        {/* Office Hours Queue */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-slate-900 border-b-2 border-emerald-500 pb-1 inline-block">Live Office Queue</h2>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300"></span>
              <span className="text-xs text-slate-500 font-medium">Currently Offline</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 py-8">
            <Users size={48} className="text-slate-300 mb-4" />
            <h3 className="text-slate-600 font-medium mb-2">Start a live queue to see waiting students</h3>
            <p className="text-sm text-slate-400 max-w-sm">
              When activated, students can join your queue virtually, and you can call them in one by one.
            </p>
            <button className="mt-6 inline-flex items-center px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-200">
              Start Queue Session
            </button>
          </div>
        </div>
        
        {/* Module Analytics */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-slate-900 border-b-2 border-blue-500 pb-1 inline-block">Evaluation Overview</h2>
            <Link href="/lecturer/evaluations" className="text-indigo-600 text-sm font-medium hover:underline flex items-center">
              <BarChart size={16} className="mr-1" /> View Full Report
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Software Engineering (CS400)', 'Data Structures (CS301)', 'Web Technologies (CS405)'].map((course, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-medium text-slate-800 text-sm mb-3 truncate">{course}</h4>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold leading-none text-slate-900">{4.8 - (idx * 0.2)}</span>
                  <span className="text-sm font-medium text-slate-500 mb-0.5">/ 5.0</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(4.8 - (idx * 0.2)) / 5 * 100}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">{45 - (idx * 12)} reviews</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
