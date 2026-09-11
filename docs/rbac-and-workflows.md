# CampusConnect — RBAC, Dashboard UX & Core Workflow Architecture

Master spec for Role-Based Access Control (RBAC), dashboards, and core workflows. Maps to the Prisma schema (SQLite) and Next.js App Router. Auth is next-auth JWT Credentials; roles are the `role` string on `User` (`ADMIN`, `TEACHER`, `STUDENT`).

Only models listed here exist in `prisma/schema.prisma`. There is no Campus, AcademicYear/Semester, Book, Hostel, BusRoute, Notice, Chat, or StudyMaterial model.

---

## 1. Role-Based Feature Matrix & CRUD Permissions

**Notation:** `C` `R` `U` `D` = full access to that operation. `—` = no access. Scoped access is annotated in the Notes column.

### 1.1 Identity & Organization

| Model | Admin | Teacher | Student | Notes / Boundary |
|---|---|---|---|---|
| `User` | `C R U D` | `R` (own profile), `R` (roster of own classes) | `R U` (own profile, limited) | Admin-only account creation via `createUser`, role changes, `toggleUserActive` soft-deactivate. |
| `Department` | `C R U D` | `R` | `R` | |
| `Class` | `C R U D` (`createClass`) | `R` (assigned only) | `R` (own class via `Enrollment`) | Teachers cannot create classes. |
| `Enrollment` | `C D` (`enrollStudent` / `unenrollStudent`) | `R` (own class rosters via `getClassRoster`) | `R` (own only) | |

### 1.2 Academics & Scheduling

| Model | Admin | Teacher | Student | Notes / Boundary |
|---|---|---|---|---|
| `Class` / `Subject` | `C R U D` (`createSubject`, `assignTeacher`) | `R` (assigned only) | `R` (own class only) | Teachers cannot create subjects or classes. |
| `Timetable` | `C R U D` (`createTimetableEntry` / `deleteTimetableEntry`) | `R` (own schedule only) | `R` (own class schedule) | Teachers do **not** get write access to `Timetable`. |

### 1.3 Tracking & Evaluation

| Model | Admin | Teacher | Student | Notes / Boundary |
|---|---|---|---|---|
| `Attendance` | `R` (all) | `C U` via `bulkMarkAttendance` (upsert, own subjects) | `R` (own record only) | **No `D` for anyone.** Unique on `[studentId, subjectId, date]`; re-marking overwrites. |
| `Assignment` | `R` (oversight) | `C R U D` (`createAssignment`, own subjects) | `R` (own class) | Admin does not create assignments. |
| `Submission` | `R` (oversight) | `R` + grade (`gradeSubmission`, own assignments) | `C U` (`submitAssignment` upsert) | Unique on `[assignmentId, studentId]`; resubmit overwrites content. No `D` for students. |
| `Exam` / `Question` | `R` | `C R U D` (`createExam`, `addQuestion`, `publishExam`, own subjects) | `R` (published only) | Teacher sees `correctOption`; students never query `Question.correctOption`. |
| `ExamSubmission` | `R` | `R` (attempts via `getExamAttempts`, own exams) | `C U` (`submitExam`, own only) | Unique on `[examId, studentId]`; re-submit re-grades. |
| `Grade` | `R` | `C U` (own subjects; written by `gradeSubmission` upsert) | `R` (own only) | Unique on `[studentId, subjectId]`. No publish gate — grading writes `Grade` directly. |

### 1.4 Financials

| Model | Admin | Teacher | Student | Notes / Boundary |
|---|---|---|---|---|
| `FeeStructure` | `C R U D` (`createFeeStructure`) | — | `R` (relevant to own class) | |
| `FeeInvoice` | `C R U D` (`createFeeInvoice`) | — | `R` (own invoices only) | **Teachers cannot view fee invoices.** Hard boundary. |
| `FeePayment` | `C` (`recordFeePayment`) `R` | — | `C` (`payFee`) `R` (history) | Manual records only — no payment gateway. Student never gets `U/D`. |

### 1.5 Facilities & Communication

Not implemented. No `Book`, `Hostel`, `BusRoute`, `Notice`, `Chat`, or `StudyMaterial` models exist, so no permissions are defined for them. Do not add dashboard or workflow specs for these until the schema gains them.

---

## 2. Dashboard UX/UI Architecture

**Aesthetic:** MIT-ADT Light — white cards on `surface #F6F5FA`, `ink #1E1B26` / `sub #655E76` text, brand purple `500 #7C3FB0` / `600 #5E2D91` / `700 #4A2373`, magenta `#C13584` for hero moments only, ember `#F26522` for CTAs sparingly. Plus Jakarta Sans display, Public Sans body, JetBrains Mono for data.

