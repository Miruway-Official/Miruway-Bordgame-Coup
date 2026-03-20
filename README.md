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

## Use Case Flow

### UC-1: Create & Join a Room

```
Player A (Host)                        Player B (Guest)
─────────────────────────────────────────────────────────
Open app
  → Click "เล่นออนไลน์"
  → Click "สร้างห้อง" (Create Room)
  → Room created, code shown (e.g. ABC123)
  → Share code with friends
                                         Open app
                                           → Click "เล่นออนไลน์"
                                           → Enter room code ABC123
                                           → Click "เข้าร่วม" (Join)
                                           → Appears in player list
Both players click "พร้อม" (Ready)
Host clicks "เริ่มเกม" (Start Game)
  → Game begins for all players
```

---

### UC-2: Taking a Turn

```
Active Player                          Other Players
─────────────────────────────────────────────────────────
Action panel appears
  → Select an action:
     • Income (+1 coin, no challenge)
     • Foreign Aid (+2 coins)
     • Coup (pay 7 coins, eliminate target)
     • Duke (Tax, +3 coins)
     • Assassin (pay 3 coins, eliminate target)
     • Captain (Steal 2 coins from target)
     • Ambassador (Exchange cards with deck)

  → If action requires a target:
       Select target player
                                        Response dialog appears:
                                          → Challenge (if action claims a character)
                                          → Block (if action is blockable)
                                          → Pass
```

---

### UC-3: Challenge Flow

```
Challenger                             Claimer (Actor)
─────────────────────────────────────────────────────────
Click "ท้าทาย" (Challenge)
                                        If HAS the card:
                                          → Reveal card ✓
                                          → Challenger loses 1 influence
                                          → Claimer gets new card from deck
                                          → Action resolves normally

                                        If does NOT have the card:
                                          → Reveal any card ✗
                                          → Claimer loses 1 influence
                                          → Action is cancelled
```

---

### UC-4: Block Flow

```
Blocker                                Actor
─────────────────────────────────────────────────────────
Click "บล็อก" (Block) with a character
  e.g. Block Steal with Captain
                                        Response dialog appears:
                                          → Challenge the block
                                          → Pass (accept the block)

  If Actor challenges the block:
    → Blocker reveals card
    → If blocker HAS the card:
         Actor loses 1 influence
         Block succeeds
    → If blocker does NOT have the card:
         Blocker loses 1 influence
         Original action resolves
```

---

### UC-5: Losing Influence

```
Player
───────────────────────────────────────
Lose influence trigger:
  • Lost a challenge
  • Was successfully assassinated / couped

Reveal dialog appears
  → Select which card to reveal (lose)
  → Card is flipped face-up (DEAD)
  → If both cards revealed → eliminated from game

Last player standing wins
```

---

### Character Ability Reference

| Character | Action | Blocked By |
|-----------|--------|------------|
| Duke | Tax (+3 coins) | — |
| Assassin | Assassinate (pay 3, eliminate) | Contessa |
| Captain | Steal (take 2 coins from target) | Captain, Ambassador |
| Ambassador | Exchange (swap cards with deck) | — |
| Contessa | — | Blocks Assassinate |
| — | Foreign Aid (+2 coins) | Duke |

---

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
