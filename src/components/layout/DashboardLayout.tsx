"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  UserSquare2, 
  Clock, 
  Users, 
  Star 
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children, roleRequired }: { children: React.ReactNode, roleRequired: "student" | "lecturer" }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else if (user.role !== roleRequired) {
      router.push(`/${user.role}`);
    }
  }, [user, roleRequired, router]);

  if (!user || user.role !== roleRequired) return null;

  // Sidebar navigation links for the student role
  const studentLinks = [
    { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    { name: "Attendance", href: "/student/attendance", icon: UserSquare2 },
    { name: "Office Hours", href: "/student/office-hours", icon: Clock },
    { name: "Study Groups", href: "/student/study-groups", icon: Users },
    { name: "Evaluations", href: "/student/evaluations", icon: Star },
  ];

  const lecturerLinks = [
    { name: "Dashboard", href: "/lecturer", icon: LayoutDashboard },
    { name: "Lab Sessions", href: "/lecturer/sessions", icon: UserSquare2 },
    { name: "Office Hours", href: "/lecturer/office-hours", icon: Clock },
    { name: "Evaluations", href: "/lecturer/evaluations", icon: Star },
  ];

  const links = roleRequired === "student" ? studentLinks : lecturerLinks;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">EduHub</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 font-medium" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={20} className={`mr-3 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"}`} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center px-3 py-2">
            <img src={user.avatar} alt="Avatar" className="h-9 w-9 rounded-full bg-slate-100 ring-2 ring-white" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-700">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full mt-2 flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
            <Menu size={24} />
          </button>
          
          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors rounded-full hover:bg-slate-50">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
