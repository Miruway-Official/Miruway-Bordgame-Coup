# Coup — Online Multiplayer

A digital adaptation of the Coup card game with online multiplayer, built with Next.js 14.

## About

Coup is a bluffing card game for 2–6 players. Players take turns using character abilities — whether they have the card or not. Challenge others when you think they're bluffing, or be challenged yourself. The last player with influence wins.

**Characters:** Duke · Assassin · Captain · Ambassador · Contessa

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Backend | Supabase Realtime |
| Runtime | Bun |

## Getting Started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

Run `supabase/schema.sql` in your Supabase SQL editor to create the required tables and RLS policies.

## How to Play

1. Go to **เล่นออนไลน์** (Play Online) on the home screen
2. Create a room or join with a room code
3. Wait for all players to ready up
4. The host starts the game

## Project Structure

```
src/
├── app/              # Next.js pages
├── components/game/  # Game UI components
├── lib/
│   ├── engine/       # Game state machine
│   └── ai/           # AI controller (unused in online mode)
└── stores/           # Zustand stores
supabase/
└── schema.sql        # Database schema
```
