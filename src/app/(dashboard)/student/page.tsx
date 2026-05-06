import React, { Suspense } from 'react';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { getUserOrRedirect } from "@/lib/auth";
// import prisma from "@/lib/prisma";
import SkeletonCard from '@/components/ui/SkeletonCard';
import { 
  GraduationCap, 
  Users, 
  Clock, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  ClipboardList,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

async function StudentHomeContent() {
  const { dbUser } = await getUserOrRedirect();

  // 1. Fetch Summary Data
  // Test if course model works
  const coursesTest = await (prisma as any).course.findMany({});
  console.log("Courses found:", coursesTest.length);

  const enrollments = await (prisma as any).enrollment.findMany({
    where: { userId: dbUser.id },
    include: {
      course: {
        include: {
          _count: {
            select: { enrollments: true }
          }
        }
      }
    }
  });

  const courseIds = enrollments.map(e => e.courseId);

  // Attendance Logic
  const allSessions = await prisma.labSession.findMany({
    where: { courseId: { in: courseIds } }
  });
  
  const myAttendances = await prisma.attendance.findMany({
    where: { 
      studentId: dbUser.id,
      labSessionId: { in: allSessions.map(s => s.id) }
    }
  });

  const overallAttendance = allSessions.length > 0 
    ? Math.round((myAttendances.length / allSessions.length) * 100) 
    : 100;

  // Pending Assignments
  const allAssignments = await prisma.assignment.findMany({
    where: { courseId: { in: courseIds } }
  });

  const mySubmissions = await prisma.submission.findMany({
    where: { studentId: dbUser.id }
  });

  const pendingAssignmentsCount = allAssignments.length - mySubmissions.length;

  // Queue Position
  const queueEntry = await prisma.officeHourQueue.findFirst({
    where: { studentId: dbUser.id, status: 'WAITING' },
    orderBy: { createdAt: 'asc' }
  });

  // 2. Upcoming Deadlines (next 3)
  const upcomingDeadlines = await prisma.assignment.findMany({
    where: { 
      courseId: { in: courseIds },
      dueDate: { gt: new Date() }
    },
    orderBy: { dueDate: 'asc' },
    take: 3
  });

  // 3. Study Groups
  const studyGroups = await prisma.studyGroup.findMany({
    where: { 
      members: { some: { userId: dbUser.id } }
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      _count: {
        select: { members: true }
      }
    },
    take: 3
  });

  // 4. Available Office Hours (Lecturers with active sessions or queues)
  // For simplicity, we fetch all lecturers for the courses
  const lecturers = await prisma.user.findMany({
    where: { role: 'LECTURER' }, // In a real app, filter by course
    take: 3
  });

  // 5. Attendance Risk calculation
  const attendanceRisks = [];
  for (const courseId of courseIds) {
    const courseSessions = allSessions.filter(s => s.courseId === courseId);
    const courseAttendances = myAttendances.filter(a => courseSessions.some(cs => cs.id === a.labSessionId));
    const rate = courseSessions.length > 0 ? (courseAttendances.length / courseSessions.length) * 100 : 100;
    
    if (rate < 75) {
      const courseName = enrollments.find(e => e.courseId === courseId)?.course.name;
      attendanceRisks.push({ courseName, rate: Math.round(rate) });
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Priority Alerts */}
      {attendanceRisks.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-2xl shadow-sm flex items-start gap-4">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-800 font-bold">Attendance Risk Warning</h3>
            <p className="text-red-700 text-sm mt-1">
              You are currently below 75% attendance in: {attendanceRisks.map(r => `${r.courseName} (${r.rate}%)`).join(', ')}. 
              Contact your lecturers to avoid an "Incomplete (NG)" grade.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ClipboardList size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{overallAttendance}%</p>
          <p className="text-xs text-slate-500 mt-1">Overall presence</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <GraduationCap size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GPA</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{dbUser.gpa?.toFixed(2) || 'N/A'}</p>
          <p className="text-xs text-slate-500 mt-1">Academic standing</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignments</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{pendingAssignmentsCount}</p>
          <p className="text-xs text-slate-500 mt-1">Pending submissions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Office Hours</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{queueEntry ? `#${queueEntry.position}` : 'None'}</p>
          <p className="text-xs text-slate-500 mt-1">Active queue position</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Deadlines */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 px-1">Upcoming Deadlines</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
            {upcomingDeadlines.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic">No upcoming deadlines</div>
            ) : (
              upcomingDeadlines.map((a) => (
                <div key={a.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-800 text-sm">{a.title}</h4>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      {new Date(a.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{a.courseId}</p>
                </div>
              ))
            )}
            <Link href="/student/grades" className="block p-3 text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
              View All Assignments
            </Link>
          </div>
        </div>

        {/* My Study Groups */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 px-1">My Study Groups</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
            {studyGroups.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic">You haven't joined any groups</div>
            ) : (
              studyGroups.map((g) => (
                <div key={g.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-slate-800 text-sm">{g.title}</h4>
                    <span className="text-[10px] text-slate-400">{g._count.members} members</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate italic">
                    {g.messages[0] ? `"${g.messages[0].body}"` : 'No messages yet'}
                  </p>
                </div>
              ))
            )}
            <Link href="/student/study-groups" className="block p-3 text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
              Find More Groups
            </Link>
          </div>
        </div>

        {/* Available Office Hours */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 px-1">Available Office Hours</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
            {lecturers.map((l) => (
              <div key={l.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={l.avatar || ''} className="w-8 h-8 rounded-full bg-slate-100" alt={l.name} />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{l.name}</h4>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                      Live Now
                    </p>
                  </div>
                </div>
                <Link href="/student/office-hours" className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                  <ChevronRight size={18} />
                </Link>
              </div>
            ))}
            <Link href="/student/office-hours" className="block p-3 text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
              Full Schedule
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="h-64 bg-white rounded-2xl border border-slate-100 shadow-sm" />
        <div className="h-64 bg-white rounded-2xl border border-slate-100 shadow-sm" />
        <div className="h-64 bg-white rounded-2xl border border-slate-100 shadow-sm" />
      </div>
    </div>
  );
}

export default async function StudentPage() {
  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Overview</h1>
        <p className="text-slate-500 font-medium">Manage your progress, deadlines, and collaborations.</p>
      </header>

      <Suspense fallback={<StudentDashboardSkeleton />}>
        <StudentHomeContent />
      </Suspense>
    </div>
  );
}
