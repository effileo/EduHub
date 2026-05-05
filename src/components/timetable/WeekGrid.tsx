"use client"

import ScheduleBlock from './ScheduleBlock'

interface WeekGridProps {
  schedules: any[]
}

export default function WeekGrid({ schedules }: WeekGridProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 to 20:00

  // Simple hash for consistent coloring
  const getColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444']
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="grid grid-cols-8 border-b border-slate-100">
        <div className="p-4 border-r border-slate-100 bg-slate-50/50" />
        {days.map(day => (
          <div key={day} className="p-4 text-center font-black text-slate-400 uppercase tracking-widest text-xs">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto max-h-[800px] relative">
        <div className="grid grid-cols-8 min-h-[1440px]"> {/* 2px per min * 60 min * 12 hours */}
          {/* Time Column */}
          <div className="border-r border-slate-100 bg-slate-50/30">
            {hours.map(hour => (
              <div key={hour} className="h-[120px] p-2 text-right text-[10px] font-black text-slate-300 relative">
                {hour}:00
                <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-50">{hour}:30</div>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {days.map((_, dayIdx) => (
            <div key={dayIdx} className="relative border-r border-slate-100 last:border-r-0">
              {/* Background Grid Lines */}
              {hours.map(hour => (
                <div key={hour} className="h-[120px] border-b border-slate-50" />
              ))}
              
              {/* Schedule Blocks */}
              {schedules
                .filter(s => s.dayOfWeek === (dayIdx + 1) % 7) // Adjusting to match Mon=1...Sun=0 or similar
                .map(s => (
                  <ScheduleBlock key={s.id} schedule={s} color={getColor(s.courseId)} />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
