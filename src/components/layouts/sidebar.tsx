"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface SidebarProps {
  items: {
    title: string;
    href: string;
    icon: keyof typeof Icons;
  }[];
  role: string;
}

export function Sidebar({ items, role }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border/40 bg-white/60 backdrop-blur-2xl text-foreground relative z-20 shadow-xl shadow-primary/5">
      
      {/* Brand Header */}
      <div className="flex h-20 items-center px-6 border-b border-border/40 bg-white/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 mr-3">
          <Icons.GraduationCap className="h-6 w-6 text-white" />
        </div>
        <span className="font-display font-black text-xl tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          CampusConnect
        </span>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-auto py-8 custom-scrollbar">
        <div className="px-6 mb-6">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 tracking-wider uppercase">
            {role} MODULES
          </div>
        </div>
        <nav className="flex flex-col gap-2 px-4">
          {items.map((item, index) => {
            const Icon = Icons[item.icon] as any;
            const isActive = 
              pathname === item.href || 
              (pathname.startsWith(item.href + "/") && !["/admin", "/student", "/teacher"].includes(item.href));
            
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white/20 rounded-r-full" />
                )}
                {Icon && <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />}
                <span className="tracking-wide">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="mt-auto border-t border-border/40 bg-white/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 rounded-full bg-gradient-to-tr from-primary/20 to-blue-500/20 text-primary items-center justify-center font-display font-bold border border-primary/10">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground leading-tight">{session?.user?.name || "User"}</span>
              <span className="text-xs text-muted-foreground font-medium">{role}</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
            title="Log out"
          >
            <Icons.LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
