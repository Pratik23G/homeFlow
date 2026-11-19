-- Reminder emails for free consults: set once the reminder goes out, so each client gets exactly one.
alter table consultations add column if not exists reminder_sent_at timestamptz;

create index if not exists consultations_reminder_due_idx
  on consultations (starts_at)
  where status = 'scheduled' and reminder_sent_at is null;
