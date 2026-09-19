"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/shared/ui/avatar";
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
          "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 -translate-x-full flex-col border-r border-border/70 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
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
              className="h-10 w-10 rounded-full"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sub">
                MIT-ADT University
              </p>
              <p className="font-display text-lg font-extrabold leading-none text-ink">
                CampusConnect
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-sub hover:bg-surface lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-sub hover:bg-surface hover:text-ink"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px]",
                    active ? "text-brand-600" : "text-sub/70 group-hover:text-ink"
                  )}
                />
                {l.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-600" />}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 border-t border-border/70 p-4">
          <Avatar name={data?.user?.name} email={data?.user?.email} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">
              {data?.user?.name || data?.user?.email}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-sub">
              {data?.user?.role}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="rounded-lg p-2 text-sub transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
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
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3.5 lg:px-8">
        <button onClick={onMenu} className="rounded-lg p-2 text-sub hover:bg-surface lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-sm text-sub">
          {section} <span className="mx-1.5 text-border">/</span>{" "}
          <span className="font-semibold capitalize text-ink">{crumb}</span>
        </p>
        <div className="ml-auto flex items-center gap-2.5">
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
