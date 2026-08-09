# CampusConnect — RBAC, Dashboard UX & Core Workflow Architecture

This document serves as the master specification for Role-Based Access Control (RBAC), UI/UX Dashboards, and Core Workflows in the CampusConnect platform. It maps directly to the Prisma schema and Next.js 14.2 App Router architecture.

---

## 1. Role-Based Feature Matrix & CRUD Permissions

**Notation:** `C` `R` `U` `D` = full access to that operation. `—` = no access. Scoped access is annotated in the Notes column.

### 1.1 Identity & Infrastructure

| Model | Admin | Teacher | Student | Notes / Boundary |
|---|---|---|---|---|
| `User` | `C R U D` | `R` (own profile), `R` (roster of own classes) | `R U` (own profile, limited) | Admin is the only role that can create accounts, change roles, deactivate users. Teachers see student *names/contact* for their own classes only. |
| `Campus` | `C R U D` | `R` (own campus) | `R` (own campus) | |
| `Department` | `C R U D` | `R` (own dept) | `R` (own dept) | |
| `Classroom` | `C R U D` | `R` | `R` (via Timetable) | |

### 1.2 Academics & Scheduling

| Model | Admin | Teacher | Student | Notes / Boundary |
|---|---|---|---|---|
| `AcademicYear` / `Semester` | `C R U D` | `R` | `R` | Only Admin opens/closes a semester. Teachers/Students only ever see the currently `ACTIVE` one plus historical. |
| `Class` / `Subject` | `C R U D` | `R` (assigned only) | `R` (own class only) | Teachers cannot create subjects or classes. |
| `Timetable` | `C R U D` | `R` (own schedule only) | `R` (own class schedule) | Teachers do **not** get direct write access to `Timetable` to prevent double-bookings. |

### 1.3 Tracking & Evaluation

| Model | Admin | Teacher | Student | Notes / Boundary |
|---|---|---|---|---|
| `Attendance` | `R` (all) + `U` (audited) | `C` (own class) `U` (same-day) | `R` (own record only) | **No hard `D` for anyone.** Attendance is an audit trail. |
| `Assignment` | `R` (oversight) | `C R U D` (own subject) | `R` (own class) | Admin does not create assignments. |
| `Submission` | `R` (oversight) | `R` (own assignments) + grade | `C` (upload) `U` (resubmit) | Students should **not** get `D` on a submitted file. |
| `Exam` / `ExamQuestion` | `C R` | `C R U D` (own subject) | `R` (schedule only) | Separate query layer: teacher sees answers, student does not. |
| `ExamSubmission` | `R` | `C R U` (grade, own subject) | `C R` (own only) | |
| `Grade` | `R` + `U` (override, audited)| `C U` (own subject only) | `R` (published only) | Grading is a Teacher responsibility; Admin write access exists only as an audited override. |

### 1.4 Financials

| Model | Admin | Teacher | Student | Notes / Boundary |
|---|---|---|---|---|
| `FeeStructure` | `C R U D` | — | `R` (relevant to own class) | |
| `FeeInvoice` | `C R U D` | — | `R` (own invoices only) | **Teachers cannot view fee invoices.** Hard boundary. |
| `FeePayment` | `R` `U` (reconcile) | — | `C` (initiate) `R` (history)| Student never gets `U/D` on a payment record. |

### 1.5 Facilities & Communication

| Model | Admin | Teacher | Student | Notes / Boundary |
|---|---|---|---|---|
| `Book` / `BookIssue` | `C R U D` | `R` + `C` (self-issue) | `R` + `C` (hold/request) | |
| `Hostel` / `Room` | `C R U D` | — | `R` (own allocation) | |
| `BusRoute` / `Stop` | `C R U D` | `R` | `R` (own route) | |
| `Notice` | `C R U D` (any scope) | `C` (own-class scope) `R` | `R` only | Explicit scoping required (`CAMPUS`, `DEPARTMENT`, `CLASS`). |
| `Chat` / `Message` | `C R` (moderation) | `C R` (own conversations) | `C R` (own conversations)| Restrict Student↔Teacher chat creation to an existing enrollment relationship. |

---

## 2. Dashboard UX/UI Architecture

