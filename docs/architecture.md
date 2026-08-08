# Architecture

System architecture for CampusConnect.

---

## System Overview

```
                          ┌─────────────────────┐
                          │      Browser        │
                          │   (Student/Teacher  │
                          │    /Admin)          │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │      Vercel         │
                          │  (Next.js SSR +     │
                          │   API Routes)       │
                          │                     │
                          │  ┌───────────────┐  │
                          │  │  Middleware    │  │
                          │  │  (Auth + Role) │  │
                          │  └───────┬───────┘  │
                          │          │          │
                          │  ┌───────▼───────┐  │
                          │  │  API Routes   │  │
                          │  │  /api/*       │  │
                          │  └───────┬───────┘  │
                          └──────────┼──────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
           ┌────────▼───────┐ ┌─────▼──────┐ ┌───────▼───────┐
           │   Supabase     │ │  Resend    │ │   Razorpay    │
           │   (PostgreSQL  │ │  (Email)   │ │   (Payments)  │
           │    + Auth +    │ │            │ │               │
           │    Storage +   │ └────────────┘ └───────────────┘
           │    Realtime)   │
           └────────────────┘
```

---

## How Roles Connect

```
┌─────────────────────────────────────────────────────────────────┐
│                        INSTITUTION                              │
│                                                                 │
│  ┌──────────┐                                                   │
│  │  ADMIN   │ Creates accounts for:                             │
│  │          │   ├── Teachers (email + password)                 │
│  │          │   └── Students (email + password)                 │
│  │          │                                                   │
│  │          │ Manages:                                          │
│  │          │   ├── Campuses                                    │
│  │          │   ├── Departments, Classes, Subjects              │
│  │          │   ├── Fee structures                              │
│  │          │   ├── Exams and grading scales                    │
│  │          │   └── Notices and announcements                   │
│  └────┬─────┘                                                   │
│       │                                                         │
│       ├── Assigns teacher → to classes                          │
│       ├── Assigns student → to classes                          │
│       └── Assigns teacher → to subjects                         │
│                                                                 │
│  ┌──────────┐                                                   │
│  │ TEACHER  │ Works with:                                       │
│  │          │   ├── Their assigned classes                      │
│  │          │   ├── Their assigned subjects                     │
│  │          │   └── Students in those classes                   │
│  │          │                                                   │
│  │          │ Actions:                                          │
│  │          │   ├── Marks attendance                            │
│  │          │   ├── Enters grades                               │
│  │          │   ├── Creates assignments                         │
│  │          │   ├── Creates exams                               │
│  │          │   ├── Uploads study material                      │
│  │          │   └── Chats with students                         │
│  └────┬─────┘                                                   │
│       │                                                         │
│       │ Teacher ←──→ Student (via chat, grades, attendance)     │
│       │                                                         │
│  ┌────▼─────┐                                                   │
│  │ STUDENT  │ Views/Actions:                                    │
│  │          │   ├── Own attendance, grades, timetable           │
│  │          │   ├── Submits assignments                         │
│  │          │   ├── Takes online exams                          │
│  │          │   ├── Pays fees (Razorpay)                        │
│  │          │   ├── Downloads certificates                      │
│  │          │   └── Chats with teachers                         │
│  └──────────┘                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Multi-Campus Data Model

Every major table has a `campusId` column. Data is isolated per campus, but the central admin can see everything.

```
┌─────────────────────────────────────────────────────────┐
│                    CENTRAL ADMIN                         │
│  Can see: All campuses, all data, cross-campus reports  │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
   ┌──────▼──────┐ ┌──▼────────┐ ┌─▼──────────┐
   │   Campus A  │ │ Campus B  │ │ Campus C   │
   │             │ │           │ │            │
   │ Students    │ │ Students  │ │ Students   │
   │ Teachers    │ │ Teachers  │ │ Teachers   │
   │ Classes     │ │ Classes   │ │ Classes    │
   │ Fee struct  │ │ Fee struct│ │ Fee struct │
   │ Timetable   │ │ Timetable │ │ Timetable  │
   └─────────────┘ └───────────┘ └────────────┘
```

**Rules:**
- A student belongs to one campus
- A teacher can belong to multiple campuses
- Fee structures are per-campus
- Timetables are per-campus
- The central admin dashboard aggregates data across all campuses

---

## Auth Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐
│  User   │────▶│ Supabase │────▶│  JWT     │
│ (login) │     │  Auth    │     │  Token   │
└─────────┘     └──────────┘     └────┬─────┘
                                      │
                              ┌───────▼───────┐
                              │   Middleware   │
                              │               │
                              │ 1. Verify JWT │
                              │ 2. Check role │
                              │ 3. Route to   │
                              │    dashboard  │
                              └───────┬───────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
             ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
             │  /admin/*   │  │ /teacher/*  │  │ /student/*  │
             │  Admin      │  │  Teacher    │  │  Student    │
             │  Dashboard  │  │  Dashboard  │  │  Dashboard  │
             └─────────────┘  └─────────────┘  └─────────────┘
```

**Role-based middleware:**
- `/admin/*` routes → only ADMIN role
- `/teacher/*` routes → only TEACHER role
- `/student/*` routes → only STUDENT role
- API routes check role + ownership (e.g., teacher can only mark attendance for their classes)

---

## Real-time Chat Flow

```
┌──────────┐                    ┌──────────┐
│ Student  │◀──── Supabase ────▶│ Teacher  │
│ (chat)   │     Realtime       │ (chat)   │
└────┬─────┘    (WebSocket)     └────┬─────┘
     │                               │
     └───────────┬───────────────────┘
                 │
        ┌────────▼────────┐
        │   chats table   │
        │   messages table│
        │                 │
        │  student_id     │
        │  teacher_id     │
        │  content        │
        │  sent_at        │
        │  read_at        │
        └─────────────────┘
```

**How it works:**
1. Student opens chat → creates/gets chat session with teacher
2. Both subscribe to Supabase Realtime channel for that chat
3. New messages are inserted into `messages` table
4. Supabase broadcasts to both subscribers in real-time
5. `read_at` is updated when the other party opens the message

---

## Payment Flow (Razorpay)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Student  │────▶│  API     │────▶│ Razorpay │────▶│ Webhook  │
│ clicks   │     │ creates  │     │ checkout │     │ confirms │
│ "Pay"    │     │ order    │     │ page     │     │ payment  │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                         │
                                                ┌────────▼────────┐
                                                │  Update DB:     │
                                                │  invoice status │
                                                │  = PAID         │
                                                │  Store payment  │
                                                │  reference      │
                                                └─────────────────┘
```

**Flow:**
1. Student views unpaid fee invoices
2. Clicks "Pay Now" → API creates Razorpay order
3. Razorpay checkout page opens (UPI, card, netbanking)
4. On success, Razorpay sends webhook to `/api/webhooks/razorpay`
5. Webhook verifies signature, updates invoice status to PAID
6. Receipt is generated and available for download

---

## Technology Decisions

| Decision | Why |
|---|---|
| Next.js App Router | SSR for dashboards, API routes in one project |
| Supabase over raw PostgreSQL | Free auth, storage, realtime included |
| Prisma over Drizzle | Better DX, auto-generated types, migration workflow |
| shadcn/ui over component libraries | No bundle bloat, copy-paste components, fully customizable |
| Supabase Realtime over Socket.io | No extra server needed, free tier included |
| Razorpay over Stripe | India-focused, no monthly cost, 2% transaction fee |
| Vercel over AWS | Zero config for Next.js, free tier, no server management |
