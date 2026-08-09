import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { getTimetableEntries } from "@/lib/actions/timetable"
import { getStudentClasses } from "@/lib/actions/student"
import { getCurrentUser } from "@/lib/auth"

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]

export default async function StudentTimetablePage() {
  const user = await getCurrentUser()
  const enrollments = user?.id ? await getStudentClasses(user.id) : []
  const classIds = enrollments.map((e) => e.class.id)

  const allEntries: Awaited<ReturnType<typeof getTimetableEntries>> = []
  for (const classId of classIds) {
    const entries = await getTimetableEntries({ classId })
    allEntries.push(...entries)
  }

  const schedule = DAYS.map((day) => ({
    day,
    label: day.charAt(0) + day.slice(1).toLowerCase(),
    entries: allEntries.filter((e) => e.dayOfWeek === day),
  }))

  const totalClasses = allEntries.length
  const freeDays = schedule.filter((s) => s.entries.length === 0).length

  return (
    <div>
      <PageHeader
        title="My Timetable."
        subtitle="Your weekly class schedule."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Classes This Week" value={totalClasses} accentColor="primary" />
        <StatCard label="Free Days" value={freeDays} accentColor="secondary" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schedule.map((day) => (
          <Card key={day.day} className="p-4">
            <h3 className="font-display font-bold text-lg uppercase mb-3">{day.label}</h3>
            {day.entries.length === 0 ? (
              <p className="font-hand text-lg text-foreground/30">No classes</p>
            ) : (
              <div className="space-y-2">
                {day.entries.map((entry) => (
                  <div key={entry.id} className="p-2 border border-border/50 bg-surface-warm">
                    <div className="font-serif font-bold text-sm">{entry.subject.name}</div>
                    <div className="font-hand text-foreground/60">
                      {new Date(entry.startTime).getHours()}:00 - {new Date(entry.endTime).getHours()}:00
                    </div>
                    <div className="font-hand text-foreground/40">{entry.teacher.name}</div>
                    {entry.classroom && (
                      <div className="font-hand text-foreground/40">{entry.classroom.name}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
