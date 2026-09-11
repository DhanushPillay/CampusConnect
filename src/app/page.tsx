import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Wallet,
} from "lucide-react";
import { Reveal } from "@/components/motion";

const modules = [
  { k: "Attendance", v: "Your presence, counted every day.", icon: ClipboardCheck },
  { k: "Grades", v: "Marks out? You'll know first.", icon: Award },
  { k: "Timetable", v: "Your week, mapped at a glance.", icon: CalendarDays },
  { k: "Assignments", v: "Deadlines you'll never miss.", icon: FileText },
  { k: "Exams", v: "Practice, perform, see your score.", icon: GraduationCap },
  { k: "Fees", v: "Dues clear before they worry you.", icon: Wallet },
];

const stats = [
  { v: "95+", l: "Startups incubated" },
  { v: "61+ LPA", l: "Highest package" },
  { v: "1200+", l: "Job offers" },
  { v: "500+", l: "Major recruiters" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <header className="flex items-center justify-between border-b border-border/70 px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <Image
            src="/mit-adt-crest.png"
            alt="MIT-ADT University crest"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full"
          />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-sub">
              MIT-ADT University · Pune
            </p>
            <p className="font-display text-xl font-extrabold leading-none">CampusConnect</p>
          </div>
        </div>
        <Link
          href="/login"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:bg-brand-700 active:scale-[0.98]"
        >
          Login
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 lg:px-12">
        <Reveal>
          <section className="hero-gradient hero-grid relative mt-8 overflow-hidden rounded-2xl px-7 py-14 lg:px-14 lg:py-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              Rajbaug, Pune · Academic Year 2025–26
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white lg:text-6xl">
              Your campus, connected.
            </h1>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/80">
              Attendance as it happens. Marks the moment they&apos;re out. Deadlines and
              dues before they sneak up on you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 shadow-pop transition-all hover:bg-brand-50 active:scale-[0.98]"
              >
                Sign in <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="inline-flex items-center rounded-lg border border-white/25 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/85">
                Attendance · Grades · Fees
              </span>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.l}
                className="rounded-xl border border-border/70 bg-surface px-5 py-4"
              >
                <p className="font-display text-2xl font-extrabold text-brand-600 lg:text-3xl">
                  {s.v}
                </p>
                <p className="mt-0.5 text-[13px] text-sub">{s.l}</p>
              </div>
            ))}
          </section>
        </Reveal>

        <section className="mt-10 grid grid-cols-1 gap-4 pb-16 md:grid-cols-3">
          {modules.map((m, i) => (
            <Reveal key={m.k} delay={0.05 * i}>
              <div className="group rounded-xl border border-border/70 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-pop">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <m.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 font-display text-[16px] font-bold">{m.k}</p>
                <p className="mt-1 text-sm text-sub">{m.v}</p>
              </div>
            </Reveal>
          ))}
        </section>
      </main>

      <footer className="flex items-center justify-between border-t border-border/70 px-6 py-5 text-xs font-medium text-sub lg:px-12">
        <span>MIT-ADT CampusConnect</span>
        <span>NAAC &apos;A&apos; · Single campus · V1</span>
      </footer>
    </div>
  );
}
