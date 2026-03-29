"use client";

import { useAuth } from "@/lib/AuthContext";
import { Star, BarChart, Download, ArrowUpRight, ArrowDownRight, MessageSquare } from "lucide-react";

export default function LecturerEvaluations() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Evaluations</h1>
          <p className="text-slate-500 mt-1">Anonymous aggregated feedback from your students.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition shadow-sm">
          <Download size={18} className="mr-2" />
          Export PDF
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col pt-[30%] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Overall Rating</p>
          <div className="flex items-end gap-3 font-semibold text-slate-900">
            <span className="text-4xl">4.8</span>
            <span className="text-slate-400 font-medium mb-1">/ 5.0</span>
            <span className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
               <ArrowUpRight size={14} className="mr-1" />
               0.2
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col pt-[30%] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Responses</p>
          <div className="flex items-end gap-3 font-semibold text-slate-900">
            <span className="text-4xl">142</span>
            <span className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
               <ArrowUpRight size={14} className="mr-1" />
               12%
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col pt-[30%] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Clarity & Presentation</p>
          <div className="flex items-end gap-3 font-semibold text-slate-900">
            <span className="text-4xl">4.9</span>
            <span className="text-slate-400 font-medium mb-1">/ 5.0</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col pt-[30%] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Workload Match</p>
          <div className="flex items-end gap-3 font-semibold text-slate-900">
            <span className="text-4xl">4.1</span>
            <span className="text-slate-400 font-medium mb-1">/ 5.0</span>
            <span className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full mb-1">
               <ArrowDownRight size={14} className="mr-1" />
               0.3
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Module Breakdown */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <BarChart size={20} className="mr-2 text-indigo-500" />
            Module Scores
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Software Engineering (CS400)</span>
                <span className="text-sm font-bold text-slate-900">4.8</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Data Structures (CS301)</span>
                <span className="text-sm font-bold text-slate-900">4.6</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Web Technologies (CS405)</span>
                <span className="text-sm font-bold text-slate-900">4.9</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Written Feedback */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <MessageSquare size={20} className="mr-2 text-purple-500" />
              Anonymous Comments
            </h2>
            <select className="border-none bg-slate-50 text-sm font-medium text-slate-600 rounded-lg px-3 py-1.5 focus:ring-0 outline-none">
              <option>All Modules</option>
              <option>CS400</option>
              <option>CS301</option>
            </select>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
              <div className="flex mb-3 gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-yellow-400 text-yellow-500" />)}
                <span className="ml-2 text-xs font-semibold text-slate-500">CS400</span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic">
                "Excellent teaching methodology. The real-world examples used in class really helped solidify my understanding of agile practices."
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
              <div className="flex mb-3 gap-0.5">
                {[1,2,3,4].map(i => <Star key={i} size={14} className="fill-yellow-400 text-yellow-500" />)}
                <Star size={14} className="text-slate-300" />
                <span className="ml-2 text-xs font-semibold text-slate-500">CS301</span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic">
                "Great class but the workload is a bit heavy towards the final weeks. Would appreciate if assignments were spaced out more."
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
              <div className="flex mb-3 gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-yellow-400 text-yellow-500" />)}
                <span className="ml-2 text-xs font-semibold text-slate-500">CS405</span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic">
                "Simply the best module this semester. Very interactive and up-to-date with modern tech stacks."
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
