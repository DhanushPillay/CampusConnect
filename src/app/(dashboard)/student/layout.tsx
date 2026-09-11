"use client";

import { LayoutDashboard, ClipboardCheck, FileText, Award, CalendarDays, Wallet } from "lucide-react";
import { Shell } from "@/components/layouts/shell";

const links = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/student/assignments", label: "Assignments", icon: FileText },
  { href: "/student/grades", label: "Grades", icon: Award },
  { href: "/student/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/student/fees", label: "Fees", icon: Wallet },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell links={links} section="Student">
      {children}
    </Shell>
  );
}
