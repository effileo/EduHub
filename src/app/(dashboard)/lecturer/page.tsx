import React, { Suspense } from 'react';
import { getUserOrRedirect } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SkeletonCard from '@/components/ui/SkeletonCard';
import { 
  GraduationCap, 
  Users, 
  Clock, 
  Star, 
  Plus, 
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight,
  FileText
} from 'lucide-react';
import Link from 'next/link';

async function LecturerHomeContent() {
  const { dbUser } = await getUserOrRedirect();

  // 1. Active Lab Session
  const activeSession = await prisma.labSession.findFirst({
    where: { lecturerId: dbUser.id, active: true },
    include: {
      _count: {
        select: { attendances: true }
      }
    }
  });

  // 2. Office Hours Queue
  const queueItems = await prisma.officeHourQueue.findMany({
    where: { lecturerId: dbUser.id, status: 'WAITING' },
    orderBy: { createdAt: 'asc' }
  });

  // 3. Evaluations average
  const evaluations = await prisma.evaluation.findMany({
    // In a real app, join with courses where lecturer is owner
    take: 10
  });

  const avgScore = evaluations.length > 0 
    ? (evaluations.reduce((acc, curr) => acc + curr.contentScore, 0) / evaluations.length).toFixed(1)
    : 'N/A';

  // 4. Pending Grading
  const assignments = await prisma.assignment.findMany({
    where: { lecturerId: dbUser.id }
  });

  const pendingGradingCount = await prisma.submission.count({
    where: { 
      assignmentId: { in: assignments.map(a => a.id) },
      score: null
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Lab Session Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <GraduationCap size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Active Lab Session</h3>
            </div>
            {activeSession && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
          
          <div className="p-8 flex-1">
            {activeSession ? (
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Access Code</p>
                    <p className="text-4xl font-black text-indigo-600 tracking-tighter">{activeSession.code}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance</p>
                      <p className="text-xl font-bold text-slate-800">{activeSession._count.attendances} Joined</p>
                    </div>
                  </div>
                  <Link href="/lecturer/attendance" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:gap-3 transition-all mt-2">
                    Manage Session <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                  {activeSession.qrCode ? (
                    <img src={activeSession.qrCode} alt="QR" className="w-24 h-24" />
                  ) : (
                    <div className="w-24 h-24 bg-white flex items-center justify-center text-slate-300">
                      <QrCode size={40} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <GraduationCap size={32} />
                </div>
                <h4 className="font-bold text-slate-800">No active lab sessions</h4>
                <p className="text-slate-500 text-xs mt-1 max-w-[200px]">Start a new session to begin tracking attendance.</p>
                <Link href="/lecturer/attendance" className="mt-6 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <Plus size={18} /> Start Session
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Office Hours Queue Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Clock size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Office Hours Queue</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{queueItems.length} Waiting</span>
          </div>

          <div className="p-8 flex-1">
            {queueItems.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Up Next</p>
                  <p className="text-sm font-bold text-slate-800 line-clamp-1">{queueItems[0].topic}</p>
                  <p className="text-[10px] text-amber-600 mt-1">Submitted {new Date(queueItems[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                
                <div className="flex gap-3">
                  <Link href="/lecturer/office-hours" className="flex-1 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl text-center hover:bg-slate-800 transition-all">
                    Admit Next
                  </Link>
                  <Link href="/lecturer/office-hours" className="px-4 py-3 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all">
                    View All
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <Users size={32} />
                </div>
                <h4 className="font-bold text-slate-800">Queue is empty</h4>
                <p className="text-slate-500 text-xs mt-1 max-w-[200px]">No students are currently waiting for office hours.</p>
                <Link href="/lecturer/office-hours" className="mt-6 px-6 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all">
                  Open Control Panel
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Evaluations */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Star size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Course Rating</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">{avgScore}</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-tighter">Avg. across all modules</p>
            <Link href="/lecturer/evaluations" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 mt-4 hover:underline">
              Read feedback <ArrowRight size={14} />
            </Link>
          </div>
          <div className="w-24 h-12 flex items-end gap-1 px-2">
             {[30, 45, 25, 60, 40, 75, 55].map((h, i) => (
               <div key={i} className="flex-1 bg-indigo-100 rounded-t-sm group-hover:bg-indigo-500 transition-colors" style={{ height: `${h}%` }} />
             ))}
          </div>
        </div>

        {/* Pending Grading */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Pending Grading</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">{pendingGradingCount}</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-tighter">Ungraded submissions</p>
            <Link href="/lecturer/grades" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 mt-4 hover:underline">
              Go to Gradebook <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-rose-50 transition-colors">
             <AlertCircle size={32} className="text-slate-200 group-hover:text-rose-200 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LecturerDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-64 bg-white rounded-3xl border border-slate-100 shadow-sm" />
        <div className="h-64 bg-white rounded-3xl border border-slate-100 shadow-sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export default async function LecturerPage() {
  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lecturer Control Panel</h1>
        <p className="text-slate-500 font-medium">Coordinate your labs, manage student queues, and track feedback.</p>
      </header>

      <Suspense fallback={<LecturerDashboardSkeleton />}>
        <LecturerHomeContent />
      </Suspense>
    </div>
  );
}
