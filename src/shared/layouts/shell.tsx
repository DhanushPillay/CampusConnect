"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { PageTransition } from "@/shared/motion";

export type NavLink = { href: string; label: string; icon: LucideIcon };

export function Shell({
  links,
  section,
  children,
}: {
  links: NavLink[];
  section: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar links={links} open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 flex-1">
        <TopNav section={section} onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-6xl p-5 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

function NavItem({ link, active, onClose }: { link: NavLink; active: boolean; onClose: () => void }) {
  const Icon = link.icon;
  return (
    <Link
      key={link.href}
      href={link.href}
      onClick={onClose}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active ? "bg-brand-50 font-semibold text-brand-700" : "font-medium text-sub hover:bg-surface hover:text-ink"
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-brand-600 to-magenta"
        />
      )}
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors",
          active ? "bg-brand-600 text-white shadow-card" : "bg-brand-50/60 text-brand-700 group-hover:bg-brand-100"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      {link.label}
    </Link>
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-sub/70">
      {children}
    </p>
  );
}

function Sidebar({
  links,
  open,
  onClose,
}: {
  links: NavLink[];
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { data } = useSession();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const [head, ...rest] = links;
  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-ink/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 -translate-x-full flex-col border-r border-border/70 bg-white shadow-[1px_0_24px_-12px_rgba(94,45,145,0.25)] transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open && "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <Image
              src="/mit-adt-crest.png"
              alt="MIT-ADT University crest"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full ring-2 ring-brand-100"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sub">
                MIT-ADT University
              </p>
              <p className="font-display text-[17px] font-extrabold leading-none tracking-tight text-ink">
                CampusConnect
              </p>
            </div>
          </div>
          <button aria-label="Close menu" onClick={onClose} className="rounded-md p-1 text-sub hover:bg-surface lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Primary" className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
          {head && (
            <div>
              <GroupLabel>Overview</GroupLabel>
              <NavItem link={head} active={isActive(head.href)} onClose={onClose} />
            </div>
          )}
          {rest.length > 0 && (
            <div>
              <GroupLabel>Manage</GroupLabel>
              <div className="space-y-1">
                {rest.map((l) => (
                  <NavItem key={l.href} link={l} active={isActive(l.href)} onClose={onClose} />
                ))}
              </div>
            </div>
          )}
        </nav>
        <div className="p-3">
          <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface p-3">
            <Avatar name={data?.user?.name} email={data?.user?.email} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">
                {data?.user?.name || data?.user?.email}
              </p>
              <Badge variant="brand" className="mt-1 text-[10px] uppercase tracking-wider">
                {data?.user?.role}
              </Badge>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-lg p-2 text-sub transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function TopNav({ section, onMenu }: { section: string; onMenu: () => void }) {
  const pathname = usePathname();
  const { data } = useSession();
  const leaf = pathname.split("/").filter(Boolean).pop() || "";
  const crumb = leaf === section.toLowerCase() ? "Overview" : leaf.replace(/-/g, " ");
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 lg:px-8">
        <button aria-label="Open menu" onClick={onMenu} className="rounded-lg p-2 text-sub hover:bg-surface lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-sm text-sub">
          {section} <span className="mx-1.5 text-sub/40">/</span>{" "}
          <span className="font-display font-bold capitalize text-ink">{crumb}</span>
        </p>
        <div className="ml-auto flex items-center gap-2.5 lg:hidden">
          <div className="hidden text-right sm:block">
            <p className="text-[13px] font-semibold leading-tight text-ink">{data?.user?.name}</p>
            <p className="text-xs leading-tight text-sub">{data?.user?.email}</p>
          </div>
          <Avatar name={data?.user?.name} email={data?.user?.email} />
        </div>
      </div>
    </header>
  );
}
