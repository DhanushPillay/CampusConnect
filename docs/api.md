# API Reference

All API routes organized by module.

---

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

---

## Authentication

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "campusId": "uuid"
  },
  "token": "jwt-token"
}
```

**Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

### POST /api/auth/logout
Logout current user.

### GET /api/auth/me
Get current user from JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

---

## Admin - User Management

### GET /api/admin/users
List all users. Supports filtering.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| role | string | Filter by role: ADMIN, TEACHER, STUDENT |
| campusId | string | Filter by campus |
| search | string | Search by name or email |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 20) |

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "campus": { "id": "uuid", "name": "Main Campus" },
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

### POST /api/admin/users
Create a new user (student or teacher).

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "temp123",
  "role": "STUDENT",
  "campusId": "uuid",
  "classId": "uuid"
}
```

### PUT /api/admin/users/:id
Update user details.

### DELETE /api/admin/users/:id
Deactivate user (soft delete).

### POST /api/admin/users/bulk
Bulk import users via CSV.

---

## Admin - Campus Management

### GET /api/admin/campuses
List all campuses.

### POST /api/admin/campuses
Create a new campus.

**Request:**
```json
{
  "name": "Main Campus",
  "address": "123 Education Street",
  "phone": "+91-9876543210",
  "email": "main@campusconnect.com"
}
```

### PUT /api/admin/campuses/:id
Update campus details.

### DELETE /api/admin/campuses/:id
Delete campus (only if no users assigned).

---

## Admin - Academic Setup

### GET /api/admin/departments
List departments (filter by campus).

### POST /api/admin/departments
Create department.

### GET /api/admin/classes
List classes (filter by department).

### POST /api/admin/classes
Create class.

### GET /api/admin/subjects
List subjects (filter by class).

### POST /api/admin/subjects
Create subject and assign teacher.

### GET /api/admin/academic-years
List academic years.

### POST /api/admin/academic-years
Create academic year with semesters.

---

## Admin - Timetable

### GET /api/admin/timetable
Get timetable (filter by class, teacher, or day).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| classId | string | Filter by class |
| teacherId | string | Filter by teacher |
| day | string | Filter by day of week |

### POST /api/admin/timetable
Create timetable slot.

**Request:**
```json
{
  "classId": "uuid",
  "subjectId": "uuid",
  "teacherId": "uuid",
  "dayOfWeek": "MONDAY",
  "startTime": "09:00",
  "endTime": "09:45",
  "roomId": "uuid"
}
```

### PUT /api/admin/timetable/:id
Update timetable slot.

### DELETE /api/admin/timetable/:id
Delete timetable slot.

---

## Admin - Fee Management

### GET /api/admin/fees/structures
List fee structures.

### POST /api/admin/fees/structures
Create fee structure.

**Request:**
```json
{
  "name": "Tuition Fee - Class 10",
  "amount": 50000,
  "campusId": "uuid",
  "classId": "uuid",
  "semesterId": "uuid",
  "dueDate": "2024-03-15"
}
```

### POST /api/admin/fees/invoices
Generate invoices for students.

### GET /api/admin/fees/invoices
List invoices (filter by status, student, class).

### GET /api/admin/fees/collections
Fee collection summary and reports.

---

## Admin - Exam Management

### GET /api/admin/exams
List exams.

### POST /api/admin/exams
Create exam.

**Request:**
```json
{
  "name": "Mid-term Exam",
  "type": "BOTH",
  "subjectId": "uuid",
  "totalMarks": 100,
  "mcqMarks": 40,
  "subjectiveMarks": 60,
  "duration": 180,
  "startTime": "2024-02-15T09:00:00Z"
}
```

### POST /api/admin/exams/:id/questions
Add questions to exam.

### POST /api/admin/exams/:id/publish
Publish exam results.

---

## Admin - Notices

### GET /api/admin/notices
List notices.

### POST /api/admin/notices
Post notice.

**Request:**
```json
{
  "title": "Holiday Notice",
  "content": "Tomorrow is a holiday due to...",
  "targetCampusId": "uuid",
  "targetClassId": "uuid"
}
```

---

## Admin - Certificates

### GET /api/admin/certificates
List certificate requests.

### POST /api/admin/certificates/:id/approve
Approve and generate certificate.

---

## Teacher - Attendance

### GET /api/teacher/attendance
Get attendance for teacher's classes.

### POST /api/teacher/attendance
Mark attendance for a class.

**Request:**
```json
{
  "classId": "uuid",
  "subjectId": "uuid",
  "date": "2024-01-15",
  "records": [
    { "studentId": "uuid", "status": "PRESENT" },
    { "studentId": "uuid", "status": "ABSENT" },
    { "studentId": "uuid", "status": "LATE" }
  ]
}
```

### GET /api/teacher/attendance/history
View past attendance records.

---

## Teacher - Grades

### GET /api/teacher/grades
Get grades for teacher's classes.

### POST /api/teacher/grades
Enter marks.

**Request:**
```json
{
  "examId": "uuid",
  "records": [
    { "studentId": "uuid", "marksObtained": 85 },
    { "studentId": "uuid", "marksObtained": 72 }
  ]
}
```

### PUT /api/teacher/grades/:id
Update marks.

