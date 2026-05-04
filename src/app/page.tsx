"use client";

import { useAuth, UserRole } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { LogIn, GraduationCap, Users } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { user, login } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to their role-specific dashboard automatically
  useEffect(() => {
    if (user?.role === "student") router.push("/student");
    if (user?.role === "lecturer") router.push("/lecturer");
  }, [user, router]);

  const handleLogin = (role: UserRole) => {
    login(role);
    router.push(`/${role}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-indigo-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] max-w-md bg-indigo-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] max-w-md bg-emerald-500/20 rounded-full blur-[100px]" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-10 mt-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg text-white">
              <GraduationCap size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">EduHub Connect</h1>
          <p className="text-center text-slate-500 mb-10">Sign in to your academic dashboard</p>

          <div className="space-y-4">
            <button
              onClick={() => handleLogin("student")}
              className="w-full flex items-center p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-slate-900">Student Portal</h3>
                <p className="text-sm text-slate-500">Access classes and study groups</p>
              </div>
              <LogIn className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </button>

            <button
              onClick={() => handleLogin("lecturer")}
              className="w-full flex items-center p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <GraduationCap size={24} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-slate-900">Lecturer Portal</h3>
                <p className="text-sm text-slate-500">Manage sessions and office hours</p>
              </div>
              <LogIn className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            This is a mock authentication interface for prototype demonstration.
          </p>
        </div>
      </div>
    </main>
  );
}
