# Emerging Edge School of Technology

A premium educational platform built with Next.js 15, featuring industry-focused training programs in Web Development, Flutter, AI, and emerging technologies.

## Tech Stack

- **Next.js 15** (App Router) with Server Components
- **TypeScript** for type safety
- **Tailwind CSS v4** with custom design system
- **Shadcn UI** components (Radix primitives)
- **Framer Motion** & **GSAP** for animations
- **React Hook Form** + **Zod** for form validation
- **SwiperJS** for carousels
- **Lenis** for smooth scrolling
- **React CountUp** for animated statistics

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
├── components/
│   ├── ui/           # Shadcn UI primitives
│   ├── layout/       # Navbar, Footer
│   ├── sections/     # Homepage sections
│   ├── forms/        # Form components
│   ├── shared/       # Reusable utilities
│   ├── seo/          # JSON-LD schemas
│   └── providers/    # Client providers
├── lib/
│   ├── api/          # Reusable API utilities
│   ├── data/         # Static content data
│   ├── seo/          # Metadata helpers
│   └── validations/  # Zod schemas
└── types/            # TypeScript interfaces
```

## Features

- Premium dark theme with orange accents and glassmorphism
- 14 homepage sections with smooth animations
- 10+ pages (About, Programs, Trainers, Admissions, Blog, Events, etc.)
- Enrollment API with JSON file storage
- Full SEO (metadata, Open Graph, JSON-LD schemas, sitemap, robots)
- WCAG accessibility compliant
- Mobile-first responsive design
- Dynamic imports for performance optimization

## Enrollment API

`POST /api/enrollment` accepts:

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "city": "New York",
  "program": "web-development",
  "level": "Foundations"
}
```

Submissions are stored in `data/enrollments.json`.

## Build

```bash
npm run build
npm start
```