### POST /api/teacher/grades/publish
Publish grades to students.

---

## Teacher - Assignments

### GET /api/teacher/assignments
List assignments created by teacher.

### POST /api/teacher/assignments
Create assignment.

**Request:**
```json
{
  "title": "Chapter 5 Homework",
  "description": "Solve questions 1-10",
  "subjectId": "uuid",
  "deadline": "2024-01-20T23:59:59Z",
  "maxMarks": 20
}
```

### GET /api/teacher/assignments/:id/submissions
View submissions for an assignment.

### POST /api/teacher/assignments/:id/grade
Grade a submission.

**Request:**
```json
{
  "studentId": "uuid",
  "marksObtained": 18,
  "feedback": "Good work, minor errors in question 3"
}
```

---

## Teacher - Study Material

### GET /api/teacher/materials
List uploaded materials.

### POST /api/teacher/materials
Upload study material.

### DELETE /api/teacher/materials/:id
Delete material.

---

## Teacher - Exams

### GET /api/teacher/exams
List exams created by teacher.

### POST /api/teacher/exams/mcq
Create MCQ exam.

### POST /api/teacher/exams/subjective
Create subjective exam.

### GET /api/teacher/exams/:id/submissions
View exam submissions.

### POST /api/teacher/exams/:id/grade
Grade subjective answers.

---

## Teacher - Chat

### GET /api/teacher/chats
List all chat conversations.

### GET /api/teacher/chats/:id/messages
Get messages in a chat.

### POST /api/teacher/chats/:id/messages
Send a message.

---

## Teacher - Announcements

### GET /api/teacher/announcements
List announcements.

### POST /api/teacher/announcements
Post announcement to class.

---

## Student - Attendance

### GET /api/student/attendance
Get own attendance record.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| subjectId | string | Filter by subject |
| startDate | string | Filter from date |
| endDate | string | Filter to date |

**Response (200):**
```json
{
  "attendance": [
    {
      "date": "2024-01-15",
      "subject": "Mathematics",
      "status": "PRESENT"
    }
  ],
  "summary": {
    "totalClasses": 120,
    "present": 108,
    "absent": 8,
    "late": 4,
    "percentage": 90.0
  }
}
```

---

## Student - Grades

### GET /api/student/grades
Get own grades.

**Response (200):**
```json
{
  "grades": [
    {
      "subject": "Mathematics",
      "exam": "Mid-term",
      "marksObtained": 85,
      "totalMarks": 100,
      "grade": "A",
      "cgpa": 9.0
    }
  ],
  "overallCgpa": 8.5
}
```

---

## Student - Timetable

### GET /api/student/timetable
Get own class timetable.

---

## Student - Assignments

### GET /api/student/assignments
List all assignments (pending + submitted).

### GET /api/student/assignments/:id
Get assignment details.

### POST /api/student/assignments/:id/submit
Submit assignment (file upload).

### GET /api/student/assignments/:id/feedback
Get grade and feedback.

---

## Student - Study Material

### GET /api/student/materials
List available study materials.

---

## Student - Exams

### GET /api/student/exams
List upcoming and past exams.

### GET /api/student/exams/:id
Get exam details and questions (MCQ).

### POST /api/student/exams/:id/submit
Submit exam answers.

**Request:**
```json
{
  "answers": [
    { "questionId": "uuid", "selectedOption": "B" },
    { "questionId": "uuid", "selectedOption": "A" }
  ]
}
```

### POST /api/student/exams/:id/submit-subjective
Submit subjective answers.

### GET /api/student/exams/:id/result
Get exam result.

---

## Student - Fees

### GET /api/student/fees
Get own fee invoices.

**Response (200):**
```json
{
  "invoices": [
    {
      "id": "uuid",
      "feeType": "Tuition Fee",
      "amount": 50000,
      "dueDate": "2024-03-15",
      "status": "UNPAID",
      "paidAmount": 0
    }
  ],
  "totalPending": 75000,
  "totalPaid": 25000
}
```

### POST /api/student/fees/create-order
Create Razorpay order for payment.

**Request:**
```json
{
  "invoiceId": "uuid"
}
```

**Response (200):**
```json
{
  "orderId": "order_xxxxx",
  "amount": 50000,
  "currency": "INR",
  "key": "rzp_test_xxxxx"
}
```

### GET /api/student/fees/receipt/:id
Download payment receipt (PDF).

---

## Student - Chat

### GET /api/student/chats
List chat conversations.

### GET /api/student/chats/:id/messages
Get messages.

### POST /api/student/chats/:id/messages
Send message.

---

## Student - Certificates

### GET /api/student/certificates
List own certificates.

### POST /api/student/certificates/request
Request a certificate.

**Request:**
```json
{
  "type": "BONAFIDE"
}
```

---

## Student - Library

### GET /api/student/library/search
Search books.

### GET /api/student/library/issued
List issued books.

### POST /api/student/library/reserve
Reserve a book.

---

## Webhooks

### POST /api/webhooks/razorpay
Razorpay payment webhook.

**Headers:**
```
X-Razorpay-Signature: <signature>
```

**Events handled:**
- `payment.captured` → Update invoice status to PAID
- `payment.failed` → Log failure, notify student

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Not authorized (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 500 | Server error |
