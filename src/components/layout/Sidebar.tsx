"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ClipboardList, 
  Clock, 
  Users, 
  GraduationCap, 
  Calendar, 
  MessageSquare, 
  Star, 
  FileText,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  role: 'STUDENT' | 'LECTURER' | 'ADMIN';
  className?: string;
}

const Sidebar = ({ role, className = "" }: SidebarProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const studentLinks = [
    { name: 'Home', href: '/student', icon: Home },
    { name: 'Attendance', href: '/student/attendance', icon: ClipboardList },
    { name: 'Office Hours', href: '/student/office-hours', icon: Clock },
    { name: 'Study Groups', href: '/student/study-groups', icon: Users },
    { name: 'Grades', href: '/student/grades', icon: GraduationCap },
    { name: 'Timetable', href: '/student/timetable', icon: Calendar },
    { name: 'Discussions', href: '/student/discussions', icon: MessageSquare },
  ];

  const lecturerLinks = [
    { name: 'Home', href: '/lecturer', icon: Home },
    { name: 'Attendance', href: '/lecturer/attendance', icon: ClipboardList },
    { name: 'Office Hours', href: '/lecturer/office-hours', icon: Clock },
    { name: 'Evaluations', href: '/lecturer/evaluations', icon: Star },
    { name: 'Grades', href: '/lecturer/grades', icon: GraduationCap },
    { name: 'Resources', href: '/lecturer/resources', icon: FileText },
    { name: 'Discussions', href: '/lecturer/discussions', icon: MessageSquare },
  ];

  const links = role === 'STUDENT' ? studentLinks : lecturerLinks;

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-3 rounded-full shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        ${className}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
      `}>
        <div className="h-16 flex items-center px-6 lg:hidden border-b border-slate-100">
          <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">EduHub</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                <Icon size={20} className={`mr-3 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Support</p>
            <Link href="/help" className="text-sm text-slate-600 hover:text-indigo-600 flex items-center">
              <MessageSquare size={16} className="mr-2" />
              Help Center
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
