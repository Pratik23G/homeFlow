-- HomeFlow initial schema.
-- Money is stored in integer cents. All timestamps are timestamptz (UTC).
-- Public visitors never touch these tables directly: the Next.js server uses the
-- service-role key for booking requests. Only the owner (admin_users) can read/write via RLS.

create extension if not exists btree_gist;

-- ---------------------------------------------------------------- enums
create type client_status as enum ('lead', 'consulted', 'active', 'completed', 'declined');
create type consultation_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');
create type estimate_status as enum ('draft', 'sent', 'accepted', 'declined');
create type estimate_item_kind as enum ('labor', 'materials', 'other');
create type job_status as enum ('pending_deposit', 'confirmed', 'completed', 'cancelled', 'expired');
create type deposit_status as enum ('unpaid', 'paid', 'refunded', 'forfeited');
create type invoice_status as enum ('none', 'draft', 'open', 'paid', 'void', 'uncollectible');

-- ---------------------------------------------------------------- helpers
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- owner / auth
create table admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------- config
-- Editable business settings. Values are jsonb so numbers stay numbers.
create table app_config (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);
create trigger app_config_updated before update on app_config
  for each row execute function set_updated_at();

insert into app_config (key, value, description) values
  ('deposit_cents',           '8000',  'Deposit required to book a paid job'),
  ('hourly_rate_cents',       '8000',  'Default labor rate used on new estimates'),
  ('cancel_cutoff_hours',     '24',    'Cancel more than this many hours before start = deposit refunded'),
  ('booking_window_days',     '90',    'How far ahead clients can book'),
  ('consult_minutes',         '30',    'Length of the free video consult'),
  ('deposit_hold_minutes',    '30',    'Unpaid job holds its slot this long (Stripe Checkout session lifetime)'),
  ('google_reviews_url',      '""',    'Public Google review link'),
  ('yelp_reviews_url',        '""',    'Public Yelp review link');

-- ---------------------------------------------------------------- service area
create table service_cities (
  id bigint generated always as identity primary key,
  name text not null unique,
  zip_codes text[] not null default '{}',   -- optional; empty = city name match only
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into service_cities (name) values
  ('San Francisco'), ('Daly City'), ('Colma'), ('Brisbane'), ('South San Francisco'),
  ('San Bruno'), ('Millbrae'), ('Burlingame'), ('San Mateo'), ('Belmont'),
  ('San Carlos'), ('Redwood City'), ('Atherton'), ('Menlo Park'),
  ('East Palo Alto'), ('Palo Alto');

-- ---------------------------------------------------------------- clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  address text,
  city text,
  zip text,
  status client_status not null default 'lead',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index clients_email_key on clients (lower(email));
create index clients_status_idx on clients (status);
create trigger clients_updated before update on clients
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------- free consults
create table consultations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  description text not null,                 -- what the client wants fixed
  status consultation_status not null default 'scheduled',
  meet_url text,
  google_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- no two active consults may overlap
  exclude using gist (tstzrange(starts_at, ends_at) with &&) where (status = 'scheduled')
);
create index consultations_client_idx on consultations (client_id);
create index consultations_starts_idx on consultations (starts_at);
create trigger consultations_updated before update on consultations
  for each row execute function set_updated_at();

create table consultation_photos (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations (id) on delete cascade,
  storage_path text not null,                -- path inside the 'consult-photos' bucket
  created_at timestamptz not null default now()
);
create index consultation_photos_consult_idx on consultation_photos (consultation_id);

-- ---------------------------------------------------------------- estimates
create table estimates (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  consultation_id uuid references consultations (id) on delete set null,
  status estimate_status not null default 'draft',
  notes text,
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index estimates_client_idx on estimates (client_id);
create trigger estimates_updated before update on estimates
  for each row execute function set_updated_at();

create table estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references estimates (id) on delete cascade,
  kind estimate_item_kind not null,
  description text not null,
  quantity numeric(8,2) not null default 1,  -- hours for labor
  unit_cents integer not null,               -- rate per hour for labor
  amount_cents integer generated always as (round(quantity * unit_cents)::integer) stored,
  position integer not null default 0
);
create index estimate_items_estimate_idx on estimate_items (estimate_id);

