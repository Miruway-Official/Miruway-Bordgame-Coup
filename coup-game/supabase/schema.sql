-- ============================================================
-- Coup Board Game Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Rooms table
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,           -- 6-char join code e.g. "ALPHA7"
  host_player_id text not null,
  status text not null default 'waiting', -- 'waiting' | 'playing' | 'finished'
  max_players int not null default 4,
  created_at timestamptz default now()
);

-- Room players
create table if not exists room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms on delete cascade,
  player_id text not null,             -- client UUID from localStorage
  player_name text not null,
  seat_index int not null,
  is_ready boolean default false,
  joined_at timestamptz default now(),
  unique(room_id, player_id),
  unique(room_id, seat_index)
);

-- ============================================================
-- Row Level Security
-- NOTE: "using (true)" only covers SELECT/DELETE.
--       INSERT/UPDATE require "with check (true)" explicitly.
-- ============================================================
alter table rooms enable row level security;
alter table room_players enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow all" on rooms;
drop policy if exists "Allow all" on room_players;

-- Separate policies for each operation so with check is explicit
create policy "rooms_select" on rooms for select to anon, authenticated using (true);
create policy "rooms_insert" on rooms for insert to anon, authenticated with check (true);
create policy "rooms_update" on rooms for update to anon, authenticated using (true) with check (true);
create policy "rooms_delete" on rooms for delete to anon, authenticated using (true);

create policy "room_players_select" on room_players for select to anon, authenticated using (true);
create policy "room_players_insert" on room_players for insert to anon, authenticated with check (true);
create policy "room_players_update" on room_players for update to anon, authenticated using (true) with check (true);
create policy "room_players_delete" on room_players for delete to anon, authenticated using (true);

-- ============================================================
-- Table-level grants (required in addition to RLS policies)
-- Postgres has two separate permission layers:
--   1. GRANT  → controls who can touch the table at all
--   2. RLS    → filters which rows they can see/modify
-- Without GRANT, RLS policies are never even evaluated.
-- ============================================================
grant select, insert, update, delete on rooms to anon, authenticated;
grant select, insert, update, delete on room_players to anon, authenticated;

-- ============================================================
-- Realtime
-- ============================================================
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table room_players;
