-- Consult lifecycle: owner check-in after the call, no-show recovery, "starting soon" reminder, nudges.
-- Each column is a "sent once" stamp; crons claim a row by setting it, so nothing is emailed twice.
alter table consultations
  add column if not exists reminder_soon_sent_at timestamptz,  -- "starting soon" email to client
  add column if not exists owner_prompt_sent_at  timestamptz,  -- "how did it go?" email to Nicholas
  add column if not exists owner_nudge_sent_at   timestamptz,  -- second ask if Nicholas hasn't answered
  add column if not exists missed_sent_at        timestamptz,  -- "we missed you" email to a no-show client
  add column if not exists nudge_sent_at         timestamptz;  -- one gentle follow-up to the client

create index if not exists consultations_owner_prompt_idx
  on consultations (ends_at)
  where status = 'scheduled' and owner_prompt_sent_at is null;
