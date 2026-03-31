"use client";

import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function StudentAttendance() {
  const { user } = useAuth();
  const [code, setCode] = useState(["", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [history] = useState([
    { date: "Oct 24, 2024", course: "Software Engineering (CS400)", status: "Attended" },
    { date: "Oct 22, 2024", course: "Data Structures (CS301)", status: "Missed" },
    { date: "Oct 19, 2024", course: "Software Engineering (CS400)", status: "Attended" },
  ]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 3) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 4) return;
    
    setStatus("loading");
    
    // Simulate network request with 1.2s delay to mimic server-side validation
    setTimeout(() => {
      // Mock validation logic
      if (fullCode === "4912") {
        setStatus("success");
      } else {
        setStatus("error");
      }
    }, 1200);
  };

  const calculateAttendance = () => {
    const attended = history.filter(h => h.status === "Attended").length;
    return Math.round((attended / history.length) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Verification Column */}
      <div className="flex justify-center flex-col h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Check Into Lab</h1>
          <p className="text-slate-500 mt-1">Enter the 4-digit PIN provided by your lecturer.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-100 flex flex-col items-center max-w-md w-full mx-auto">
          {status === "success" ? (
            <div className="text-center animate-in fade-in zoom-in-95 duration-500 py-6">
              <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-500 shadow-inner">
                <CheckCircle2 size={40} className="stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Check-in Complete</h3>
              <p className="text-slate-500">Your attendance for Software Engineering (CS400) has been recorded successfully.</p>
              
              <button 
                onClick={() => { setStatus("idle"); setCode(["", "", "", ""]); }}
                className="mt-8 px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-full hover:bg-slate-200 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
              
              <div className="flex justify-center gap-3 sm:gap-4 mb-8">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`code-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-14 h-16 sm:w-16 sm:h-20 text-center text-3xl sm:text-4xl font-mono font-bold rounded-2xl border-2 transition-all outline-none 
                      ${status === 'error' 
                        ? 'border-red-300 bg-red-50 text-red-700 focus:border-red-500' 
                        : 'border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white text-indigo-900 focus:ring-4 focus:ring-indigo-100 shadow-inner'}`}
                  />
                ))}
              </div>

              {status === "error" && (
                <div className="flex items-center text-red-600 mb-6 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium animate-in shake">
                  <AlertCircle size={16} className="mr-2" />
                  Invalid or expired code. Please try again.
                </div>
              )}

              <button
                type="submit"
                disabled={code.join("").length !== 4 || status === "loading"}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white rounded-2xl font-bold text-lg transition-all shadow-md flex items-center justify-center group"
              >
                {status === "loading" ? (
                  <Loader2 className="animate-spin text-white opacity-80" size={24} />
                ) : (
                  <>
                    Verify Attendance
                  </>
                )}
              </button>
              
              <p className="mt-8 text-xs text-slate-400 text-center">
                Demo Hint: Valid code to test success is <span className="font-mono bg-slate-100 px-1 rounded">4912</span>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* History Column */}
      <div className="flex flex-col h-full lg:pt-0 pt-8 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Attendance History</h2>
        
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Overall Rate</p>
              <h3 className="text-3xl font-bold text-slate-900">{calculateAttendance()}%</h3>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                calculateAttendance() >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {calculateAttendance() >= 75 ? 'Good Standing' : 'At Risk (NG)'}
              </span>
            </div>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2 mt-6 overflow-hidden">
            <div 
              className={`h-2 rounded-full ${calculateAttendance() >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} 
              style={{ width: `${calculateAttendance()}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex justify-between">
            <span>Minimum req: 75%</span>
            <span>You have: {calculateAttendance()}%</span>
          </p>
        </div>

        <h3 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-4">Recent Sessions</h3>
        <ul className="space-y-4">
          {history.map((record, i) => (
            <li key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800 text-sm mb-1">{record.course}</p>
                <p className="text-xs text-slate-500">{record.date}</p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-medium rounded ${
                record.status === 'Attended' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {record.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
