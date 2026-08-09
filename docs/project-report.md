1. CampusConnect

A Unified Web Platform for Institutional Academic Management

2. Abstract

Educational institutions today juggle multiple disconnected tools for attendance, grades, timetables, assignments, exams, fees, and communication. This fragmentation wastes time, creates data silos, and makes it hard for administrators to get a clear picture of what's happening across their campus. CampusConnect solves this by bringing everything into a single web platform. The system gives admins, teachers, and students their own dashboards with role-based access. Admins manage user accounts, academic structure, fees, and certificates. Teachers mark attendance, enter grades, create assignments, and chat with students. Students view their records, take online exams, pay fees, and communicate with teachers. The platform also includes an analytics dashboard that flags at-risk students based on attendance and grade patterns. Built with Next.js, PostgreSQL, Supabase, and deployed on Vercel, CampusConnect runs at zero hosting cost and supports multiple campuses under one roof.

3. Introduction

Running a college or school means dealing with a lot of moving parts. Attendance records live in one spreadsheet, grades in another, fee receipts in a drawer somewhere, and timetables pinned to a notice board. Teachers spend hours on paperwork that could take minutes. Students miss deadlines because they didn't see the announcement. Admins can't tell which students are falling behind until it's too late.

The problem isn't that these tasks are hard. It's that they're scattered. A teacher marks attendance on paper, then enters it into a system later. An admin generates fee receipts in Excel, then emails them individually. A student checks three different apps to find their timetable, grades, and assignment deadlines.

CampusConnect brings all of this under one roof. It's a role-based web platform where admins, teachers, and students each get a dashboard tailored to what they need. The admin sets up the institution (campuses, departments, classes, subjects, fee structures). Teachers handle day-to-day academic tasks (attendance, grades, assignments, exams). Students access everything from one place (their records, exams, fees, chat with teachers).

The key differentiator is the analytics dashboard. Instead of just storing data, the system analyzes it. It looks at attendance patterns, grade distributions, and fee collection to flag students who might need help. This turns a record-keeping tool into something that actually supports decision-making.

4. Problem Definition

Most educational institutions still rely on a patchwork of tools to manage their operations. A typical school might use Excel for attendance, WhatsApp for announcements, a separate portal for fees, and paper forms for certificates. This creates several problems:

Data gets duplicated across systems. A student's information might be entered in three different places, and when it changes, not all records get updated. Teachers waste time on repetitive data entry instead of focusing on teaching. Admins can't generate institution-wide reports because the data isn't in one place. Students struggle to keep track of deadlines, grades, and fee payments across multiple platforms. There's no way to identify at-risk students early because nobody has the full picture.

The absence of a unified system also means there's no single source of truth. Which student paid their fees? Depends on who you ask. What's the attendance rate for Class 10-A? Nobody knows without manually compiling data from multiple sources.

5. Objectives

- Build a single platform that handles attendance, grades, timetables, assignments, exams, fees, library, chat, and certificates
- Provide separate dashboards for admin, teacher, and student roles with appropriate access controls
- Support multi-campus institutions with data isolation between campuses and a central admin view
- Enable teachers to mark attendance, enter grades, and create exams (MCQ with auto-grading and subjective with manual grading)
- Allow students to take timed online exams, pay fees online, and chat with teachers in real-time
- Implement an analytics dashboard that visualizes attendance trends, grade distributions, and fee collection
- Flag at-risk students automatically based on low attendance and low academic performance
- Generate certificates (bonafide, transfer, character) from student data without manual form filling
- Deploy the entire system at zero hosting cost using free-tier services

6. Scope of the Project

CampusConnect covers the full academic lifecycle from student enrollment to graduation. The system handles:

Academic Management: Department, class, subject, and timetable creation with conflict detection. Attendance tracking with percentage calculation per subject. Grade entry, CGPA calculation, and result publishing.

Assessment: MCQ exam creation with auto-grading. Subjective exam creation with manual grading. Timed exam interface with auto-submit.

Financial Management: Fee structure definition per class and semester. Bulk invoice generation. Online payment collection. Receipt generation and download.

Operations: Library book management with issue/return and fine calculation. Certificate generation (bonafide, transfer, character). Notice board with targeted announcements.

Communication: Real-time student-teacher chat. Notice and announcement system.

Analytics: Attendance trend visualization. Grade distribution charts. Fee collection summary. At-risk student detection.

The system does not cover HR/payroll for staff, transport management, hostel management, or parent portals. These can be added as future modules.

7. Proposed System

CampusConnect uses a modern web stack built for simplicity and zero-cost deployment.

System Architecture:

The system follows a three-tier architecture:

1. Presentation Layer: Next.js 14 frontend with TypeScript and Tailwind CSS. Three separate dashboard layouts for admin, teacher, and student roles. Responsive design works on desktop and mobile browsers.

