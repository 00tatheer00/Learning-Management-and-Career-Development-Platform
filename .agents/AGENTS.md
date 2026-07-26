# Project Rules & Persistent Memory

- **Automatic Git Push**: Whenever fixes, features, or tasks are completed and committed, automatically run `git push origin main` (or the active branch) without asking for user confirmation.
- **Persistent Project Memory**: Maintain full awareness of this project's architecture, database schema, user roles, API endpoints, and configuration across all sessions.

## Project Memory & Context Summary

### Overview
- **Project**: Emerging Edge School Portal / Summer Course Portal (`00tatheer00/Learning-Management-and-Career-Development-Platform`)
- **Type**: Full-stack Learning Management & Career Development Platform built with Next.js App Router.

### Tech Stack & Libraries
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling & UI**: TailwindCSS v4, Framer Motion, Lucide Icons, Phosphor Icons, Radix UI primitives
- **Database & ORM**: MongoDB via Prisma (`@prisma/client`)
- **Authentication**: NextAuth.js (`next-auth`) with custom role-based access control (`student`, `trainer`, `admin`, `admin_readonly`)
- **Media & File Storage**: Cloudinary (payment screenshots & assets), Bunny.net (video streaming)
- **Integrations**: Resend (Email notifications), UltraMsg / WhatsApp Cloud API (WhatsApp notifications)

### Database Models & Schema Summary (`prisma/schema.prisma`)
- `User`: Accounts for students, trainers, and admins with `role`, `programSlug`, `level`, `batch`.
- `Enrollment`: Course registration forms, verification status (`pending`, `approved`, `rejected`), payment screenshot URLs.
- `Assignment` & `AssignmentSubmission`: Trainer assignments and student submissions.
- `CourseMaterial`: Video/Link/Document learning resources scoped by program & level.
- `LiveSession`: Scheduled classes with meet links/Jitsi integration.
- `PasswordResetToken` & WhatsApp webhook models.

### Key Workflows & API Endpoints
- **Public & Registration**: Program pages, course enrollment form (`/api/enrollment`), contact form.
- **Student Portal**: Student dashboard (`/student`), viewing materials, assignment submission (`/student/assignments`), live sessions.
- **Trainer Portal**: Trainer dashboard (`/trainer`), creating assignments, managing classes, grading submissions.
- **Admin Portal**: Admin management (`/admin`), reviewing enrollments, user management, program statistics.

### Environment & Production Setup
- Database connection via `DATABASE_URL` (MongoDB Atlas `mongodb+srv://...`).
- Prisma Client initialized via `@/lib/prisma`.
- Production deployment target: Vercel.

