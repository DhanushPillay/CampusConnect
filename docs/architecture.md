# Architecture

Next.js 14.2.7 App Router + next-auth 4.24.7 (Credentials, JWT) + Prisma 5.19.1 + PostgreSQL (Neon). Server Actions are the only data layer.

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
  +-- Server Actions: src/features/*/actions.ts ("use server")
  |     |
  |     v
  |   Prisma Client --> PostgreSQL (Neon; pooled DATABASE_URL)
  |
  +-- Single API route: src/app/api/auth/[...nextauth]/route.ts
```

No other `/api/*` routes exist. No gateway, CDN, mail, payment, realtime, or container layer.

---

## Modules

| Path | Responsibility |
|---|---|
| `src/app` | Routes, layouts, page-level composition |
| `src/features` | Domain actions and Zod schemas: users, classes, timetable, attendance, assignments, exams, fees, overview |
| `src/lib` | Auth, Prisma singleton, date/fee helpers, formatting |
| `src/shared` | UI primitives, dashboard shell, motion, providers |
| `prisma` | Schema, migrations, seed |
| `scripts` | Import-boundary check |

Boundaries (`scripts/check-boundaries.mjs`):

- `src/app` may not import the legacy `@/lib/actions` shims.
- `src/shared` may not import `@/features`, `@/app`, or `@/lib/actions`.
- `src/features` may not import `@/app`.

`src/lib/actions/{admin,teacher,student}.ts` are `"use server"` re-export shims kept for compatibility. New code imports `@/features/*/actions`.

---

## Request flow

1. `middleware.ts` (`withAuth`, `authorized: () => true`) runs on `/admin/:path*`, `/teacher/:path*`, `/student/:path*`, `/login`.
2. On `/login`: logged-in users redirect by role (ADMIN -> `/admin`, TEACHER -> `/teacher`, STUDENT -> `/student`). Anonymous users pass through.
3. On dashboard paths: anonymous -> `/login`; wrong role -> `403 Forbidden`.
4. Pages call Server Actions with the session user id. Actions re-check the role with `requireUser()`; the middleware is only a route-prefix gate.
5. Actions validate input with Zod, query Prisma, and call `revalidatePath` on affected paths.

## Auth

next-auth Credentials provider (`src/lib/auth-options.ts`): Prisma + bcrypt `authorize`, JWT strategy, `role` added to token and session (`src/types/next-auth.d.ts`). Password hashing helper in `src/lib/auth.ts`.

`src/lib/auth.ts` also provides:

- `requireUser(allowed?)` - validates the session, re-checks the user is active and the current role in the database, and throws `Unauthorized`/`Forbidden`.
- `scopedUserId(me, requestedId?)` - admins may read any id; everyone else only their own.

## Layout / motion

- `src/shared/layouts/shell.tsx` (`Shell`): white sidebar with crest, nav links, user footer; breadcrumb topnav; `PageTransition` wraps `<main>` only.
- `src/shared/motion.tsx`: `PageTransition` (`AnimatePresence mode="wait"`, 240ms enter / 100ms exit), `Reveal`.
- `src/shared/providers.tsx`: `SessionProvider` + `MotionConfig reducedMotion="user"`.
- `src/app/(dashboard)/loading.tsx`: title lines + `CardsSkeleton` + table skeleton.
- `src/shared/ui` (9 primitives): button, input, card, badge (+ `StatusBadge`), table, dialog, select, avatar, skeleton.

## Authorization / scoping

Role is a `String` on `User` (`ADMIN` / `TEACHER` / `STUDENT`) plus `isActive`. Scoping uses relations, not tenant columns:

- Student sees data via `Enrollment` (own `studentId` -> `classId` -> subjects, assignments, timetable, published exams).
- Teacher sees data via `Subject.teacherId` / `Timetable.teacherId` / `Assignment.teacherId` / `Exam.createdById` / `Attendance.markedById`, plus `getClassRoster(classId)` for classes where they teach at least one subject.
- Admin has no scope filter (counts + `take` caps: users 500, timetable 200, fee invoices 500, students/teachers 500 each).

Grade letters are computed in `gradeSubmission`: A>=90, B>=75, C>=60, D>=40, else F. Exam scoring is MCQ auto-score in `submitExam`, keyed by question id. Fee status flips to PAID when payments cover the invoice, PARTIAL when underpaid.

---

## Technology decisions

| Decision | Why |
|---|---|
| App Router Server Actions only | Single data layer, no REST to maintain |
| next-auth Credentials + JWT | Email/password login with role on token/session |
| Prisma + PostgreSQL | Relational integrity, migrations, Neon hosting |
| Feature-sliced actions | One domain per folder, schemas next to actions |
| Shell + PageTransition + skeletons | Shared dashboard chrome, reduced-motion aware |