2. Application Layer: Next.js API Routes handle all backend logic. Prisma ORM manages database queries. Supabase Auth handles authentication with JWT tokens. Supabase Realtime powers live chat. Docker containers ensure consistent environments across development and production.

3. Data Layer: PostgreSQL database hosted on Supabase. Supabase Storage for file uploads (assignments, certificates, study material). AWS S3 serves as the primary file storage for production deployments, with CloudFront CDN for fast static asset delivery. AWS SES handles transactional emails at scale.

Key Modules:

- User Management: Admin creates accounts with email/password. Role-based access control (ADMIN, TEACHER, STUDENT). Campus assignment for multi-campus support.

- Academic Module: CRUD for departments, classes, subjects. Timetable builder with teacher and room conflict detection. Attendance marking with present/absent/late statuses.

- Assessment Module: MCQ exam creation with 4 options per question. Subjective exam creation with marks per question. Exam interface with countdown timer and auto-submit. MCQ auto-grading on submission.

- Fee Module: Fee structure definition. Bulk invoice generation. Online payment integration. Payment status tracking and receipt generation.

- Library Module: Book catalog with ISBN, author, and copies. Issue/return workflow. Overdue fine calculation at ₹5 per day.

- Communication Module: Student-teacher chat using Supabase Realtime. Notice board with campus/class targeting.

- Analytics Module: Attendance trend charts. Grade distribution histograms. Fee collection summary. At-risk student flagging (attendance < 75% AND CGPA < 5.0).

- Certificate Module: Student requests certificate type. Admin approves. PDF auto-generated with unique certificate number.

Workflow:

1. Admin sets up campus, departments, classes, subjects, and fee structures
2. Admin creates teacher and student accounts
3. Teachers mark attendance, create assignments, and set up exams
4. Students view their data, submit assignments, take exams, and pay fees
5. System analyzes data and flags at-risk students on admin dashboard

8. System Requirements

Hardware Requirements:

- Processor: Intel Core i3 or equivalent (any modern processor)
- RAM: 4 GB minimum, 8 GB recommended
- Storage: 2 GB free disk space
- Internet connection required for cloud-hosted deployment

Software Requirements:

- Operating System: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- Node.js: Version 18 or higher
- npm: Version 9 or higher
- Web Browser: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- Git: For version control

Development Dependencies:

- Next.js 14: React framework with App Router
- TypeScript: Type-safe JavaScript
- Prisma: Database ORM and migration tool
- Tailwind CSS: Utility-first CSS framework
- shadcn/ui: Pre-built UI components
- Docker: Containerization for consistent dev/prod environments
- AWS CLI: Command-line interface for AWS service management

External Services (Free Tier):

- Supabase: PostgreSQL database, authentication, storage, realtime
- Vercel: Frontend and API hosting
- AWS S3: File storage for assignments, certificates, study material (5 GB free tier)
- AWS CloudFront: CDN for fast static asset delivery (1 TB data transfer free tier)
- AWS SES: Transactional email notifications (62,000 emails/month free when sent from EC2/ECS)
- Resend: Email notifications (100 emails/day free)

## Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 14 (TypeScript), React, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Next.js API Routes, Prisma ORM |
| **Database** | PostgreSQL (Supabase) |
| **DevOps / Deployment** | Vercel, GitHub, Prisma Migrate, AWS (S3, SES, CloudFront), Docker |
| **Development Tools** | Tailwind CSS, shadcn/ui, ESLint, Supabase CLI, UptimeRobot |

9. Methodology / Implementation Plan

Development Methodology:

The project follows Agile methodology with 2-week sprints. Each sprint focuses on a specific module. The Kanban board tracks tasks across TODO, In Progress, and Done columns.

Phase 1: Foundation (Weeks 1-4)

- Set up Next.js project with TypeScript and Tailwind CSS
- Create Supabase project and configure PostgreSQL database
- Design and implement Prisma schema for all tables
- Implement authentication with Supabase Auth (email/password, role-based)
- Build role-based route protection middleware
- Create basic dashboard layouts for admin, teacher, and student

Phase 2: Core Academics (Weeks 5-8)

- Build admin pages for campus, department, class, and subject management
- Create timetable builder with conflict detection
- Implement attendance marking system for teachers
- Build grade entry and CGPA calculation system
- Create assignment creation and submission workflow
- Build student dashboard views for attendance, grades, and timetable

Phase 3: Exams and Fees (Weeks 9-12)

- Create MCQ exam builder with questions, options, and correct answers
- Create subjective exam builder with questions and marks
- Build exam-taking interface with countdown timer and auto-submit
- Implement MCQ auto-grading on submission
- Build fee structure management and invoice generation
- Integrate online payment gateway
- Create receipt generation and PDF download

Phase 4: Operations (Weeks 13-16)

- Build library book management (add, issue, return, fine calculation)
- Create certificate request and approval workflow
- Implement PDF certificate generation with unique numbering
- Build notice posting system with campus/class targeting
- Create notice list components for all dashboards

