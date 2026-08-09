import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { getTimetableEntries } from "@/lib/actions/timetable"

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
const HOURS = Array.from({ length: 8 }, (_, i) => i + 8) // 8AM to 3PM

const dayColors: Record<string, string> = {
  MONDAY: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 text-blue-900",
  TUESDAY: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-900",
  WEDNESDAY: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-purple-900",
  THURSDAY: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-900",
  FRIDAY: "bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20 text-pink-900",
  SATURDAY: "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-900",
}

export default async function TimetablePage() {
  const entries = await getTimetableEntries()

  const grid: Record<string, Record<number, typeof entries[0]>> = {}
  for (const day of DAYS) {
    grid[day] = {}
    for (const hour of HOURS) {
      const entry = entries.find((e) => {
        if (e.dayOfWeek !== day) return false
        const startHour = new Date(e.startTime).getHours()
        return startHour === hour
      })
      if (entry) grid[day][hour] = entry
    }
  }

  return (
    <div>
      <PageHeader
        title="Timetable."
        subtitle="Weekly class schedule across all classes."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Entries" value={entries.length} accentColor="primary" />
        <StatCard label="Classes Scheduled" value={new Set(entries.map((e) => e.classId)).size} accentColor="secondary" />
      </div>

      <Card className="overflow-hidden bg-white/60 backdrop-blur-xl border-border/40 shadow-xl shadow-primary/5 rounded-3xl p-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40">
                <th className="px-6 py-4 font-display text-xs font-bold text-muted-foreground uppercase tracking-wider w-24">Time</th>
                {DAYS.map((day) => (
                  <th key={day} className="px-6 py-4 font-display text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[180px]">
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-b border-border/20 last:border-0 hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4 font-display font-medium text-muted-foreground">
                    {String(hour).padStart(2, "0")}:00
                  </td>
                  {DAYS.map((day) => {
                    const entry = grid[day][hour]
                    return (
                      <td key={day} className="p-2">
                        {entry ? (
                          <div className={`p-4 rounded-2xl border transition-all duration-300 cursor-default ${dayColors[day]}`}>
                            <div className="font-display font-bold text-sm mb-1">{entry.subject.name}</div>
                            <div className="text-xs opacity-80 font-medium">{entry.teacher.name}</div>
                            <div className="text-xs opacity-60 mt-2 flex items-center justify-between">
                              <span>{entry.class.name} {entry.class.section}</span>
                              {entry.classroom && (
                                <span className="px-2 py-0.5 rounded-full bg-black/5">{entry.classroom.name}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center p-4 text-muted-foreground/20 text-sm">—</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
