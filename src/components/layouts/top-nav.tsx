"use client";

import { usePathname } from "next/navigation";
import { User as UserIcon, Bell } from "lucide-react";
import { useSession } from "next-auth/react";

export function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Create simple breadcrumb from pathname
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumb = paths.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" / ");

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/40 bg-white/80 px-6 text-foreground relative z-10 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium tracking-tight text-muted-foreground flex items-center gap-2">
          Dashboard <span className="text-border">/</span> <span className="text-foreground font-semibold">{breadcrumb || "Overview"}</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted/50">
          <Bell className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full hidden sm:flex items-center gap-2 border border-primary/20">
          <UserIcon className="h-4 w-4" />
          {session?.user?.email || "Unauthenticated"}
        </div>
      </div>
    </header>
  );
}
