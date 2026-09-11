"use client";

import { LayoutDashboard, BookOpen, ClipboardCheck, FileText, GraduationCap, CalendarDays } from "lucide-react";
import { Shell } from "@/components/layouts/shell";

const links = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/classes", label: "My classes", icon: BookOpen },
  { href: "/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/teacher/assignments", label: "Assignments", icon: FileText },
  { href: "/teacher/exams", label: "Exams", icon: GraduationCap },
  { href: "/teacher/timetable", label: "Timetable", icon: CalendarDays },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell links={links} section="Teacher">
      {children}
    </Shell>
  );
}
