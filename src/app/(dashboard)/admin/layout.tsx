"use client";

import { LayoutDashboard, Users, School, BookOpen, CalendarDays, Wallet } from "lucide-react";
import { Shell } from "@/components/layouts/shell";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/classes", label: "Classes", icon: School },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/admin/fees", label: "Fees", icon: Wallet },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell links={links} section="Admin">
      {children}
    </Shell>
  );
}
