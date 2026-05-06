import React from 'react';
import { getUserOrRedirect } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from 'next/link';
import { MessageSquare, ChevronRight, AlertCircle } from 'lucide-react';

export default async function LecturerDiscussionsPage() {
  const { dbUser } = await getUserOrRedirect();

  // Fetch courses where the lecturer is enrolled or teaching
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: dbUser.id },
    include: {
      course: {
        include: {
          _count: {
            select: { 
              threads: true,
            }
          }
        }
      }
    }
  });

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forum Management</h1>
        <p className="text-slate-500 font-medium">Monitor and respond to student inquiries across your modules.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((e) => (
          <Link 
            key={e.courseId} 
            href={`/courses/${e.courseId}/discussion`}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <MessageSquare size={24} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{e.course.name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{e.courseId}</p>
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">
                {e.course._count.threads} threads
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
