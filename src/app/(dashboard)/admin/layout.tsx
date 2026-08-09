import { Sidebar } from "@/components/layouts/sidebar";
import { TopNav } from "@/components/layouts/top-nav";
import * as Icons from "lucide-react";

const adminNavItems: { title: string; href: string; icon: keyof typeof Icons }[] = [
  { title: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { title: "Academic Setup", href: "/admin/academics/setup", icon: "Settings" },
  { title: "Users", href: "/admin/users", icon: "Users" },
  { title: "Campuses", href: "/admin/campuses", icon: "Building" },
  { title: "Departments", href: "/admin/departments", icon: "Building2" },
  { title: "Classes", href: "/admin/classes", icon: "GraduationCap" },
  { title: "Subjects", href: "/admin/subjects", icon: "BookOpen" },
  { title: "Timetable", href: "/admin/timetable", icon: "Calendar" },
  { title: "Fees", href: "/admin/fees", icon: "Receipt" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar items={adminNavItems} role="Administrator" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
