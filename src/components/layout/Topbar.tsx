"use client";

import React, { useState } from 'react';
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/notifications/NotificationBell';
import { ChevronDown, LogOut, User, Settings, Bell } from 'lucide-react';
import Link from 'next/link';

interface TopbarProps {
  user: any;
}

const Topbar = ({ user }: TopbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">E</div>
          <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">EduHub</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationBell />
        
        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
        
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-50 transition-colors"
          >
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
              alt="Avatar" 
              className="h-8 w-8 rounded-full bg-slate-100 ring-2 ring-white shadow-sm" 
            />
            <div className="hidden md:block text-left mr-1">
              <p className="text-sm font-semibold text-slate-700 leading-none">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{user.role}</p>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-50">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                
                <div className="p-1">
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={18} />
                    My Profile
                  </Link>
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={18} />
                    Account Settings
                  </Link>
                </div>

                <div className="p-1 border-t border-slate-50 mt-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
