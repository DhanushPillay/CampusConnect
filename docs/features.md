# Features (implemented in V1)

Single-campus only. Everything below maps to a Server Action in `src/lib/actions/` or a page under `src/app/(dashboard)/`. If it is not here, it is not shipped.

## Admin (`admin.ts`)

| Feature | Backing action |
|---|---|
| Create user (ADMIN/TEACHER/STUDENT) | `createUser` |
| Activate / deactivate login | `toggleUserActive` |
| Enroll / unenroll student in class | `enrollStudent` / `unenrollStudent` |
| Create class (dept + section) | `createClass` |
| Create subject (code, class link) | `createSubject` |
| Assign teacher to subject | `assignTeacher` |
| Create / delete timetable entry | `createTimetableEntry` / `deleteTimetableEntry` |
| View timetable | `getTimetable` |
| Create fee structure (auto-creates UNPAID invoices for enrolled students) | `createFeeStructure` |
| Create single invoice | `createFeeInvoice` |
| Record manual payment (CASH / COMPLETED) | `recordFeePayment` |

Pages: `/admin`, `/admin/users`, `/admin/classes`, `/admin/subjects`, `/admin/timetable`, `/admin/fees`.

## Teacher (`teacher.ts`)

| Feature | Backing action |
|---|---|
| Bulk mark attendance (one date + class) | `bulkMarkAttendance` |
| View attendance history | `getAttendanceHistory` |
| View class roster | `getClassRoster` |
| Create assignment | `createAssignment` |
| Grade submission + feedback (upserts Grade with letter) | `gradeSubmission` |
| Create exam (MCQ-only) | `createExam` |
| Add / update / delete question | `addQuestion` / `updateQuestion` / `deleteQuestion` |
| Publish exam | `publishExam` |
| View attempts per exam | `getExamAttempts` |

Pages: `/teacher`, `/teacher/classes`, `/teacher/classes/[classId]`, `/teacher/timetable`, `/teacher/attendance`, `/teacher/attendance/mark`, `/teacher/assignments`, `/teacher/exams`.

## Student (`student.ts`)

| Feature | Backing action |
|---|---|
| Submit / resubmit assignment (while ungraded) | `submitAssignment` |
| Submit MCQ exam (auto-graded, single attempt, no retake) | `submitExam` |
| Record fee payment (manual, CASH / COMPLETED) | `payFee` |
| Read own attendance / grades / timetable / fees / assignments / published exams | reads in `student.ts` |

Pages: `/student`, `/student/attendance`, `/student/assignments`, `/student/exams`, `/student/exams/[id]`, `/student/grades`, `/student/timetable`, `/student/fees`.

Notes: exams are MCQ-only (`Question.options` JSON + `correctOption` index). Fees have no online gateway. Statuses present in code: `PRESENT / ABSENT / LATE`, `UNPAID`, `CASH`, `COMPLETED`.

## Planned (not shipped)

- Online payment gateway integration
- Hostel / transport / library modules
- Real-time chat and notices
- CSV bulk import
- Subjective exams with manual grading
- Multi-campus support
