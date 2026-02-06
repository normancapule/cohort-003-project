# Ralph Cohort Playground — PRD

## Overview

A course platform built in TypeScript serving as the playground for the Ralph Cohort, a 6-day AI coding course. The platform is a mostly-complete ~20k line application that students use as a realistic codebase to practice AI coding agent techniques.

The app itself is a course platform where instructors create and manage courses, and students enroll, watch content, track progress, and complete quizzes. It has multiple user roles, rich business logic, and an interactive frontend — giving AI coding agents plenty to work with and plenty to get wrong.

## Stack

- **Runtime:** Node.js + TypeScript
- **Frontend:** React Router 7 (framework mode), Tailwind CSS
- **Database:** SQLite via Drizzle ORM
- **Testing:** Vitest
- **Package Manager:** pnpm
- **Validation:** Zod (deliberately chosen for later migration exercise to Valibot)

## User Roles

- **Student** — Browses courses, enrolls, watches lessons, tracks progress, takes quizzes
- **Instructor** — Creates and manages courses, modules, and lessons, views student progress
- **Admin** — Manages users, platform settings

Auth is kept simple — seeded users with a user switcher in the UI to avoid external auth provider dependencies. No real login flow. The goal is zero setup friction: `pnpm install && pnpm dev`.

## Data Model

### Core Tables

- **users** — id, name, email, role (enum: student/instructor/admin), avatar_url, created_at
- **courses** — id, title, slug, description, instructor_id, status (enum: draft/published/archived), cover_image_url, created_at, updated_at
- **modules** — id, course_id, title, position (for ordering), created_at
- **lessons** — id, module_id, title, content_markdown, video_url, position (for ordering), duration_minutes, created_at
- **enrollments** — id, user_id, course_id, enrolled_at, completed_at
- **lesson_progress** — id, user_id, lesson_id, status (enum: not_started/in_progress/completed), completed_at
- **quizzes** — id, lesson_id, title, passing_score
- **quiz_questions** — id, quiz_id, question_text, question_type (enum: multiple_choice/true_false), position
- **quiz_options** — id, question_id, option_text, is_correct
- **quiz_attempts** — id, user_id, quiz_id, score, passed, attempted_at
- **quiz_answers** — id, attempt_id, question_id, selected_option_id

### Seed Data

The database ships with realistic seed data: several instructors, a dozen courses across different topics, hundreds of lessons, enrolled students with partial progress, and quiz attempts. This gives the codebase enough data to feel real during exploration and makes the analytics feature (Feature B) immediately useful once built.

## Existing Features (Built on Main)

### Student Experience

- Course catalog with search and category filtering
- Course detail page showing modules, lessons, and progress
- Lesson viewer with markdown content rendering and video embed
- Progress tracking — lessons marked as complete, overall course percentage
- Quiz taking — multiple choice and true/false questions with immediate scoring
- Student dashboard showing enrolled courses and progress

### Instructor Experience

- Course creation and editing with markdown editor
- Module and lesson management with drag-and-drop reordering
- Quiz builder — add questions, options, set correct answers and passing scores
- Student roster per course showing enrollment and completion data

### Admin Experience

- User management — view and edit users, assign roles
- Course oversight — view all courses, change status

### Platform

- Responsive layout with Tailwind
- Breadcrumb navigation
- Toast notifications
- Error boundaries
- Dark mode toggle

## Unbuilt Features

### Feature A — Course Review & Rating System (Small)

**Used by:** 1.2 Build A Feature, 1.3 Plan/Execute/Clear Loop

A self-contained feature completable in a single context window.

**Scope:**

- New `reviews` table (id, user_id, course_id, rating 1-5, review_text, created_at)
- API routes for creating, reading, and deleting reviews
- Average rating display on course cards and course detail page
- Review list on course detail page
- Validation: one review per user per course, must be enrolled to review
- Star rating input component

### Feature B — Instructor Analytics Dashboard (Large)

**Used by:** 3.2 PRDs, 3.3 Multi-Phase Plans, 3.4 Tracer Bullets, 3.5 Multi-Phase Plan Skill

A substantial feature area requiring multi-phase planning across multiple context windows.

**Scope:**

- New `analytics_events` table for tracking student activity (lesson views, quiz attempts, enrollments, completions)
- Event collection layer — functions that log events from existing actions
- Dashboard page with multiple chart types (enrollment over time, completion rates, quiz performance distribution, lesson drop-off points)
- Filters: date range, course selector, module selector
- Aggregate queries: average completion time, most/least popular lessons, quiz pass rates
- Export to CSV
- Comparison view: compare metrics across courses
- Interactive charts (likely Recharts or Chart.js)
- Responsive table views for detailed data

This feature deliberately spans new DB tables, a data collection layer woven into existing code, multiple API endpoints, and a rich frontend section — forcing multi-phase planning.

### Feature C — Live Presence Indicators (Design-Ambiguous)

**Used by:** 6.4 Design It Twice

A feature with multiple genuinely valid implementation approaches.

**Scope:**

- Show which users are currently viewing a lesson or course
- Display active user avatars/count on lesson pages
- "X students are here now" indicator on course pages
- Instructor can see who's active across their courses
- Presence times out after inactivity

**Design tension:** WebSockets vs Server-Sent Events vs polling. Each has real trade-offs — WebSockets give bidirectional communication but add infrastructure complexity; SSE is simpler but one-directional; polling is simplest but least efficient. The exercise has the agent design it both ways before the student commits to an approach.

## Deliberate Warts (Built Into Main)

These are intentional quality issues baked into the codebase to support specific exercises.

### Enums Everywhere

The codebase uses TypeScript enums for status values, roles, question types, etc. This is a non-obvious convention that agents will want to replace with string literal unions. The AGENTS.md steering exercise (2.1) uses this as the thing to steer.

### Positional Parameter Functions

Several utility and service functions use positional parameters instead of options objects. Examples:

- `createLesson(moduleId, title, content, videoUrl, position, durationMinutes)`
- `enrollUser(userId, courseId, sendEmail, skipValidation)`
- `calculateProgress(userId, courseId, includeQuizzes, weightByDuration)`

The custom ESLint rule exercise (4.6) transforms these to named parameters.

### Legacy Module

One module (likely the quiz scoring/grading logic) is written in a messy, early-codebase style: duplicated logic, inconsistent error handling, some `any` types, no abstraction. Ripe for the refactoring exercise (6.5). Should look plausibly messy — like it was written under time pressure — not deliberately sabotaged.

### Test Gaps

Core business logic (enrollment, progress calculation) has tests. Quiz scoring, the legacy module, and several utility functions do not. The red-green-refactor branch (4.4) highlights one specific untested area.

## Technical Decisions

### Why React Router 7

Framework mode gives server-side rendering, loaders, actions, and nested routing. Enough architectural surface area to be interesting for codebase exploration without the complexity of Next.js App Router's server component model.

### Why SQLite + Drizzle

Zero external dependencies. No Docker needed for the database. `pnpm install && pnpm dev` just works. Drizzle gives type-safe queries and migrations without the weight of Prisma.

### Why Zod (for now)

Zod is used throughout for request validation and form schemas. This is deliberate — the Skill for Writing Skills exercise (2.3) involves writing a migration skill from Zod to Valibot.

### Why No Real Auth

Every cohort has setup issues. Auth providers (Clerk, Auth0, etc.) add environment variables, callback URLs, and account creation. A user switcher dropdown eliminates all of this. Students pick a user and go.

## Setup

```bash
git clone <repo>
pnpm install
pnpm db:seed
pnpm dev
```

No environment variables. No external services. No Docker. The database is a file.
