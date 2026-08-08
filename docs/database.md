# Database

Complete database schema, relationships, and queries.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CAMPUSCONNECT SCHEMA                                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
│ campuses │──────▶│ users    │──────▶│departmnts│──────▶│ classes  │
│          │       │          │       │          │       │          │
│ id       │       │ id       │       │ id       │       │ id       │
│ name     │       │ email    │       │ name     │       │ name     │
│ address  │       │ password │       │ campusId │       │ section  │
│ phone    │       │ name     │       └──────────┘       │ departId │
│ email    │       │ role     │                          │ campusId │
└──────────┘       │ campusId │                          └────┬─────┘
                   │ isActive │                               │
                   └──────────┘                               │
                                                              │
┌──────────┐       ┌──────────┐       ┌──────────┐           │
│ subjects │◀──────│teachers  │       │timetable │◀──────────┘
│          │       │(users)   │       │          │
│ id       │       └──────────┘       │ id       │
│ name     │                          │ classId  │
│ code     │       ┌──────────┐       │ subjectId│
│ classId  │◀──────│students  │       │ teacherId│
│ teacherId│       │(users)   │       │ dayOfWeek│
└────┬─────┘       └────┬─────┘       │ startTime│
     │                  │             │ endTime  │
     │                  │             │ roomId   │
     │                  │             └──────────┘
     │                  │
     │    ┌─────────────┼─────────────┐
     │    │             │             │
┌────▼────▼──┐   ┌──────▼──────┐  ┌──▼──────────┐
│ attendance │   │  assignments│  │    exams     │
│            │   │             │  │              │
│ id         │   │ id          │  │ id           │
│ studentId  │   │ title       │  │ name         │
│ classId    │   │ description │  │ type         │
│ subjectId  │   │ deadline    │  │ subjectId    │
│ date       │   │ subjectId   │  │ totalMarks   │
│ status     │   │ teacherId   │  │ duration     │
└────────────┘   │ maxMarks    │  │ startTime    │
                 └──────┬──────┘  └──────┬───────┘
                        │                │
                 ┌──────▼──────┐   ┌─────▼────────┐
                 │ submissions │   │exam_questions │
                 │             │   │               │
                 │ id          │   │ id            │
                 │ assignmentId│   │ examId        │
                 │ studentId   │   │ questionText  │
                 │ fileUrl     │   │ options (JSON)│
                 │ submittedAt │   │ correctOption │
                 │ grade       │   │ marks         │
                 │ feedback    │   └───────────────┘
                 └─────────────┘
                                   ┌──────────────┐
┌──────────┐                       │exam_submissns│
│   fees   │                       │              │
│          │                       │ id           │
│ id       │       ┌──────────┐    │ examId       │
│ name     │◀──────│fee_invcs │    │ studentId    │
│ amount   │       │          │    │ answers(JSON)│
│ campusId │       │ id       │    │ score        │
│ classId  │       │ studentId│    └──────────────┘
│ semestrId│       │ feeStrId │
└──────────┘       │ amount   │
                   │ dueDate  │    ┌──────────┐
                   │ status   │    │  grades  │
                   └────┬─────┘    │          │
                        │          │ id       │
                   ┌────▼─────┐    │ studentId│
                   │fee_paymnts│   │ subjectId│
                   │          │    │ semesterId│
                   │ id       │    │ marks    │
                   │ invoiceId│    │ total    │
                   │ amount   │    │ grade    │
                   │ method   │    │ cgpa     │
                   │ razorpayId│   └──────────┘
                   │ paidAt   │
                   └──────────┘

┌──────────┐       ┌──────────┐       ┌──────────┐
│  books   │       │  hostels │       │bus_routes│
│          │       │          │       │          │
│ id       │       │ id       │       │ id       │
│ title    │       │ name     │       │ name     │
│ author   │       │ campusId │       │ campusId │
│ isbn     │       │ wardenId │       │ busNumber│
│ campusId │       └────┬─────┘       │ driver   │
│ copies   │            │             └────┬─────┘
└────┬─────┘       ┌────▼─────┐       ┌────▼──────┐
     │             │  rooms   │       │ bus_stops │
