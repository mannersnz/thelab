# Calendar Availability Clarity — Design

**Date:** 2026-06-08
**Status:** Approved

## Problem

The training-room calendar does not make it clear when the room is available or
where bookings have been made. Two root causes:

1. **Faint colors.** "Available" is rendered as a barely-visible cyan tint that
   reads as decorative rather than meaningful.
2. **Blank days.** Availability is fed to FullCalendar as background *events*,
   which only exist for days that have a database record. Genuinely-free days
   with no record render as blank cells, so the calendar is a patchwork of
   tinted and untinted days with no consistent signal.

This affects both the public `AvailabilityCalendar` and the admin `AdminCalendar`.

## Solution

Every bookable day explicitly declares its status with a colored fill and a
corner label.

### 1. Day-cell treatment (Option A — whole-day status)

- Future days render with a colored fill plus a small bottom-right label:
  - **Free** — green
  - **Part** — amber (one half-day or otherwise partially booked)
  - **Full** — red (whole day taken)
- Days with no booking record default to **Free** — no more blank cells.
- Past days stay dimmed with no label (existing `.fc-day-past`).
- Today keeps its cyan outline / accented number (existing behaviour).
- The grid shows **whole-day status only**. A customer who clicks a "Part" day
  sees the available slot(s) in the enquiry form — the grid stays simple, the
  form carries the detail.

### 2. Rendering approach (the core technical change)

Replace the background-events approach in both calendars with FullCalendar's
per-cell hooks, which run for **every** rendered day cell (not just recorded
ones):

- `dayCellClassNames(arg)` — returns the status color class
  (`fc-day-free` / `fc-day-part` / `fc-day-full`) for future dates, defaulting
  to free when there is no record. Returns nothing for past dates.
- `dayCellContent(arg)` — renders the day number plus the status label span for
  future dates; just the number for past dates.

Because these hooks run per cell, full coverage (including default-to-free) is
automatic and the blank-day problem disappears.

### 3. Shared status mapping (single source of truth)

Add a mapping helper next to `getDayStatus` in `types.ts`:

```ts
export const DAY_STATUS_META: Record<
  'available' | 'partial' | 'full',
  { className: string; label: string }
> = {
  available: { className: 'fc-day-free', label: 'Free' },
  partial:   { className: 'fc-day-part', label: 'Part' },
  full:      { className: 'fc-day-full', label: 'Full' },
}
```

Both calendars compute `getDayStatus(availability[dateStr])` for dates `>= today`
and look up `DAY_STATUS_META` — keeping the two calendars identical with one
source of truth. `getDayStatus` already returns `available` for an undefined day,
so the default-to-free behaviour falls out naturally.

### 4. Applied to both calendars

- Public `AvailabilityCalendar` and admin `AdminCalendar` share the cell
  treatment.
- Both show a matching green / amber / red legend (Free / Partly booked /
  Fully booked). The admin calendar gains this legend for consistency.

### 5. CSS (`training-room.css`)

- Recolor available from cyan → green.
- Define `.fc-day-free` / `.fc-day-part` / `.fc-day-full` fills + borders.
- Style the corner status label.
- Update the legend swatches to green / amber / red.

## Files touched

- `src/app/training-room/types.ts` — add `DAY_STATUS_META`.
- `src/app/training-room/components/AvailabilityCalendar.tsx` — switch to
  `dayCellClassNames` + `dayCellContent`; update legend.
- `src/app/training-room/admin/components/AdminCalendar.tsx` — same cell
  treatment; add legend.
- `src/app/training-room/training-room.css` — colors, cell classes, label,
  legend swatches.

## Out of scope

- AM/PM split display on the grid (whole-day status is sufficient).
- Any database, API, or booking-logic changes.

## Verification

This is a purely visual FullCalendar rendering change and there is no existing
test setup in the project. Verify by running the dev server and confirming, on
both the public and admin calendars:

- Open future days with no record show **Free** (green).
- A partially-booked day shows **Part** (amber); a fully-booked day shows
  **Full** (red).
- Past days are dimmed with no label; today retains its cyan outline.
- The legend matches the cell colors.
