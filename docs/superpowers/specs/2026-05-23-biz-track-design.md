# Biz Track — Design Spec

**Date:** 2026-05-23  
**Project:** Business tracking web app for a freelance photographer  
**Status:** Approved

---

## Overview

A local-only web app for tracking business income, expenses, mileage, and generating yearly tax/financial summaries. Runs in Docker as a single container. Designed for a single user (freelance photographer).

---

## Architecture & Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | SQLite via Drizzle ORM, persisted via Docker volume |
| Auth | Better-Auth (runs inside Next.js, sessions stored in SQLite) |
| UI | Tailwind CSS + shadcn/ui |
| Mileage — geocoding | OpenStreetMap Nominatim (address autocomplete) |
| Mileage — routing | OSRM public API (driving distance calculation) |
| Recurring jobs | node-cron (runs inside the container, fires daily at midnight) |
| Deployment | Docker + docker-compose (`docker compose up`) |

The app runs as a single `npm start` process inside a Docker container. The SQLite file is mounted via a Docker volume so data persists across container restarts and rebuilds. Better-Auth is an npm library — no second service, no external auth server required.

---

## Data Model

### `users`
Standard Better-Auth user table extended with:
- `home_address` — default origin for mileage calculations
- `default_mileage_rate` — IRS rate (e.g., 0.67), used in tax deduction estimates

### `categories`
Shared table for income and expense categories.
- `type`: `income` | `expense`
- `irs_line`: Schedule C line identifier for tax grouping (nullable for income categories)
- `user_id`: null for built-in defaults; non-null for user-created custom categories

**Default expense categories** (Schedule C aligned):
Advertising, Equipment, Insurance, Professional Services, Rent/Lease, Supplies, Travel, Utilities, Meals, Other

> Meals transactions are stored at full value. The tax summary applies the IRS 50% deductibility factor when calculating the Schedule C line total for Meals.

**Default income categories:**
Photography Services, Licensing/Royalties, Other Income

### `transactions`
Single table for both income and expenses.
- `date`, `type` (`income` | `expense`), `amount`, `description`, `category_id`, `notes`
- `recurrence_id` — foreign key to `recurrence_rules`, null for one-off entries

### `recurrence_rules`
Defines the schedule for recurring transactions.
- `frequency`: `daily` | `weekly` | `monthly` | `yearly`
- `is_subscription`: if true, node-cron auto-generates entries on schedule; if false, user manually logs each occurrence
- `next_run_at`: date of the next auto-generation run
- `is_active`: boolean toggle
- `end_date`: optional, rule deactivates automatically when passed
- Template fields (amount, description, category_id, type) copied into each generated transaction

### `trips`
- `date`, `origin_address`, `destination_address`, `one_way_miles`, `purpose`, `notes`
- Round-trip miles = `one_way_miles × 2`, computed at display/export time (not stored)

### `csv_import_templates`
- `name`, `import_type` (`income` | `expense` | `trip`)
- `column_mappings`: JSON object mapping user's CSV column headers to app field names

---

## Pages & Navigation

A persistent sidebar provides navigation across all sections.

### Dashboard (`/`)
Yearly overview, defaults to current year (year selectable via dropdown).
- Summary cards: total income, total expenses, net profit/loss
- Total miles driven + estimated IRS deduction (miles × mileage rate)
- Month-by-month bar chart: income vs expenses
- Expense breakdown by category (table with percentages)
- Tax summary: Schedule C line totals grouped by `irs_line`

### Transactions (`/transactions`)
- Unified list of income and expenses
- Filterable by type (income/expense), category, date range
- Inline edit and delete
- Add income / Add expense buttons open forms

### Recurring (`/recurring`)
- List of all recurrence rules with next scheduled date, frequency, amount
- "Auto" badge on subscription entries; "Manual" badge on manually-logged recurring entries
- Toggle active/inactive per rule
- Manual recurring entries where `next_run_at <= today` show a "Log now" button; clicking it opens the add-transaction form pre-filled with the rule's template values

### Trips (`/trips`)
- List of all trips: date, origin, destination, round-trip miles, purpose
- Add trip form:
  - Destination address with Nominatim autocomplete
  - Origin defaults to user's home address (editable per trip)
  - On submit: calls OSRM to calculate one-way distance, stores result
  - Manual miles fallback if OSRM is unreachable

### Import (`/import`)
- Upload CSV file
- Preview first 5 rows with detected column headers
- Column mapping UI: map each CSV column to an app field
- Template selector at top: apply a saved mapping to skip re-mapping
- Option to save current mapping as a named template before importing
- Import runs row-by-row validation; skips invalid rows
- Results summary shown after import: X imported, Y skipped (with skipped rows listed)

### Export (`/export`)
- Select date range
- Select data types: transactions, trips, or both
- Download as CSV — transactions export as a flat file with columns: date, type, amount, category, description, notes; trips export with columns: date, origin, destination, one_way_miles, round_trip_miles, purpose, notes. If both are selected, two separate CSV files are downloaded.

### Settings (`/settings`)
- User profile: name, home address, default mileage rate
- Category management: view defaults (read-only), add/edit/delete custom categories
- Password change form

---

## Key Workflows

### Adding a Trip
1. User enters destination → Nominatim autocomplete (debounced 500ms) suggests addresses
2. Origin pre-filled from profile home address; user can override
3. On submit → OSRM call with both addresses → stores one-way miles
4. All displays and exports show round-trip miles (`one_way_miles × 2`)
5. If OSRM fails: inline error shown, manual miles input appears as fallback

### Recurring Subscription Auto-Generation
- node-cron fires at midnight daily
- Queries all active rules where `is_subscription = true` and `next_run_at <= today`
- For each match: inserts transaction from rule template, advances `next_run_at` by frequency interval
- If `end_date` has passed: marks rule inactive
- Insert and `next_run_at` update happen in a single transaction to prevent duplicate entries on container restarts

### CSV Import
1. Upload → parse headers → preview first 5 rows
2. User maps CSV columns to app fields
3. Optionally name and save mapping as a template
4. Click Import → validate each row → insert valid rows → skip invalid
5. Show results: count imported, count skipped, list of skipped rows for review

### Yearly Tax Summary
- Aggregates all expense transactions for selected year
- Groups by `irs_line` from category → totals per Schedule C line
- Mileage deduction = total round-trip miles × `default_mileage_rate`
- Read-only display — no tax filing functionality

---

## Error Handling & Edge Cases

| Scenario | Behavior |
|---|---|
| OSRM unavailable | Inline error on trip form; manual miles input appears as fallback |
| Nominatim rate limited | 500ms debounce; graceful degradation to free-text address input |
| CSV import row invalid | Row skipped (not failed); summary lists skipped rows after import |
| Duplicate cron run | `next_run_at` updated atomically with insert; second run finds date already advanced, skips |
| Delete category with transactions | Blocked; user prompted to reassign transactions to another category first |
| Password reset | Change-password form in Settings only; no email reset flow needed (local-only app) |

---

## Docker Setup

- `Dockerfile`: builds the Next.js app, runs `npm start`
- `docker-compose.yml`: single service, maps port 3000, mounts a named volume for the SQLite file (e.g., `./data:/app/data`)
- Environment variables (`.env`): `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- Database migrations run automatically on container start via a Drizzle migrate script in the entrypoint
