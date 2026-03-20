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

## กระบวนการใช้งาน (Use Case Flow)

### UC-1: สร้างห้องและเข้าร่วมเกม

```
ผู้เล่น A (เจ้าของห้อง)                 ผู้เล่น B (แขก)
─────────────────────────────────────────────────────────
เปิดแอป
  → กดปุ่ม "เล่นออนไลน์"
  → กด "สร้างห้อง"
  → ได้รับรหัสห้อง (เช่น ABC123)
  → แชร์รหัสให้เพื่อน
                                         เปิดแอป
                                           → กดปุ่ม "เล่นออนไลน์"
                                           → กรอกรหัสห้อง ABC123
                                           → กด "เข้าร่วม"
                                           → ชื่อปรากฏในรายชื่อผู้เล่น
ทุกคนกด "พร้อม"
เจ้าของห้องกด "เริ่มเกม"
  → เกมเริ่มต้นสำหรับทุกคน
```

---

### UC-2: การเล่นในตาของตัวเอง

```
ผู้เล่นที่ถึงตา                          ผู้เล่นคนอื่น
─────────────────────────────────────────────────────────
แผงเลือกการกระทำปรากฏขึ้น
  → เลือกการกระทำ:
     • รายได้ — รับ 1 เหรียญ (ท้าทายไม่ได้)
     • ความช่วยเหลือต่างชาติ — รับ 2 เหรียญ
     • รัฐประหาร — จ่าย 7 เหรียญ กำจัดเป้าหมาย
     • ดยุค — เก็บภาษี รับ 3 เหรียญ
     • นักฆ่า — จ่าย 3 เหรียญ ลอบสังหารเป้าหมาย
     • กัปตัน — ขโมย 2 เหรียญจากเป้าหมาย
     • ทูต — แลกเปลี่ยนไพ่กับกอง

  → หากการกระทำต้องการเป้าหมาย:
       เลือกผู้เล่นที่ต้องการ
                                         กล่องตอบสนองปรากฏขึ้น:
                                           → ท้าทาย (ถ้าผู้เล่นอ้างตัวละคร)
                                           → บล็อก (ถ้าการกระทำบล็อกได้)
                                           → ผ่าน
```

---

### UC-3: กระบวนการท้าทาย

```
ผู้ท้าทาย                               ผู้ถูกท้าทาย
─────────────────────────────────────────────────────────
กด "ท้าทาย"
                                         ถ้า มีไพ่จริง:
                                           → เปิดไพ่ให้ดู ✓
                                           → ผู้ท้าทายเสียอิทธิพล 1 ใบ
                                           → ผู้ถูกท้าทายจั่วไพ่ใหม่
                                           → การกระทำดำเนินต่อตามปกติ

                                         ถ้า ไม่มีไพ่ (โกหก):
                                           → เปิดไพ่ใดก็ได้ ✗
                                           → ผู้ถูกท้าทายเสียอิทธิพล 1 ใบ
                                           → การกระทำถูกยกเลิก
```

---

### UC-4: กระบวนการบล็อก

```
ผู้บล็อก                                ผู้กระทำ
─────────────────────────────────────────────────────────
กด "บล็อก" โดยใช้ตัวละคร
  เช่น บล็อกการขโมยด้วยกัปตัน
                                         กล่องตอบสนองปรากฏขึ้น:
                                           → ท้าทายการบล็อก
                                           → ผ่าน (ยอมรับการบล็อก)

  ถ้าผู้กระทำท้าทายการบล็อก:
    → ผู้บล็อกเปิดไพ่
    → ถ้า มีไพ่จริง:
         ผู้กระทำเสียอิทธิพล 1 ใบ
         การบล็อกสำเร็จ
    → ถ้า ไม่มีไพ่ (โกหก):
         ผู้บล็อกเสียอิทธิพล 1 ใบ
         การกระทำดำเนินต่อตามปกติ
```

---

### UC-5: การเสียอิทธิพล

```
ผู้เล่น
───────────────────────────────────────
เงื่อนไขที่ทำให้เสียอิทธิพล:
  • แพ้การท้าทาย
  • ถูกลอบสังหารหรือถูกรัฐประหารสำเร็จ

กล่องเปิดไพ่ปรากฏขึ้น
  → เลือกไพ่ที่จะเปิดเผย (เสีย)
  → ไพ่ถูกพลิกหน้าขึ้น (ตาย)
  → ถ้าไพ่ทั้ง 2 ใบถูกเปิด → ถูกคัดออกจากเกม

ผู้เล่นสุดท้ายที่เหลืออยู่คือผู้ชนะ
```

---

### ตารางความสามารถของตัวละคร

| ตัวละคร | ความสามารถ | ถูกบล็อกโดย |
|---------|-----------|------------|
| ดยุค | เก็บภาษี (+3 เหรียญ) | — |
| นักฆ่า | ลอบสังหาร (จ่าย 3 เหรียญ กำจัดเป้าหมาย) | คอนเทสซา |
| กัปตัน | ขโมย (เอา 2 เหรียญจากเป้าหมาย) | กัปตัน, ทูต |
| ทูต | แลกเปลี่ยนไพ่กับกอง | — |
| คอนเทสซา | — | บล็อกการลอบสังหาร |
| — | ความช่วยเหลือต่างชาติ (+2 เหรียญ) | ดยุค |

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
