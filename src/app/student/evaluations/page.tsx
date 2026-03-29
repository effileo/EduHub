"use client";

import { useState } from "react";
import { Star, ShieldCheck, Send } from "lucide-react";

export default function StudentEvaluations() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [module, setModule] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0 && module) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">End-of-Semester Evaluations</h1>
          <p className="text-slate-500 mt-1">Provide constructive feedback to help faculty improve.</p>
        </div>
        
        <div className="flex items-center text-sm font-medium px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full shadow-sm">
          <ShieldCheck size={18} className="mr-2" />
          100% Anonymous Guaranteed
        </div>
      </div>

      {!submitted ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
               <label className="block text-sm font-semibold text-slate-900 mb-2">Select Module to Evaluate</label>
               <select 
                 value={module}
                 onChange={(e) => setModule(e.target.value)}
                 className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-slate-800 bg-slate-50"
                 required
               >
                 <option value="" disabled>Choose your enrolled module...</option>
                 <option value="cs400">Software Engineering (CS400) - Dr. O'Brien</option>
                 <option value="cs301">Data Structures (CS301) - Dr. Smith</option>
               </select>
            </div>

            <div className="pt-6 border-t border-slate-100">
               <label className="block text-sm font-semibold text-slate-900 mb-4 text-center">Overall Satisfaction</label>
               <div className="flex justify-center gap-2">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button
                     key={star}
                     type="button"
                     className="p-1 transition-transform hover:scale-110 focus:outline-none"
                     onClick={() => setRating(star)}
                     onMouseEnter={() => setHoverRating(star)}
                     onMouseLeave={() => setHoverRating(0)}
                   >
                     <Star 
                       size={48} 
                       className={`transition-colors duration-200 ${
                         (hoverRating || rating) >= star 
                           ? "fill-yellow-400 text-yellow-500" 
                           : "text-slate-200"
                       }`} 
                     />
                   </button>
                 ))}
               </div>
               <p className="text-center text-xs font-semibold text-purple-600 mt-3 h-4">
                 {rating === 1 && "Very Dissatisfied"}
                 {rating === 2 && "Dissatisfied"}
                 {rating === 3 && "Neutral"}
                 {rating === 4 && "Satisfied"}
                 {rating === 5 && "Highly Satisfied"}
               </p>
            </div>

            <div className="pt-6 border-t border-slate-100">
               <label className="block text-sm font-semibold text-slate-900 mb-2">Written Feedback</label>
               <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                 Please provide constructive comments about the teaching style, workload, or course content. Your identity is hidden.
               </p>
               <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-slate-800 bg-slate-50 resize-y min-h-[120px]"
                  placeholder="e.g. The projects were very helpful, but the exams felt disconnected from the lectures..."
               ></textarea>
            </div>

            <div className="pt-4 flex justify-end">
               <button 
                 type="submit"
                 disabled={rating === 0 || module === ""}
                 className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none transition-all flex items-center group"
               >
                 Submit Anonymous Evaluation
                 <Send size={18} className="ml-2 group-disabled:opacity-50" />
               </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 max-w-2xl mx-auto text-center animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Feedback Submitted</h2>
          <p className="text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
            Thank you for helping us improve academic quality. Your responses have been encrypted and submitted anonymously to the faculty dashboard.
          </p>
          <button 
            onClick={() => {
              setSubmitted(false);
              setRating(0);
              setFeedback("");
              setModule("");
            }}
            className="px-8 py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-full hover:bg-slate-50 transition-colors"
          >
            Evaluate Another Course
          </button>
        </div>
      )}
    </div>
  );
}
