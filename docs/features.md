# Features

Complete feature breakdown by role with priority levels.

---

## Priority Levels

| Priority | Meaning |
|----------|---------|
| P0 | Must-have for MVP (ship without it, the system is broken) |
| P1 | Core feature (needed for daily use) |
| P2 | Nice-to-have (add after core works) |
| P3 | Differentiator (what sets us apart) |

---

## Admin Dashboard

### User Management
| Feature | Priority | Description |
|---------|----------|-------------|
| Create student account | P0 | Admin enters name, email, password, class → student gets login |
| Create teacher account | P0 | Admin enters name, email, password, department → teacher gets login |
| Bulk import via CSV | P1 | Upload CSV to create 100+ students at once |
| Activate/deactivate accounts | P0 | Disable login without deleting data |
| Reset password | P0 | Admin resets any user's password |
| View all users | P0 | List with search, filter by role/campus/status |

### Multi-Campus
| Feature | Priority | Description |
|---------|----------|-------------|
| Create campus | P0 | Name, address, phone, email |
| Assign users to campus | P0 | Every user belongs to a campus |
| Central dashboard | P0 | Admin sees data from all campuses |
| Campus-wise filtering | P1 | Filter any report by campus |

### Academic Setup
| Feature | Priority | Description |
|---------|----------|-------------|
| Department CRUD | P0 | Create/edit/delete departments |
| Class management | P0 | Classes linked to departments |
| Subject management | P0 | Subjects linked to classes, assigned to teachers |
| Academic year | P0 | Define year and semesters |
| Grading scale | P0 | Configure CGPA/percentage rules |

### Timetable
| Feature | Priority | Description |
|---------|----------|-------------|
| Create timetable | P0 | Assign subject + teacher + room + time slot |
| Conflict detection | P1 | Prevent double-booking teacher or room |
| Edit/delete slots | P0 | Modify existing timetable |
| View by class/teacher | P0 | See timetable from any perspective |

### Attendance Oversight
| Feature | Priority | Description |
|---------|----------|-------------|
| View all attendance | P1 | Filter by date, class, teacher, student |
| Export attendance report | P1 | Download as CSV/PDF |
| Low attendance alerts | P2 | Flag students below 75% |

### Grade Management
| Feature | Priority | Description |
|---------|----------|-------------|
| View all grades | P1 | Per class, per subject, per student |
| Approve published results | P2 | Teacher enters → admin approves → student sees |
| Grade distribution charts | P2 | Visual graphs per class/subject |

### Fee Management
| Feature | Priority | Description |
|---------|----------|-------------|
| Define fee structures | P0 | Tuition, hostel, transport, library per class |
| Generate invoices | P0 | Auto-generate for all students |
| Track payments | P0 | See who paid, who hasn't |
| Overdue alerts | P1 | Auto-notify on missed deadlines |
| Razorpay integration | P0 | Online payment collection |
| Receipt generation | P1 | PDF receipt after payment |

### Exam Management
| Feature | Priority | Description |
|---------|----------|-------------|
| Create exams | P0 | Name, type (MCQ/subjective/both), subject, total marks |
| Schedule exams | P0 | Date, time, duration |
| MCQ question bank | P0 | Add questions with options and correct answer |
| Publish results | P0 | Make results visible to students |

### Notices
| Feature | Priority | Description |
|---------|----------|-------------|
| Post notice | P0 | Title, content, target (all/campus/class) |
| View notice history | P1 | All previously posted notices |

### Library
| Feature | Priority | Description |
|---------|----------|-------------|
| Add books | P1 | Title, author, ISBN, copies |
| Issue/return | P1 | Track which student has which book |
| Overdue tracking | P2 | Auto-calculate fines |
| Book reservation | P3 | Student reserves unavailable book |

### Hostel
| Feature | Priority | Description |
|---------|----------|-------------|
| Room allocation | P2 | Assign student to room |
| Occupancy tracking | P2 | See room availability |
| Hostel fee billing | P2 | Linked to fee system |

### Transport
| Feature | Priority | Description |
|---------|----------|-------------|
| Bus route setup | P2 | Route name, stops, timing |
| Assign students to routes | P2 | Link student to bus stop |
| Transport fee | P2 | Added to student invoice |

### Certificates
| Feature | Priority | Description |
|---------|----------|-------------|
| Generate bonafide | P1 | From student data, auto-filled |
| Generate transfer cert | P1 | On student leaving |
| Generate character cert | P2 | Based on conduct |
| Certificate numbering | P1 | Auto-increment unique numbers |

### Reports & Analytics
| Feature | Priority | Description |
|---------|----------|-------------|
| Attendance trends | P2 | Charts showing class/individual trends |
| Grade distribution | P2 | Histogram, class averages |
| Fee collection summary | P1 | Total collected, pending, overdue |
| At-risk student detection | P3 | Flag students with low attendance + low grades |
| Campus-wise comparison | P3 | Compare metrics across campuses |
| Export reports | P2 | PDF and Excel export |

---

## Teacher Dashboard

