import { Sidebar } from "@/components/layouts/sidebar";
import { TopNav } from "@/components/layouts/top-nav";
import * as Icons from "lucide-react";

const teacherNavItems: { title: string; href: string; icon: keyof typeof Icons }[] = [
  { title: "Dashboard", href: "/teacher", icon: "LayoutDashboard" },
  { title: "My Classes", href: "/teacher/classes", icon: "GraduationCap" },
  { title: "Attendance", href: "/teacher/attendance", icon: "CheckSquare" },
  { title: "Assignments", href: "/teacher/assignments", icon: "BookOpen" },
  { title: "Exams", href: "/teacher/exams", icon: "FileText" },
  { title: "Timetable", href: "/teacher/timetable", icon: "Calendar" },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar items={teacherNavItems} role="Teacher" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