Phase 5: Communication and Analytics (Weeks 17-20)

- Implement student-teacher chat using Supabase Realtime
- Build chat list and message interface
- Create analytics dashboard with attendance and grade charts
- Implement at-risk student detection algorithm
- Add PDF and Excel export for reports
- Final testing and bug fixes

Phase 6: Containerization and AWS Deployment (Weeks 21-24)

- Create Dockerfile and docker-compose.yml for local development
- Containerize Next.js application with multi-stage builds
- Set up AWS S3 bucket for file storage (assignments, certificates, study material)
- Configure AWS CloudFront distribution for CDN and static asset caching
- Set up AWS SES for transactional emails (fee receipts, certificate approvals, notifications)
- Deploy containerized application to AWS ECS or EC2
- Configure environment variables and secrets management
- Set up CI/CD pipeline with GitHub Actions for automated deployments
- Performance testing and optimization
- Security audit and penetration testing

10. Expected Outcome

- A fully functional web platform that replaces 5+ disconnected tools with one unified system
- Role-based dashboards where admin, teacher, and student each see only what's relevant to them
- Multi-campus support with data isolation and a central admin view
- Timetable creation that prevents teacher and room conflicts
- Attendance tracking with real-time percentage calculation per student per subject
- Grade management with CGPA calculation and result publishing
- Online exams with MCQ auto-grading and timed interface
- Fee collection through online payment gateway with invoice tracking and receipt generation
- Library management with issue/return tracking and overdue fine calculation
- Certificate generation from student data without manual form filling
- Real-time chat between students and teachers
- Analytics dashboard that visualizes institutional data and flags at-risk students
- Containerized deployment using Docker for consistent environments across development and production
- AWS integration for scalable file storage (S3), fast content delivery (CloudFront), and reliable email services (SES)
- Zero deployment cost using Vercel and Supabase free tiers, with AWS services added as the institution scales

11. Applications / Use Cases

- Schools and Colleges: Centralize all academic and administrative operations under one platform
- Multi-Campus Institutions: Manage multiple locations with a central admin dashboard
- Coaching Centers: Track attendance, conduct online exams, and manage fees
- Training Institutes: Deliver course materials, assess learners, and generate certificates
- Administrative Staff: Reduce paperwork and automate repetitive tasks like invoice generation
- Teachers: Focus on teaching instead of data entry by using digital attendance and grading
- Students: Access all academic information from one dashboard instead of checking multiple apps

12. Future Enhancements / Future Scope

- Parent Portal: Give parents visibility into their child's attendance, grades, and fees
- Mobile App: Native Android and iOS apps for better mobile access
- AI-Powered Analytics: Predict student performance using machine learning on historical data
- Hostel Management: Room allocation, occupancy tracking, and hostel fee billing
- Transport Management: Bus routes, stop assignments, and transport fee integration
- HR Module: Staff attendance, payroll, and leave management
- Online Class Integration: Video conferencing integration for live classes
- Alumni Network: Alumni directory, events, and donation management
- Multi-Language Support: Interface in regional languages
- Blockchain Certificates: Tamper-proof digital certificates stored on blockchain

13. References

[1] Q. Wang, "Design and Implementation of College Student Management System Based on B/S Architecture," in Proc. 3rd International Conference on Internet, Education and Information Technology (IEIT), Xiamen, China, 2023, pp. 1308-1316, doi: 10.2991/978-94-6463-230-9_158.

[2] J. S. Pasaribu and I. S. Argadikusuma, "Design and Testing of a Web-Based Student Information Management System," International Journal of Engineering Science and Information Technology, vol. 4, no. 4, pp. 144-155, 2024, doi: 10.52088/ijesty.v4i4.594.

[3] P. Hu, "Investigation on Smart Campus Management Platform Based on Digital Twin," Procedia Computer Science, vol. 228, pp. 937-945, 2023, doi: 10.1016/j.procs.2023.11.123.

[4] H. Dandage, D. S. Uplaonkar, and A. Shete, "Online Examination and Evaluation System," in Proc. 2022 IEEE Pune Section International Conference (PuneCon), 2022, doi: 10.1109/PuneCon55413.2022.10014912.

[5] "Intelligent Campus Student Information Management System Based on Cloud Platform," in Proc. IEEE Conference, 2023, doi: 10.1109/IEEEConf.2023.10101285.

[6] "Attendance Management System," in Proc. IEEE Conference, 2021, doi: 10.1109/IEEEConf.2021.9402659.

[7] "EduGuard – AI Based Online Exam Management System," IEEE Xplore, 2025, doi: 10.1109/IEEEConf.2025.11052922.

[8] "Online Examination System with Measures for Prevention of Cheating along with Rapid Assessment and Automatic Grading," in Proc. IEEE Conference, 2023, doi: 10.1109/IEEEConf.2023.10039552.
