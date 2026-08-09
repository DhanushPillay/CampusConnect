"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { GrainOverlay } from "@/components/ui/grain-overlay";

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
    <div className="flex h-screen w-64 flex-col border-r border-border/40 bg-white/80 backdrop-blur-xl text-foreground relative z-20">
      
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6">
        <Icons.GraduationCap className="mr-3 h-6 w-6 text-primary" />
        <span className="font-display font-black tracking-tighter uppercase">CampusConnect</span>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-auto py-6">
        <div className="px-6 mb-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{role} modules</span>
        </div>
        <nav className="flex flex-col gap-1 px-4">
          {items.map((item, index) => {
            const Icon = Icons[item.icon] as any;
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="tracking-wide">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="mt-auto border-t border-border/40 bg-white/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 rounded-full bg-primary/10 text-primary items-center justify-center font-display font-bold">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground leading-tight">{session?.user?.name || "User"}</span>
              <span className="text-xs text-muted-foreground">{role}</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
            title="Log out"
          >
            <Icons.LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