### 2.1 Admin Dashboard (`/admin`)
*   **KPIs:** Users, classes, subjects, fee collection (via `getAdminStats` / `getFeeOverview`).
*   **Sections:** Users (`/admin/users`), Classes (`/admin/classes`), Subjects (`/admin/subjects`), Timetable (`/admin/timetable`), Fees (`/admin/fees`).
*   **Quick Actions:** `Create User`, `Enroll Student`, `Create Fee Structure`, `Create Invoice`, `Record Payment`.

### 2.2 Teacher Dashboard (`/teacher`)
*   **KPIs:** Subjects, assignments, pending submissions, today's attendance (`getTeacherDashboard`).
*   **Sections:** My classes (`/teacher/classes`), Attendance (`/teacher/attendance`), Assignments (`/teacher/assignments`), Exams (`/teacher/exams`), Timetable (`/teacher/timetable`).
*   **Quick Actions:** `Mark Attendance`, `Create Assignment`, `Create Exam`, `Grade Submissions`.

### 2.3 Student Dashboard (`/student`)
*   **KPIs:** Attendance %, average %, pending fees (`getStudentDashboard`).
*   **Sections:** Attendance (`/student/attendance`), Assignments (`/student/assignments`), Grades (`/student/grades`), Timetable (`/student/timetable`), Fees (`/student/fees`). Exams live under assignments (`/student/exams` route, `submitExam`).
*   **Quick Actions:** `View Timetable`, `Submit Assignment`, `Pay Fees`.

---

## 3. Core Workflows

### 3.1 Admin: Class Setup Workflow
1. **Users:** `createUser` for teachers/students (hashed password, role string).
2. **Enroll:** `enrollStudent(studentId, classId)`; `unenrollStudent` reverses it.
3. **Subjects:** `createSubject(name, code, classId)`, then `assignTeacher(subjectId, teacherId)`.
4. **Timetable:** `createTimetableEntry` (class + subject + teacher + day/time + room string); delete with `deleteTimetableEntry`.
5. **Fees:** `createFeeStructure` per class, `createFeeInvoice` per student, `recordFeePayment` for offline reconciliation.

### 3.2 Teacher: Mark Attendance Workflow
1. **Login:** Redirects to `/teacher`.
2. **Page:** `/teacher/attendance` (history) → mark form (`/teacher/attendance/mark`).
3. **UI:** Roster defaults to Present; toggle exceptions.
4. **Submit:** `bulkMarkAttendance({ classId, subjectId, date, markedById, rows })` — one `attendance.upsert` per row on `[studentId, subjectId, date]`, day normalized to midnight. Re-marking the same day overwrites.

### 3.3 Teacher: Grade Submission Workflow
1. **Queue:** `getPendingSubmissions` (submissions with `marksObtained: null`).
2. **Grade:** `gradeSubmission(id, marks, feedback, graderId)` — clamps marks to `[0, maxMarks]`, updates `Submission`, then upserts `Grade` on `[studentId, subjectId]` with letter from percentage.
3. **Result:** Visible at `/student/grades` immediately. No draft/publish step.

### 3.4 Student: Assignment + Exam Workflow
1. **Assignments:** `/student/assignments` lists class assignments with submission state.
2. **Submit:** `submitAssignment(assignmentId, studentId, content)` — upsert on `[assignmentId, studentId]`.
3. **Exams:** Published exams only (`isPublished`, `getStudentExams`). `submitExam(examId, studentId, answers)` auto-grades against `Question.correctOption`, sums `marks`, upserts `ExamSubmission` with `score`. Returns the score.

### 3.5 Student: Pay Fee Workflow (manual)
1. **Invoices:** `/student/fees` via `getStudentFees` (invoice + structure + payments).
2. **Pay:** `payFee(invoiceId, amount, method)` — validates amount, rejects overpayment and already-`PAID` invoices, creates `FeePayment`, flips invoice to `PARTIAL` or `PAID`. No gateway; `method` defaults to `CASH`.

---

## 4. Edge Cases & Anti-Patterns to Avoid

1.  **Cross-class data leakage:** Scope queries by `classId`/`subjectId`/`studentId` from the session, not client input.
2.  **Hard deletes on User:** Use `toggleUserActive` (`isActive`) to preserve historical grades/attendance.
3.  **Silent Attendance edits:** Re-marking overwrites via upsert — no audit log exists, so treat marks as mutable.
4.  **Grades with no publish gate:** `gradeSubmission` writes `Grade` immediately; students see it at once.
5.  **Client-only validation:** Enforce mark clamping, overpayment rejection, and answer scoring on the server (already in actions).
6.  **Stale session claims:** Re-verify fresh DB state before high-stakes writes (grading, fee payment).
7.  **Ambiguous "current" scope:** There is no semester model — scope by enrollment and `isPublished` flags instead of dates.
8.  **Rewriting history on transfer:** Model transfers as new `Enrollment` rows, not overwrites.
9.  **N+1 queries:** Precompute aggregates; use `include`/`select` efficiently in Prisma.
10. **Exam answer leakage:** Never send `Question.correctOption` to students; `submitExam` scores server-side.
