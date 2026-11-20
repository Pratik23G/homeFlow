-- Follow-up email after the free consult, and the project details form it links to.
alter table consultations add column if not exists followup_sent_at timestamptz;

create index if not exists consultations_followup_due_idx
  on consultations (ends_at)
  where followup_sent_at is null and status in ('scheduled', 'completed');

create table if not exists project_requests (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations (id) on delete cascade,
  address text not null,
  scope text not null,
  timing text,
  pay_method text check (pay_method in ('zelle', 'venmo', 'apple_pay')),
  created_at timestamptz not null default now()
);
create index if not exists project_requests_consult_idx on project_requests (consultation_id);

-- No policies: only the server (service role) reads or writes this table.
alter table project_requests enable row level security;
