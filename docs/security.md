# Security Model

CampusConnect V1 is a single-campus app with three roles. Security is enforced in the Server Actions, not only in the UI or middleware.

---

## Authentication

- next-auth Credentials provider, JWT session strategy.
- `authorize()` loads the user by email, rejects missing or `isActive: false` accounts, and compares the bcrypt hash.
- `requireUser()` re-checks `isActive` and the current database role on every action, so deactivation and role changes take effect without waiting for the JWT to expire.
- Session carries `user.id` and `user.role`; `src/types/next-auth.d.ts` types both.
- Passwords are hashed with bcrypt (cost 10). Seed demo accounts are defined in `prisma/seed.js`; change the demo password before sharing an environment.

## Route protection

`src/middleware.ts` uses `withAuth` on `/admin/:path*`, `/teacher/:path*`, `/student/:path*`, and `/login`.

- Anonymous dashboard request -> `/login`.
- Wrong role -> `403`.
- Logged-in `/login` -> role dashboard.
- Middleware is a coarse prefix check. Every action still calls `requireUser()` with its required roles.

## Authorization primitives

`src/lib/auth.ts`:

```ts
requireUser(allowed?: Role[]): Promise<{ id: string; role: string }>
scopedUserId(me, requestedId?: string): string
```

`scopedUserId` returns the requested id for admins; for teachers and students it only allows their own id and throws `Forbidden` otherwise. Read actions that accept a user id use it.

Mutation ownership is checked against the database:

| Mutation | Check |
|---|---|
| `bulkMarkAttendance` | Teacher owns the subject; every student is enrolled in the class; marker is the session user |
| `createAssignment` | Teacher owns the subject; owner id is forced to the session user |
| `gradeSubmission` | Teacher owns the assignment; grader id is forced to the session user |
| `submitAssignment` | Student is enrolled in the assignment's class; own submission only |
| `createExam` | Teacher owns the subject; creator id is forced to the session user |
| `add/update/deleteQuestion`, `publishExam` | Exam creator (or admin); blocked after publishing |
| `submitExam` | Student is enrolled; one attempt only; answers scored server-side |
| `payFee`, `recordFeePayment` | Invoice owner (or admin); no overpayment; no payment on a PAID invoice |
| `getClassRoster` | Teacher has at least one subject in the class (admins bypass) |
| Timetable writes | Subject belongs to the class and is taught by the chosen teacher; no class/teacher overlap |

## Input validation

Each feature has a Zod schema in `src/features/*/schemas.ts`; actions parse input at the boundary. Validation covers ids, trimmed strings, email shape, password length, enum values, dates, positive amounts, payment methods, MCQ options, and exam answers.

Client-side validation is only a convenience. Never rely on it for authorization or integrity.

## Exam integrity

- Exams are MCQ-only. `options` is a JSON array string; `correctOption` is an index.
- Students never receive `correctOption` from the exam page.
- Answers are sent as `Record<questionId, optionIndex>`, so question ordering cannot change scoring.
- Every question must be answered with a valid option.
- Score is capped at `totalMarks`.
- Publishing requires at least one question and question marks that sum exactly to `totalMarks`.
- Question edits are rejected after publishing.
- A database unique constraint on `[examId, studentId]` plus `create`/`P2002` handling prevents duplicate attempts, including races.
- `duration` is stored but not enforced with a countdown; a determined student can submit after the nominal time.

## Fee integrity

- Invoice status: `UNPAID`, `PARTIAL`, `PAID`.
- Payments are manual; methods: `CASH`, `UPI`, `CARD`, `NETBANKING`.
- `[studentId, feeStructureId]` is unique in the database, so duplicate invoices cannot be created by concurrent requests. The action also pre-checks for a readable error.
- Payment writes use Serializable transactions: load invoice + payments, reject overpayment or payment on a PAID invoice, insert payment, set status.
- Pending totals include `UNPAID` and `PARTIAL` invoices minus recorded payments. `getFeeOverview`, `getAdminStats`, and `getStudentDashboard` use the same calculation.
- Amounts are `Float` in V1. Do not treat them as currency-safe for multi-currency or high-precision accounting.

## Date handling

`src/lib/date.ts` normalizes calendar dates to UTC midnight:

- `dateOnly(string | Date)` validates real `YYYY-MM-DD` dates and returns UTC midnight.
- `endOfDate(date)` returns 23:59:59.999 UTC.
- `todayStart()` returns the current UTC midnight.
- `normalizeTime("H:MM" | "HH:MM")` validates and zero-pads timetable times.

Attendance stores UTC midnight so the unique `[studentId, subjectId, date]` key is stable. Old rows written before this change may have local-midnight timestamps; migrate them if they must align exactly.

## Known limits

- Middleware checks path prefixes only; action-level checks are the real boundary.
- The student exam page and teacher mark page query Prisma directly in server components, gated by `requireUser()`. New code should prefer feature actions.
- `getExamAttempts` allows an admin to pass any teacher id; non-admin ids are scoped.
- There is no audit log. Attendance and grades are mutable by design.
- No CSP header. `next.config.mjs` sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- No rate limiting on login or actions. Add it at the edge before exposing the app publicly at scale.

## Deployment checklist

1. Set a fresh `NEXTAUTH_SECRET`.
2. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the https origin.
3. Apply migrations, including the FeeInvoice unique index.
4. Change or remove demo accounts.
5. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run boundaries`, and `npm run build`.