**Aesthetic:** Glassmorphism stat cards on a white canvas, slate-800/600 typography hierarchy, generous whitespace, one accent color per role (indigo for Admin, teal for Teacher, amber for Student).

### 2.1 Admin Dashboard (`/admin/dashboard`)
*   **KPIs:** Active Students/Faculty, Today's Attendance %, Fee Collection, At-Risk Students, Timetable Conflicts, Hostel Occupancy %.
*   **Quick Actions:** `+ New Notice`, `+ Enroll Student`, `Generate Invoices (bulk)`.
*   **Primary Tables:** At-Risk Students table (high priority), Pending/Overdue Fee Payments, Recent Activity / Audit Log.

### 2.2 Teacher Dashboard (`/teacher/dashboard`)
*   **KPIs:** Today's Classes, Pending Grading, This Week's Avg. Attendance (own classes), Next Exam.
*   **Quick Actions:** Context-aware primary CTA (`Mark Attendance: CS301 (10:00 AM)`), `Create Assignment`, `Enter Grades`.
*   **Primary Tables:** Today's Timetable (chronological with inline status), Pending Submissions to Grade, My Classes overview.

### 2.3 Student Dashboard (`/student/dashboard`)
*   **KPIs:** Attendance %, Pending Assignments, Upcoming Exams, Fee Due (prominent red banner), Current CGPA.
*   **Quick Actions:** `View Timetable`, `Submit Assignment`, `Pay Fees`.
*   **Primary Tables:** Today's Timetable, Pending Assignments (sorted by urgency), Recently Published Grades, Notice Feed.

---

## 3. Core Workflows

### 3.1 Admin: Semester Setup Workflow
1. **Academic Year & Semester:** Select existing or create new (status: `DRAFT`).
2. **Class Creation:** Bulk or inline editor. Ties to Department + Semester.
3. **Subject Mapping:** Attach Subjects to each Class.
4. **Teacher Allocation:** Assign teachers with workload visibility.
5. **Timetable Build:** Drag-and-drop grid with server-side clash detection (Teacher, Classroom, Class).
6. **Publish:** Flips status to `ACTIVE`. Triggers global notice.

### 3.2 Teacher: Mark Attendance Workflow
1. **Login:** Redirects to `/teacher/dashboard`.
2. **Dashboard Query:** Fetches today's `Timetable` slots with single query.
3. **Action:** Click "Mark Attendance" on current class.
4. **UI:** Defaults all to **Present**. Toggle exceptions. Bulk "Mark all present" button.
5. **Submit:** Upserts `Attendance` records via Server Action with unique constraints within a same-day edit window.

### 3.3 Student: Assignment Submission Workflow
1. **Login:** Dashboard shows "Pending Assignments".
2. **Detail Page:** Description, countdown, drag-and-drop upload zone.
3. **Upload:** Client-side validation → File storage → Server Action creates `Submission` (`status: SUBMITTED`).
4. **Grading:** Teacher grades → `Grade` created (`status: DRAFT`).
5. **Publish:** Teacher publishes grades (batch action) → Student sees in "Recent Grades".

---

## 4. Edge Cases & Anti-Patterns to Avoid

1.  **Multi-tenant data leakage:** Inject tenant scoping (e.g., `campusId`) into Prisma queries.
2.  **Hard deletes on User:** Use `isActive` / `deletedAt` for soft-deletes to preserve historical grades/attendance.
3.  **Silent Attendance edits:** Corrections must be audited.
4.  **Grades visible pre-publish:** Use explicit `status: DRAFT/PUBLISHED` gates on Grades.
5.  **Client-only clash detection:** Enforce overlap checks on the server via transactions.
6.  **Stale session claims:** Re-verify fresh DB state before high-stakes writes (grade publish, fee payment).
7.  **Ambiguous "current semester":** Use explicit `status: ACTIVE` flag instead of relying solely on dates.
8.  **Rewriting history on transfer:** Model student/teacher transfers as new assignments, not overwrites of historical records.
9.  **N+1 queries:** Precompute heavy aggregates; use `include`/`select` efficiently in Prisma.
10. **Exam answer leakage:** Use separate query projections for Teachers (with answers) and Students (redacted answers).
11. **Flat, unscoped Notices:** Explicitly scope notices by `CAMPUS`, `DEPARTMENT`, `CLASS`, or `ROLE`.
