# Supabase

`migrations/0001_init.sql` creates the full schema: config, service cities, clients, consultations (+photos), estimates (+items), jobs, reschedules, time blocks, working hours, feedback, row-level security, the private `consult-photos` bucket and an `admin_stats` view.

## Apply it

Option A, dashboard: Supabase project → SQL Editor → paste the file → Run.

Option B, CLI:
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

## Make Nick an admin

1. Auth → Users → add Nick's user (email + password).
2. SQL Editor:
```sql
insert into admin_users (user_id) values ('<nick-user-uuid>');
```

## Env vars

Copy URL, anon key and service-role key from Project Settings → API into `.env.local` (see `.env.example`). The service-role key is server only.

## Key design points

- Money is integer cents. Defaults (deposit, hourly rate, 24h cutoff, 90-day window) are rows in `app_config`.
- Double-booking is blocked by exclusion constraints on `jobs` (pending/confirmed) and `consultations` (scheduled). Cross-table conflicts and time blocks are checked in app code.
- An unpaid job holds its slot until `hold_expires_at`; a cleanup sets it to `expired`, which frees the slot.
- Reschedule edits the same job and logs to `job_reschedules`, so the paid deposit carries over.
- Public visitors have no direct table access except reading active cities. Booking goes through server routes using the service-role key.
