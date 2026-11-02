# Features (implemented in V1)

Single-campus only. Everything below maps to a Server Action in `src/features/*/actions.ts` or a page under `src/app/(dashboard)/`. If it is not here, it is not shipped.

## Admin (`src/features/{users,classes,timetable,fees,overview}`)

| Feature | Backing action |
|---|---|
| Create user (ADMIN/TEACHER/STUDENT) | `createUser` |
| Activate / deactivate login | `toggleUserActive` |
| Enroll / unenroll student in class | `enrollStudent` / `unenrollStudent` |
| Create class (department + section) | `createClass` |
| Create subject (code, class link) | `createSubject` |
| Assign teacher to subject | `assignTeacher` |
| Create / delete timetable entry | `createTimetableEntry` / `deleteTimetableEntry` |
| View timetable | `getTimetable` |
| Create fee structure (auto-creates UNPAID invoices for enrolled students) | `createFeeStructure` |
| Create single invoice | `createFeeInvoice` |
| Record manual payment | `recordFeePayment` |

Pages: `/admin`, `/admin/users`, `/admin/classes`, `/admin/subjects`, `/admin/timetable`, `/admin/fees`.

## Teacher (`src/features/{classes,timetable,attendance,assignments,exams,overview}`)

| Feature | Backing action |
|---|---|
| Bulk mark attendance (one date + subject) | `bulkMarkAttendance` |
| View attendance history | `getAttendanceHistory` |
| View roster for own class | `getClassRoster` |
| Create assignment | `createAssignment` |
| Grade submission + feedback (upserts a subject grade) | `gradeSubmission` |
| Create exam (MCQ-only) | `createExam` |
| Add / update / delete question (before publish) | `addQuestion` / `updateQuestion` / `deleteQuestion` |
| Publish exam (requires marks to equal total) | `publishExam` |
| View attempts per exam | `getExamAttempts` |

Pages: `/teacher`, `/teacher/classes`, `/teacher/classes/[classId]`, `/teacher/timetable`, `/teacher/attendance`, `/teacher/attendance/mark`, `/teacher/assignments`, `/teacher/exams`.

## Student (`src/features/{attendance,assignments,timetable,fees,exams,overview}`)

| Feature | Backing action |
|---|---|
| Submit / resubmit assignment (while ungraded) | `submitAssignment` |
| Submit MCQ exam (auto-graded, single attempt, no retake) | `submitExam` |
| Record fee payment (manual) | `payFee` |
| Read own attendance / grades / timetable / fees / assignments / published exams | scoped reads |

Pages: `/student`, `/student/attendance`, `/student/assignments`, `/student/exams`, `/student/exams/[id]`, `/student/grades`, `/student/timetable`, `/student/fees`. Exams is in the student sidebar.

## Behavior notes

- Exams are MCQ-only (`Question.options` JSON + `correctOption` index). Answers are submitted as a map of question id to option index.
- Publishing requires at least one question and question marks that add up exactly to `totalMarks`.
- Question edits are blocked after publishing.
- Fees have no online gateway; `method` is `CASH`, `UPI`, `CARD`, or `NETBANKING`.
- Statuses: attendance `PRESENT / ABSENT / LATE`; invoices `UNPAID / PARTIAL / PAID`; payments `COMPLETED`.
- Assignment grades are visible immediately; there is no draft/publish step for grades.
- Demo accounts and the demo password are defined in `prisma/seed.js`.

## Planned (not shipped)

- Online payment gateway integration
- Hostel / transport / library modules
- Real-time chat and notices
- CSV bulk import
- Subjective exams with manual grading
- Multi-campus support