-- ---------------------------------------------------------------- paid jobs
create table jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  estimate_id uuid references estimates (id) on delete set null,
  status job_status not null default 'pending_deposit',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- job-site address, validated against service_cities at booking
  address text not null,
  city text not null,
  zip text not null,
  -- deposit (Stripe Checkout)
  deposit_cents integer not null,
  deposit_status deposit_status not null default 'unpaid',
  hold_expires_at timestamptz,               -- unpaid holds release after this
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  stripe_refund_id text,
  -- final invoice (Stripe Invoicing); balance = invoice total - deposit
  invoice_status invoice_status not null default 'none',
  stripe_invoice_id text unique,
  -- calendar
  google_event_id text,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- a slot is held by unpaid-but-unexpired and confirmed jobs only
  exclude using gist (tstzrange(starts_at, ends_at) with &&)
    where (status in ('pending_deposit', 'confirmed'))
);
create index jobs_client_idx on jobs (client_id);
create index jobs_starts_idx on jobs (starts_at);
create index jobs_status_idx on jobs (status);
create trigger jobs_updated before update on jobs
  for each row execute function set_updated_at();

-- Reschedule keeps the same job (and its paid deposit), so the deposit carries over.
create table job_reschedules (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  old_starts_at timestamptz not null,
  old_ends_at timestamptz not null,
  new_starts_at timestamptz not null,
  new_ends_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index job_reschedules_job_idx on job_reschedules (job_id);

-- ---------------------------------------------------------------- owner availability
create table time_blocks (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- Recurring weekly working hours (0 = Sunday ... 6 = Saturday), in business local time.
create table working_hours (
  id bigint generated always as identity primary key,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);

insert into working_hours (weekday, start_time, end_time)
  select d, time '09:00', time '17:00' from generate_series(1, 6) d;

-- ---------------------------------------------------------------- feedback
create table feedback (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references jobs (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- row level security
alter table admin_users         enable row level security;
alter table app_config          enable row level security;
alter table service_cities      enable row level security;
alter table clients             enable row level security;
alter table consultations       enable row level security;
alter table consultation_photos enable row level security;
alter table estimates           enable row level security;
alter table estimate_items      enable row level security;
alter table jobs                enable row level security;
alter table job_reschedules     enable row level security;
alter table time_blocks         enable row level security;
alter table working_hours       enable row level security;
alter table feedback            enable row level security;

-- Owner: full access to everything.
do $$
declare t text;
begin
  foreach t in array array[
    'app_config','service_cities','clients','consultations','consultation_photos',
    'estimates','estimate_items','jobs','job_reschedules','time_blocks',
    'working_hours','feedback'
  ] loop
    execute format(
      'create policy "owner full access" on %I for all to authenticated
         using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

create policy "owner reads admin list" on admin_users
  for select to authenticated using (is_admin());

-- Public may read the active city list (used by the booking form).
create policy "public reads active cities" on service_cities
  for select to anon, authenticated using (active);

-- ---------------------------------------------------------------- storage
-- Private bucket; photos are read by the owner via signed URLs and written by the server.
insert into storage.buckets (id, name, public)
values ('consult-photos', 'consult-photos', false)
on conflict (id) do nothing;

create policy "owner reads consult photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'consult-photos' and is_admin());

-- ---------------------------------------------------------------- stats
create view admin_stats with (security_invoker = true) as
select
  (select count(*) from consultations where status = 'completed')                  as consults_completed,
  (select count(*) from clients where created_at >= now() - interval '30 days')     as new_clients_30d,
  (select count(*) from jobs where status = 'completed')                            as jobs_completed;
