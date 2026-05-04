# EduHub Project Report

## Overview
**EduHub Connect** is an advanced academic management platform designed to streamline interactions between students and lecturers. It acts as a centralized hub for managing day-to-day academic activities that go beyond standard learning management systems, focusing on real-time engagement, attendance tracking, and peer collaboration.

## Tech Stack
The project is built using a modern, scalable web development stack:
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4 with Lucide React icons
- **Database & ORM:** PostgreSQL managed via Prisma
- **Authentication & Backend:** Supabase (using `@supabase/ssr` and `@supabase/supabase-js`)
- **Language:** TypeScript

## Core Features

### 1. Lab Attendance Tracking
A system for lecturers to generate active lab sessions with unique codes. Students can log in and enter the code to mark their attendance. The dashboard provides visual feedback on attendance risk (e.g., warning students if they drop below a required 75% threshold).

### 2. Office Hours Queue Management
Replaces traditional "first-come, first-served" waiting outside an office. 
- **Lecturers** can open an active office hours queue.
- **Students** can join the queue remotely with a specific topic, see how many people are ahead of them, and track their status (WAITING, ACTIVE, COMPLETED, CANCELLED).

### 3. Study Group Matching
A peer-to-peer collaboration tool where students can toggle their matching status to find peers in their specific modules. It displays upcoming meets, the course context, and allows for shared notes and group tracking.

### 4. Anonymous Course Evaluations
A feedback mechanism allowing students to submit anonymous ratings and feedback for their courses, providing lecturers with actionable insights without compromising student privacy.

## Data Models (Database Architecture)
The application relies on a relational database structured via Prisma. The core models include:

- **User:** Represents both `STUDENT` and `LECTURER` roles. Stores email, name, avatar, and relation to their respective activities.
- **LabSession:** Created by a Lecturer for a specific course. Contains a unique `code`, an `active` boolean, and an `expiresAt` timestamp to prevent late check-ins.
- **Attendance:** A junction table linking a Student to a LabSession, ensuring a student can only be marked present once per session.
- **OfficeHourQueue:** Tracks a student's position in a lecturer's queue, including the `topic` of discussion and their current `status`.
- **StudyGroup:** Manages peer groups, tracking the course, title, tags, and member count.
- **Evaluation:** Stores anonymous feedback, linking a course to a rating and textual feedback.

## User Roles & Dashboards

### Student Dashboard
- High-priority alerts (e.g., room changes).
- A widget displaying current attendance risk via a donut chart.
- A live view of available lecturer office hours and their queue status.
- A study group widget showing upcoming peer meetings.

### Lecturer Dashboard
- Tools to create and manage active `LabSessions`.
- An interface to manage the `OfficeHourQueue`, admitting students one by one.
- Access to view aggregated `Evaluations` and attendance records.
