-- Migration 002: Add hourly booking type
-- Run in Supabase dashboard > SQL Editor

-- Add 'hourly' to the booking_slot enum
alter type booking_slot add value if not exists 'hourly';

-- Add hours column for hourly bookings
alter table training_room_bookings
  add column if not exists hours int;
