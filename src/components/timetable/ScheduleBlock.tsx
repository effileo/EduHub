"use client"

interface ScheduleBlockProps {
  schedule: any
  color: string
}

export default function ScheduleBlock({ schedule, color }: ScheduleBlockProps) {
  // Calculate top and height based on startTime and endTime (8:00 to 20:00)
  const startHour = parseInt(schedule.startTime.split(':')[0])
  const startMin = parseInt(schedule.startTime.split(':')[1])
  const endHour = parseInt(schedule.endTime.split(':')[0])
  const endMin = parseInt(schedule.endTime.split(':')[1])

  const top = ((startHour - 8) * 60 + startMin) * 2 // 2px per minute
  const height = ((endHour - startHour) * 60 + (endMin - startMin)) * 2

  return (
    <div 
      className="absolute inset-x-1 rounded-xl p-3 shadow-sm border-l-4 transition-all hover:scale-[1.02] hover:shadow-md cursor-help group z-10"
      style={{ 
        top: `${top}px`, 
        height: `${height}px`,
        backgroundColor: `${color}15`, // Light version
        borderLeftColor: color,
        color: color
      }}
    >
      <p className="font-black text-xs truncate uppercase tracking-tighter">{schedule.courseId}</p>
      <p className="text-[10px] font-bold opacity-80">{schedule.startTime} - {schedule.endTime}</p>
      {schedule.room && (
        <p className="text-[10px] font-black mt-1 opacity-90 truncate">📍 {schedule.room}</p>
      )}
      
      {/* Tooltip */}
      <div className="absolute left-full ml-4 top-0 w-48 bg-slate-900 text-white p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
        <p className="font-black text-sm mb-1">{schedule.courseId}</p>
        <p className="text-xs text-slate-300 mb-2">{schedule.startTime} to {schedule.endTime}</p>
        <p className="text-xs font-bold text-indigo-400">Location: {schedule.room || 'TBA'}</p>
      </div>
    </div>
  )
}
