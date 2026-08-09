import { Sidebar } from "@/components/layouts/sidebar";
import { TopNav } from "@/components/layouts/top-nav";
import * as Icons from "lucide-react";

const studentNavItems: { title: string; href: string; icon: keyof typeof Icons }[] = [
  { title: "Dashboard", href: "/student", icon: "LayoutDashboard" },
  { title: "My Courses", href: "/student/courses", icon: "BookOpen" },
  { title: "Attendance", href: "/student/attendance", icon: "CheckSquare" },
  { title: "Assignments", href: "/student/assignments", icon: "FileEdit" },
  { title: "Timetable", href: "/student/timetable", icon: "Calendar" },
  { title: "Grades", href: "/student/grades", icon: "Award" },
  { title: "Fees", href: "/student/fees", icon: "CreditCard" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar items={studentNavItems} role="Student" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
