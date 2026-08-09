import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { getTimetableEntries } from "@/lib/actions/timetable"

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
const HOURS = Array.from({ length: 8 }, (_, i) => i + 8) // 8AM to 3PM

const dayColors: Record<string, string> = {
  MONDAY: "bg-primary/10 border-primary/20",
  TUESDAY: "bg-secondary/10 border-secondary/20",
  WEDNESDAY: "bg-accent/10 border-accent/20",
  THURSDAY: "bg-primary/10 border-primary/20",
  FRIDAY: "bg-secondary/10 border-secondary/20",
  SATURDAY: "bg-accent/10 border-accent/20",
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

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-serif text-sm font-semibold text-foreground/70 w-24">Time</th>
                {DAYS.map((day) => (
                  <th key={day} className="px-4 py-3 font-serif text-sm font-semibold text-foreground/70 min-w-[140px]">
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-b border-border/50">
                  <td className="px-4 py-2 font-hand text-lg text-foreground/60">
                    {String(hour).padStart(2, "0")}:00
                  </td>
                  {DAYS.map((day) => {
                    const entry = grid[day][hour]
                    return (
                      <td key={day} className="px-2 py-2">
                        {entry ? (
                          <div className={`p-2 border text-xs ${dayColors[day]}`}>
                            <div className="font-serif font-bold text-sm">{entry.subject.name}</div>
                            <div className="font-hand text-foreground/60 mt-1">{entry.teacher.name}</div>
                            <div className="font-hand text-foreground/40">{entry.class.name} {entry.class.section}</div>
                            {entry.classroom && (
                              <div className="font-hand text-foreground/40">{entry.classroom.name}</div>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 text-foreground/10 font-hand text-sm">—</div>
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