┌────▼─────┐       │          │       │           │
│book_issues│      │ id       │       │ id        │
│          │       │ hostelId │       │ routeId   │
│ id       │       │ number   │       │ name      │
│ bookId   │       │ capacity │       │ time      │
│ studentId│       │ occupied │       └───────────┘
│ issueDate│       └──────────┘
│ dueDate  │
│ returnDate│      ┌──────────┐       ┌──────────┐
│ fine     │       │  chats   │       │ notices  │
└──────────┘       │          │       │          │
                   │ id       │       │ id       │
┌──────────┐       │ studentId│       │ title    │
│  certifct│       │ teacherId│       │ content  │
│          │       └────┬─────┘       │ campusId │
│ id       │       ┌────▼─────┐       │ targetCls│
│ studentId│       │ messages │       │ postedBy │
│ type     │       │          │       │ postedAt │
│ issuedDt │       │ id       │       └──────────┘
│ certNum  │       │ chatId   │
│ fileUrl  │       │ senderId │
└──────────┘       │ content  │
                   │ sentAt   │
                   │ readAt   │
                   └──────────┘
```

---

## Table Definitions

### campuses
Institutional locations.

```sql
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### users
All users: admins, teachers, students.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- hashed by Supabase Auth
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT')),
  campus_id UUID REFERENCES campuses(id),
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_campus ON users(campus_id);
CREATE INDEX idx_users_email ON users(email);
```

### departments
Academic departments.

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  campus_id UUID REFERENCES campuses(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_departments_campus ON departments(campus_id);
```

### classes
Classes within departments (e.g., "Class 10-A").

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  section VARCHAR(10),
  department_id UUID REFERENCES departments(id),
  campus_id UUID REFERENCES campuses(id),
  academic_year_id UUID REFERENCES academic_years(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_classes_department ON classes(department_id);
CREATE INDEX idx_classes_campus ON classes(campus_id);
```

### academic_years
Academic year and semester definitions.

```sql
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,  -- e.g., "2024-2025"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  campus_id UUID REFERENCES campuses(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,  -- e.g., "Semester 1"
  academic_year_id UUID REFERENCES academic_years(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### subjects
Subjects linked to classes and teachers.

```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  class_id UUID REFERENCES classes(id),
  teacher_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subjects_class ON subjects(class_id);
CREATE INDEX idx_subjects_teacher ON subjects(teacher_id);
```

### timetables
Weekly class schedule.

```sql
CREATE TABLE timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id),
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES users(id),
  day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN (
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'
  )),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_id UUID,
  campus_id UUID REFERENCES campuses(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timetables_class ON timetables(class_id);
CREATE INDEX idx_timetables_teacher ON timetables(teacher_id);
CREATE INDEX idx_timetables_day ON timetables(day_of_week);
```

### attendance
Daily attendance records.

```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  class_id UUID REFERENCES classes(id),
  subject_id UUID REFERENCES subjects(id),
  date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
  marked_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX idx_attendance_subject ON attendance(subject_id);

-- Unique constraint: one attendance per student per subject per day
CREATE UNIQUE INDEX idx_attendance_unique ON attendance(student_id, subject_id, date);
```

### assignments
Teacher-created assignments.

```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES users(id),
  deadline TIMESTAMP NOT NULL,
  max_marks INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assignments_subject ON assignments(subject_id);
CREATE INDEX idx_assignments_teacher ON assignments(teacher_id);
```

### submissions
Student assignment submissions.

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id),
  student_id UUID REFERENCES users(id),
  file_url TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  marks_obtained INTEGER,
  feedback TEXT,
  graded_by UUID REFERENCES users(id),
  graded_at TIMESTAMP
);

CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);

-- One submission per student per assignment
CREATE UNIQUE INDEX idx_submissions_unique ON submissions(assignment_id, student_id);
```

### exams
Exam definitions.

```sql
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('MCQ', 'SUBJECTIVE', 'BOTH')),
  subject_id UUID REFERENCES subjects(id),
  total_marks INTEGER NOT NULL,
  mcq_marks INTEGER,
  subjective_marks INTEGER,
  duration INTEGER NOT NULL,  -- in minutes
  start_time TIMESTAMP,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exams_subject ON exams(subject_id);
