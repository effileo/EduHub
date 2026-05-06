import React from 'react';
import { getUserOrRedirect } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from 'next/link';
import { FileText, ChevronRight, Upload, HardDrive } from 'lucide-react';

export default async function LecturerResourcesPage() {
  const { dbUser } = await getUserOrRedirect();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: dbUser.id },
    include: {
      course: {
        include: {
          _count: {
            select: { resources: true }
          }
        }
      }
    }
  });

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resource Management</h1>
          <p className="text-slate-500 font-medium">Upload and organize learning materials for your students.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((e) => (
          <Link 
            key={e.courseId} 
            href={`/courses/${e.courseId}/resources`}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <FileText size={24} />
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{e.course.name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{e.courseId}</p>
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">
                {e.course._count.resources} documents
              </p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <Upload size={14} />
                Upload New
              </div>
            </div>
          </Link>
        ))}
      </div>

      {enrollments.length === 0 && (
        <div className="bg-white p-12 rounded-[40px] border border-dashed border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <HardDrive size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No courses assigned</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">You are not currently enrolled as a lecturer in any modules.</p>
        </div>
      )}
    </div>
  );
}
