# Architecture

Next.js 14.2.7 App Router + next-auth 4.24.7 (Credentials, JWT) + Prisma 5.19.1 + SQLite. Server Actions are the only data layer.

---

## Runtime diagram

```
Browser
  |
  v
Next.js App Router (SSR pages under /admin /teacher /student, /login)
  |
  +-- src/middleware.ts (withAuth; /login role redirect; 403 on wrong role)
  |
  +-- Server Actions: src/lib/actions/{admin,teacher,student}.ts ("use server")
  |     |
  |     v
  |   Prisma Client --> SQLite (prisma/dev.db)
  |
  +-- Single API route: src/app/api/auth/[...nextauth]/route.ts
```

No other `/api/*` routes exist. No gateway, CDN, mail, payment, realtime, or container layer.

---

## Request flow

1. `middleware.ts` (`withAuth`, `authorized: () => true`) runs on `/admin/:path*`, `/teacher/:path*`, `/student/:path*`, `/login`.
2. On `/login`: logged-in users redirect by role (ADMIN -> `/admin`, TEACHER -> `/teacher`, STUDENT -> `/student`). Anonymous users pass through.
3. On dashboard paths: anonymous -> `/login`; wrong role -> `403 Forbidden`.
4. Pages call Server Actions directly with the session user id from `getServerSession(authOptions)`. Actions query Prisma and call `revalidatePath` on the affected dashboard paths.

## Auth

next-auth Credentials provider (`src/lib/auth-options.ts`): Prisma + bcrypt `authorize`, JWT strategy, `role` added to token and session (`src/types/next-auth.d.ts`). Password hashing helper in `src/lib/auth.ts`.

## Layout / motion

- `src/components/layouts/shell.tsx` (`Shell`): white sidebar with crest, nav links, user footer; breadcrumb topnav; `PageTransition` wraps `<main>` only.
- `src/components/motion.tsx`: `PageTransition` (`AnimatePresence mode="sync"`, 180ms fade/slide), `Reveal`.
- `src/components/providers.tsx`: `SessionProvider` + `MotionConfig reducedMotion="user"`.
- `src/app/(dashboard)/loading.tsx`: `CardsSkeleton`.
- `src/components/ui` (9 files): button, input, card, badge (+ `StatusBadge`), table, dialog, select, avatar, skeleton.

## Authorization / scoping

Role is a `String` on `User` (`ADMIN` / `TEACHER` / `STUDENT`) plus `isActive`. Scoping uses relations, not tenant columns:

- Student sees data via `Enrollment` (own `studentId` -> `classId` -> subjects, assignments, timetable, published exams).
- Teacher sees data via `Subject.teacherId` / `Timetable.teacherId` / `Assignment.teacherId` / `Exam.createdById` / `Attendance.markedById`, plus `getClassRoster(classId)` aggregates.
- Admin has no scope filter (counts + `take` caps: users 100, timetable 100, fee invoices 200, students/teachers 200 each).

Grade letters are computed in `gradeSubmission`: A>=90, B>=75, C>=60, D>=40, else F. Exam scoring is MCQ auto-score in `submitExam`. Fee status flips to PAID when payments cover the invoice, PARTIAL otherwise.

---

## Technology decisions

| Decision | Why |
|---|---|
| App Router Server Actions only | Single data layer, no REST to maintain |
| next-auth Credentials + JWT | Email/password login with role on token/session |
| Prisma + SQLite | File DB, 16 models, relation cascades in schema |
| Shell + PageTransition + skeletons | Shared dashboard chrome, 180ms transitions, loading state |
