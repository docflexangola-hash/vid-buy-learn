# Admin Dashboard — Execution Plan

**Goal**: Add dashboard with metrics/charts, student profile viewing, and admin management.
**Pattern**: Follow existing code conventions (useState/useEffect, supabase client, inline components).
**Risk**: Existing admin.tsx is 731 lines — we'll keep new code in the same file to match patterns, but extract the dashboard into a separate component file if it grows large.

---

## Phase 1: Dashboard Tab with Metrics

### Task 1.1 — Create Dashboard component

- **File**: `src/routes/_authenticated/admin.tsx` (add `DashboardTab` component)
- Add as a new tab in the existing Tabs component
- **Done**: Tab appears, shows loading state, renders cards

### Task 1.2 — Implement metric cards

- 4 cards: Total Students, Active, Pending, Estimated Revenue
- Queries: `supabase.from("enrollments").select("*")` then compute counts in JS
- Revenue = activeCount \* COURSE.priceNumber
- **Done**: Cards show correct numbers from DB

### Task 1.3 — Implement enrollment chart (AreaChart via Recharts)

- Query enrollments grouped by date (last 30 days)
- `supabase.rpc` or client-side group by
- Render `<AreaChart>` from Recharts
- **Done**: Chart shows enrollment trend

### Task 1.4 — Implement lesson progress chart (BarChart)

- For each lesson, count how many active students have completed it
- Query `lesson_progress` joined with `lessons`, group by lesson_id
- Render `<BarChart>`
- **Done**: Chart shows completion per lesson

### Task 1.5 — Implement recent activity feed

- UNION ALL (or 3 separate queries) for: enrollments, certificate_requests, lesson_comments
- Order by created_at DESC, limit 10
- **Done**: Feed shows recent activity

---

## Phase 2: Student Profile Dialog

### Task 2.1 — Create StudentProfileDialog component

- File: `src/routes/_authenticated/admin.tsx`
- Dialog triggered by clicking a student name in the Alunos tab
- Shows: name, email, WhatsApp, created_at, enrollment status

### Task 2.2 — Add lesson progress to profile

- Query `lesson_progress` for the student's user_id
- Show completed vs total lessons, list which ones are done
- **Done**: Progress visible in dialog

### Task 2.3 — Add quiz attempts, comments, certificate status

- Query `quiz_attempts`, `lesson_comments`, `certificate_requests` for the student
- Display each section
- **Done**: Full student profile visible

---

## Phase 3: Admin Management Tab

### Task 3.1 — Create Admins tab

- File: `src/routes/_authenticated/admin.tsx`
- List current admins from `user_roles WHERE role = 'admin'`
- Fetch profiles for each admin user (name, email)

### Task 3.2 — Add "add admin" functionality

- Input for email, lookup user in `profiles` table
- Insert into `user_roles` with role='admin'
- Show error if user not found
- **Done**: Can add admin by email

### Task 3.3 — Add "remove admin" functionality

- Delete from `user_roles` (with confirmation)
- Cannot remove yourself
- **Done**: Can remove admin

---

## Phase 4: Polish & Review

### Task 4.1 — Review and test

- Check all tabs still work
- Verify admin check still works
- Test responsive layout
- **Done**: Everything verified

---

## Effort Summary

| Task                              | Effort | Type   |
| --------------------------------- | ------ | ------ |
| 1.1 Dashboard component shell     | 30min  | New    |
| 1.2 Metric cards                  | 30min  | New    |
| 1.3 Enrollment chart              | 45min  | New    |
| 1.4 Lesson progress chart         | 30min  | New    |
| 1.5 Activity feed                 | 30min  | New    |
| 2.1 Student profile dialog        | 45min  | New    |
| 2.2 Progress in profile           | 30min  | New    |
| 2.3 Quiz/comments/cert in profile | 30min  | New    |
| 3.1 Admins list                   | 20min  | New    |
| 3.2 Add admin                     | 30min  | New    |
| 3.3 Remove admin                  | 15min  | New    |
| 4.1 Review & polish               | 30min  | Review |

**Total**: ~6.5 hours
