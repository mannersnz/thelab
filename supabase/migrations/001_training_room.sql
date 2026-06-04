-- Training Room Bookings
-- Run this in Supabase dashboard > SQL Editor

-- Enum for slot types
do $$ begin
  create type booking_slot as enum ('half_am', 'half_pm', 'full_day');
exception when duplicate_object then null; end $$;

-- Enum for booking status
do $$ begin
  create type booking_status as enum ('available', 'enquiry', 'confirmed', 'blocked');
exception when duplicate_object then null; end $$;

-- Main bookings table (no unique constraint — multiple enquiries per slot are allowed)
create table if not exists training_room_bookings (
  id                uuid primary key default gen_random_uuid(),
  date              date not null,
  slot              booking_slot not null,
  status            booking_status not null default 'enquiry',
  -- enquirer details
  enquirer_name     text,
  enquirer_email    text,
  enquirer_org      text,
  enquirer_phone    text,
  enquirer_message  text,
  attendee_count    int,
  -- admin
  admin_notes       text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Index for calendar range queries
create index if not exists idx_training_bookings_date on training_room_bookings (date);

-- Updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists training_room_bookings_updated_at on training_room_bookings;
create trigger training_room_bookings_updated_at
  before update on training_room_bookings
  for each row execute function set_updated_at();

-- RLS
alter table training_room_bookings enable row level security;

-- Public: read date + slot + status only (availability check)
drop policy if exists "public read availability" on training_room_bookings;
create policy "public read availability"
  on training_room_bookings for select
  using (true);

-- Public: insert own enquiry
drop policy if exists "public insert enquiry" on training_room_bookings;
create policy "public insert enquiry"
  on training_room_bookings for insert
  with check (status = 'enquiry');

-- Admin (authenticated): full access
drop policy if exists "admin full access" on training_room_bookings;
create policy "admin full access"
  on training_room_bookings for all
  using (auth.role() = 'authenticated');