```

### exam_questions
MCQ questions for exams.

```sql
CREATE TABLE exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,  -- ["Option A", "Option B", "Option C", "Option D"]
  correct_option INTEGER NOT NULL,  -- 0-indexed
  marks INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exam_questions_exam ON exam_questions(exam_id);
```

### exam_submissions
Student exam answers.

```sql
CREATE TABLE exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id),
  student_id UUID REFERENCES users(id),
  answers JSONB,  -- [{"questionId": "uuid", "selectedOption": 1}]
  score INTEGER,
  submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exam_submissions_exam ON exam_submissions(exam_id);
CREATE INDEX idx_exam_submissions_student ON exam_submissions(student_id);

-- One submission per student per exam
CREATE UNIQUE INDEX idx_exam_submissions_unique ON exam_submissions(exam_id, student_id);
```

### grades
Final grades per subject per semester.

```sql
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  subject_id UUID REFERENCES subjects(id),
  semester_id UUID REFERENCES semesters(id),
  marks_obtained INTEGER,
  total_marks INTEGER,
  grade VARCHAR(5),
  cgpa DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_subject ON grades(subject_id);
CREATE INDEX idx_grades_semester ON grades(semester_id);
```

### fee_structures
Fee definitions per class/semester.

```sql
CREATE TABLE fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  campus_id UUID REFERENCES campuses(id),
  class_id UUID REFERENCES classes(id),
  semester_id UUID REFERENCES semesters(id),
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_structures_campus ON fee_structures(campus_id);
CREATE INDEX idx_fee_structures_class ON fee_structures(class_id);
```

### fee_invoices
Individual student fee invoices.

```sql
CREATE TABLE fee_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  fee_structure_id UUID REFERENCES fee_structures(id),
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(10) DEFAULT 'UNPAID' CHECK (status IN ('PAID', 'UNPAID', 'PARTIAL')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_invoices_student ON fee_invoices(student_id);
CREATE INDEX idx_fee_invoices_status ON fee_invoices(status);
```

### fee_payments
Payment transactions.

```sql
CREATE TABLE fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES fee_invoices(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  status VARCHAR(20) DEFAULT 'PENDING',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fee_payments_invoice ON fee_payments(invoice_id);
```

### books
Library book catalog.

```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  isbn VARCHAR(20) UNIQUE,
  campus_id UUID REFERENCES campuses(id),
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_books_campus ON books(campus_id);
CREATE INDEX idx_books_isbn ON books(isbn);
```

### book_issues
Book lending records.

```sql
CREATE TABLE book_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id),
  student_id UUID REFERENCES users(id),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  fine DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_book_issues_book ON book_issues(book_id);
CREATE INDEX idx_book_issues_student ON book_issues(student_id);
```

### hostels
Hostel buildings.

```sql
CREATE TABLE hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  campus_id UUID REFERENCES campuses(id),
  warden_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### rooms
Rooms within hostels.

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID REFERENCES hostels(id),
  room_number VARCHAR(20) NOT NULL,
  capacity INTEGER NOT NULL,
  occupied INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rooms_hostel ON rooms(hostel_id);
```

### room_allocations
Student room assignments.

```sql
CREATE TABLE room_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id),
  student_id UUID REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_room_allocations_room ON room_allocations(room_id);
CREATE INDEX idx_room_allocations_student ON room_allocations(student_id);
```

### bus_routes
Transport routes.

```sql
CREATE TABLE bus_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  campus_id UUID REFERENCES campuses(id),
  bus_number VARCHAR(20),
  driver_name VARCHAR(255),
  driver_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### bus_stops
Stops along a route.

```sql
CREATE TABLE bus_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES bus_routes(id),
  name VARCHAR(255) NOT NULL,
  time TIME,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bus_stops_route ON bus_stops(route_id);
```

### student_transport
Student bus assignments.

