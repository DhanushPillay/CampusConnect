# CampusConnect

A single web platform that gives Admin, Teacher, and Student each their own view, covering attendance, grades, timetable, assignments, notices, fees, chat, and analytics in one place.

Built for multi-campus institutions with role-based access, real-time communication, and zero deployment cost.

---

## Features

### Admin
- Create and manage teacher/student accounts (email + password)
- Multi-campus management with central dashboard
- Academic setup (departments, classes, subjects, calendar)
- Timetable creation with conflict detection
- Attendance and grade oversight across all classes
- Fee structure, invoicing, and Razorpay payment tracking
- Exam scheduling (MCQ + subjective)
- Certificate generation (bonafide, transfer, migration)
- Analytics dashboard with at-risk student detection

### Teacher
- Mark daily attendance
- Enter and publish grades
- Create assignments with deadlines and file uploads
- Upload study material (PDFs, links, videos)
- Create MCQ exams (auto-grading) and subjective exams
- Chat with students
- Post announcements to classes
- View class analytics

### Student
- View attendance record and percentage
- View grades, CGPA, performance history
- View class timetable
- Submit assignments and view feedback
- Take online exams (MCQ timed + subjective)
- Download study materials
- Pay fees online via Razorpay
- Request and download certificates
- Chat with teachers
- Search library books

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | Next.js 14 (TypeScript, App Router) |
| Styling        | Tailwind CSS + shadcn/ui            |
| Backend        | Next.js API Routes                  |
| Database       | PostgreSQL (Supabase free tier)     |
| ORM            | Prisma                              |
| Auth           | Supabase Auth (JWT, role-based)     |
| Real-time      | Supabase Realtime                   |
| File Storage   | Supabase Storage                    |
| Email          | Resend                              |
| Payments       | Razorpay                            |
| Deployment     | Vercel (free tier)                  |

**Total deployment cost: ₹0/month**

See [docs/architecture.md](docs/architecture.md) for full architecture details.

---

## Project Structure

```
campus-connect/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Login, register pages
│   │   ├── (dashboard)/        # Dashboard layouts per role
│   │   │   ├── admin/          # Admin dashboard pages
│   │   │   ├── teacher/        # Teacher dashboard pages
│   │   │   └── student/        # Student dashboard pages
│   │   └── api/                # API route handlers
│   │       ├── auth/           # Authentication endpoints
│   │       ├── admin/          # Admin CRUD endpoints
│   │       ├── teacher/        # Teacher endpoints
│   │       ├── student/        # Student endpoints
│   │       └── webhooks/       # Razorpay webhooks
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── forms/              # Form components
│   │   └── layouts/            # Layout components
│   ├── lib/                    # Utilities
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── supabase.ts         # Supabase client
│   │   ├── auth.ts             # Auth helpers
│   │   ├── razorpay.ts         # Razorpay integration
│   │   └── utils.ts            # Shared utilities
│   ├── types/                  # TypeScript type definitions
│   └── middleware.ts           # Role-based route protection
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration history
│   └── seed.ts                 # Seed script
├── docs/                       # Documentation
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- A [Supabase](https://supabase.com) account (free)
- A [Vercel](https://vercel.com) account (free)

### 1. Clone and install

```bash
git clone https://github.com/your-username/campus-connect.git
cd campus-connect
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase and Razorpay keys. See [docs/environment.md](docs/environment.md) for all variables.

### 3. Set up database

```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Login with seeded admin

```
Email: admin@campusconnect.com
Password: admin123
```

---

## Scripts

| Command                  | Description                    |
|--------------------------|--------------------------------|
| `npm run dev`            | Start development server       |
| `npm run build`          | Build for production           |
| `npm start`              | Start production server        |
| `npm run lint`           | Run ESLint                     |
| `npm run db:migrate`     | Run Prisma migrations          |
| `npm run db:seed`        | Seed database with sample data |
| `npm run db:studio`      | Open Prisma Studio             |
| `npm run db:generate`    | Generate Prisma client         |

---

## Deployment

See [docs/deployment.md](docs/deployment.md) for the complete deployment guide.

**TL;DR:**
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

---

## Documentation

| File                                    | Description                          |
|-----------------------------------------|--------------------------------------|
| [Architecture](docs/architecture.md)    | System design, data flow, auth flow  |
| [Features](docs/features.md)            | Full feature breakdown by role       |
| [Deployment](docs/deployment.md)        | Step-by-step deployment guide        |
| [API Reference](docs/api.md)            | All API routes and endpoints         |
| [Database](docs/database.md)            | Schema, relationships, queries       |
| [Environment](docs/environment.md)      | Environment variables reference      |

---

## Team

| Member    | Responsibility                                    |
|-----------|---------------------------------------------------|
| Dev A     | Auth, Admin Dashboard, Multi-campus, DB Schema    |
| Dev B     | Attendance, Grades, Exams, Assignments, Analytics  |
| Dev C     | Fees, Library, Hostel, Transport, Certificates     |
| Dev D     | Chat, Notifications, Student/Teacher Dashboards     |

---

## License

MIT
