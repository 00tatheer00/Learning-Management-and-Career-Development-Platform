# Emerging Edge School Portal — Comprehensive Project Overview

Welcome to the **Emerging Edge School Portal** (Learning Management & Career Development Platform). This document provides a complete high-level and detailed breakdown of the platform's architecture, user roles, database schema, portals, features, integrations, and deployment setup.

---

## 🚀 1. Project Summary & Purpose

**Emerging Edge School of Technology** is an end-to-end Learning Management System (LMS) and career development portal designed to handle the complete educational lifecycle:
- **Prospective Students**: Browse courses, register, and submit payment proofs for verification.
- **Enrolled Students**: Access course materials, watch streamed video lessons, track live interactive sessions, submit assignments, and manage profiles.
- **Trainers / Instructors**: Scope by assigned program/batch, upload learning resources, schedule live sessions, publish assignments, and grade student submissions.
- **Administrators**: Review enrollment applications (approve/reject), manage users and roles, monitor statistics, and handle WhatsApp messaging fallback.

---

## 🛠️ 2. Technology Stack & Infrastructure

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions, API routes)
- **Frontend Core**: React 19, TypeScript, Tailwind CSS v4, Framer Motion, Radix UI primitives, Lucide / Phosphor Icons
- **Database & ORM**: MongoDB Atlas + Prisma ORM (`@prisma/client`)
- **Authentication**: NextAuth.js (Credentials Provider with role-based JWT sessions)
- **Media & Storage**:
  - **Cloudinary**: Payment proof screenshots & static asset uploads
  - **Bunny.net**: High-speed video streaming via `tus-js-client`
- **Communication & Notifications**:
  - **Resend**: Transactional emails (enrollment receipts, account updates)
  - **Meta WhatsApp Cloud API / UltraMsg**: Student notifications & admin chat webhook
- **Testing & Quality Assurance**: Vitest, ESLint, TypeScript compiler
- **Deployment**: Vercel production hosting with GitHub Actions CI/CD workflow

---

## 👥 3. User Roles & Security

The platform enforces strict Role-Based Access Control (RBAC) across API routes and portal pages:

| Role | Scope & Permissions |
| :--- | :--- |
| `student` | Restricted to enrolled program, level, and batch. Access to student dashboard, course materials, assignments submission, live classes, and personal profile. |
| `trainer` | Restricted to assigned program modules and batches. Ability to create assignments, upload materials, schedule live sessions, and grade submissions. |
| `admin` | Full system administration, managing users, reviewing and approving/rejecting student enrollments. |
| `admin_readonly` | View-only administrative access for monitoring and analytics without mutation privileges. |

---

## 🌐 4. Core Portals & Application Flow

### A. Public & Marketing Portal (`/`, `/courses`, `/enrollment`)
- **Course Showcase**: Highlighting available technology bootcamps and summer courses.
- **Enrollment Form**: Multipart form capturing student details, program choice, and payment screenshot upload via Cloudinary.

### B. Student Portal (`/student`)
- **Dashboard**: Overview of upcoming classes, pending assignments, and course progress.
- **Materials (`/student/materials`)**: Scoped learning documents, links, and video playback via Bunny.net.
- **Assignments (`/student/assignments`)**: Detailed assignment briefs, file submission interface, and trainer grade/feedback viewing.
- **Live Sessions (`/student/classes`)**: Class schedules, meeting links (Jitsi/Google Meet), and recording links.
- **Profile (`/student/profile`)**: Personal details, program assignment status, and credentials management.

### C. Trainer Portal (`/trainer`)
- **Trainer Dashboard**: Module selection, active batch switching, and class metrics.
- **Course Content Management**: Publish course materials (documents, links, videos).
- **Assignment Management & Grading**: Create new assignments, set deadlines, review submitted work, assign grades, and leave feedback.
- **Live Class Scheduling**: Create live session schedules and meeting URLs.

### D. Admin Portal (`/admin`)
- **Enrollment Verification (`/admin/enrollments`)**: Review incoming student registrations and payment screenshots; approve or reject with automated email/WhatsApp notifications.
- **User Management (`/admin/users`)**: Create, update, or reassign user roles, batches, and programs.
- **System Metrics**: Visual overview of student enrollment totals, active trainers, and course metrics.

---

## 🗄️ 5. Database Architecture (`prisma/schema.prisma`)

Key MongoDB models managed via Prisma:
- **`User`**: Core account model containing email, password digest, full name, role, `programSlug`, `level`, and `batch`.
- **`Enrollment`**: Registrations awaiting or past verification with payment screenshot URLs and verification status (`PENDING`, `APPROVED`, `REJECTED`).
- **`Assignment`**: Trainer-created coursework linked to program/level with deadlines and total points.
- **`AssignmentSubmission`**: Student submissions containing links/files, submission timestamp, grade, and trainer feedback.
- **`CourseMaterial`**: Scoped learning items (videos, PDFs, external resources).
- **`LiveSession`**: Scheduled classes with start times, end times, and meeting URLs.
- **`PasswordResetToken`**: Secure tokens for password reset workflows.

---

## ⚡ 6. Quick Start & Local Development

1. **Environment Setup**:
   ```bash
   cp .env.example .env.local
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Database Sync & Seed**:
   ```bash
   npm run db:push
   npm run db:seed
   ```
4. **Launch Local Server**:
   ```bash
   npm run dev
   ```
   Server runs on [http://localhost:3000](http://localhost:3000).

---

## 🚢 7. CI/CD & Deployment Workflow

- **CI/CD Pipeline**: GitHub Actions (`.github/workflows/ci-cd.yml`) automatically runs linting (`npm run lint`), tests (`npm run test`), and builds on every pull request and push to `main`.
- **Production Deployment**: On merge to `main`, tests run and the application deploys automatically to **Vercel Production**.

---

*This document was generated for quick reference on the project's structure, architecture, and technology capabilities.*