### Attendance
| Feature | Priority | Description |
|---------|----------|-------------|
| Mark attendance | P0 | Select class → mark each student present/absent/late |
| View history | P0 | See past attendance records |
| Bulk mark | P2 | Mark all present, then toggle absentees |

### Grades
| Feature | Priority | Description |
|---------|----------|-------------|
| Enter marks | P0 | Input marks per student per assignment/exam |
| Publish grades | P1 | Make grades visible to students |
| Grade history | P1 | View previously entered grades |

### Assignments
| Feature | Priority | Description |
|---------|----------|-------------|
| Create assignment | P0 | Title, description, deadline, max marks |
| View submissions | P0 | List of student submissions |
| Grade + comment | P0 | Mark and provide feedback |
| File upload | P1 | Attach reference files |

### Study Material
| Feature | Priority | Description |
|---------|----------|-------------|
| Upload notes | P1 | PDFs, links, videos per subject |
| Organize by subject | P1 | Materials linked to subjects |
| Delete/update | P1 | Manage existing materials |

### Exams
| Feature | Priority | Description |
|---------|----------|-------------|
| Create MCQ exam | P0 | Questions with 4 options, correct answer, marks |
| Create subjective exam | P0 | Questions with marks, manual grading later |
| Grade subjective answers | P1 | Review and mark student answers |
| Set exam timing | P0 | Duration, start time, auto-submit |

### Chat
| Feature | Priority | Description |
|---------|----------|-------------|
| Chat with students | P0 | 1:1 chat per student |
| View all conversations | P1 | List of active chats |
| Send files | P2 | Attach files in chat |

### Announcements
| Feature | Priority | Description |
|---------|----------|-------------|
| Post to class | P1 | Announcement visible to students in class |
| Edit/delete | P1 | Modify or remove announcements |

### Analytics
| Feature | Priority | Description |
|---------|----------|-------------|
| Class attendance overview | P1 | Which students are regular/irregular |
| Grade distribution | P1 | How class performed in exams |
| Student performance trend | P2 | Track individual student over time |

### Leave Request
| Feature | Priority | Description |
|---------|----------|-------------|
| Request leave | P2 | Teacher submits leave request to admin |
| View status | P2 | Pending/approved/rejected |

---

## Student Dashboard

### Attendance
| Feature | Priority | Description |
|---------|----------|-------------|
| View own attendance | P0 | Per subject, percentage |
| Attendance history | P1 | Day-wise breakdown |

### Grades
| Feature | Priority | Description |
|---------|----------|-------------|
| View grades | P0 | Per subject, per exam |
| CGPA/percentage | P0 | Current and semester-wise |
| Performance history | P1 | Track improvement over semesters |

### Timetable
| Feature | Priority | Description |
|---------|----------|-------------|
| View own schedule | P0 | Class-wise timetable |
| Exam timetable | P1 | Upcoming exams with dates |

### Assignments
| Feature | Priority | Description |
|---------|----------|-------------|
| View assignments | P0 | List of all assigned tasks |
| Submit assignment | P0 | Upload file before deadline |
| View grade + feedback | P0 | See marks and teacher comments |
| View deadlines | P1 | Upcoming and overdue |

### Study Material
| Feature | Priority | Description |
|---------|----------|-------------|
| Download notes | P1 | PDFs, links from teachers |
| Organize by subject | P1 | Materials grouped by subject |

### Exams
| Feature | Priority | Description |
|---------|----------|-------------|
| Take MCQ exam | P0 | Timed, auto-submit on expiry |
| Write subjective answer | P0 | Type answer, submit |
| View results | P0 | Score, grade, rank in class |

### Fees
| Feature | Priority | Description |
|---------|----------|-------------|
| View fee status | P0 | Paid/unpaid invoices |
| Pay online | P0 | Razorpay checkout (UPI, card, netbanking) |
| Download receipt | P1 | PDF receipt after payment |
| View payment history | P1 | All past transactions |

### Notices
| Feature | Priority | Description |
|---------|----------|-------------|
| View announcements | P0 | Institution and class notices |
| Notice details | P0 | Full content of each notice |

### Chat
| Feature | Priority | Description |
|---------|----------|-------------|
| Chat with teachers | P0 | 1:1 per teacher |
| Send files | P2 | Attach files in chat |

### Certificates
| Feature | Priority | Description |
|---------|----------|-------------|
| Request certificate | P1 | Choose type, submit request |
| Download certificate | P1 | PDF download after approval |

### Library
| Feature | Priority | Description |
|---------|----------|-------------|
| Search books | P2 | Find books in catalog |
| View issued books | P2 | Currently borrowed books |
| Reserve book | P3 | Reserve unavailable book |
| Pay fines | P2 | Online fine payment |

---

## Feature Timeline

### Phase 1 (Month 1-2): Foundation
Auth, DB, Admin user management, campus CRUD, dashboards

### Phase 2 (Month 2-3): Core Academics
Timetable, attendance, grades, assignments

### Phase 3 (Month 3-4): Exams + Fees
Online exams, fee management, Razorpay

### Phase 4 (Month 4-5): Operations
Library, hostel, transport, certificates

### Phase 5 (Month 5-6): Communication + Analytics
Chat, notifications, analytics, at-risk detection