```sql
CREATE TABLE student_transport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  route_id UUID REFERENCES bus_routes(id),
  stop_id UUID REFERENCES bus_stops(id),
  transport_fee DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_transport_student ON student_transport(student_id);
```

### chats
Chat sessions between student and teacher.

```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  teacher_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chats_student ON chats(student_id);
CREATE INDEX idx_chats_teacher ON chats(teacher_id);

-- One chat per student-teacher pair
CREATE UNIQUE INDEX idx_chats_unique ON chats(student_id, teacher_id);
```

### messages
Individual chat messages.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id),
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_sent ON messages(sent_at);
```

### notices
Announcements and notices.

```sql
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  campus_id UUID REFERENCES campuses(id),
  target_class_id UUID REFERENCES classes(id),
  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notices_campus ON notices(campus_id);
CREATE INDEX idx_notices_class ON notices(target_class_id);
```

### certificates
Generated certificates.

```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'BONAFIDE', 'TRANSFER', 'CHARACTER', 'MIGRATION', 'OTHER'
  )),
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_certificates_student ON certificates(student_id);
CREATE INDEX idx_certificates_type ON certificates(type);
```

### activity_logs
Audit trail for all actions.

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);
```

---

## Common Queries

### Get student attendance percentage

```sql
SELECT
  s.name,
  sub.name as subject,
  COUNT(a.id) as total_classes,
  COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) as present,
  ROUND(
    COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END)::DECIMAL /
    COUNT(a.id) * 100, 1
  ) as percentage
FROM attendance a
JOIN users s ON a.student_id = s.id
JOIN subjects sub ON a.subject_id = sub.id
WHERE a.student_id = 'student-uuid'
GROUP BY s.name, sub.name;
```

### Get class-wise grade distribution

```sql
SELECT
  g.grade,
  COUNT(*) as student_count
FROM grades g
WHERE g.subject_id = 'subject-uuid'
  AND g.semester_id = 'semester-uuid'
GROUP BY g.grade
ORDER BY g.grade;
```

### Get at-risk students (low attendance + low grades)

```sql
WITH attendance_stats AS (
  SELECT
    student_id,
    ROUND(
      COUNT(CASE WHEN status = 'PRESENT' THEN 1 END)::DECIMAL /
      COUNT(*) * 100, 1
    ) as attendance_pct
  FROM attendance
  WHERE date >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY student_id
),
grade_stats AS (
  SELECT
    student_id,
    ROUND(AVG(cgpa), 2) as avg_cgpa
  FROM grades
  WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
  GROUP BY student_id
)
SELECT
  u.id,
  u.name,
  u.email,
  a.attendance_pct,
  g.avg_cgpa
FROM users u
JOIN attendance_stats a ON u.id = a.student_id
JOIN grade_stats g ON u.id = g.student_id
WHERE a.attendance_pct < 75
  AND g.avg_cgpa < 5.0
  AND u.role = 'STUDENT'
ORDER BY a.attendance_pct ASC;
```

### Get fee collection summary

```sql
SELECT
  c.name as campus,
  COUNT(fi.id) as total_invoices,
  SUM(CASE WHEN fi.status = 'PAID' THEN fi.amount ELSE 0 END) as collected,
  SUM(CASE WHEN fi.status = 'UNPAID' THEN fi.amount ELSE 0 END) as pending,
  SUM(CASE WHEN fi.due_date < CURRENT_DATE AND fi.status = 'UNPAID' THEN fi.amount ELSE 0 END) as overdue
FROM fee_invoices fi
JOIN users s ON fi.student_id = s.id
JOIN campuses c ON s.campus_id = c.id
GROUP BY c.name;
```

### Get teacher's class load

```sql
SELECT
  u.name as teacher,
  COUNT(DISTINCT t.class_id) as classes_teaching,
  COUNT(DISTINCT t.subject_id) as subjects_teaching,
  COUNT(t.id) as weekly_periods
FROM timetables t
JOIN users u ON t.teacher_id = u.id
WHERE u.role = 'TEACHER'
GROUP BY u.name
ORDER BY weekly_periods DESC;
```
