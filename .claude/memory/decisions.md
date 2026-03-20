# Key Decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-19 | Removed shadcn/tw-animate-css imports from globals.css | Tailwind v3 doesn't support @apply border-border (CSS var not defined as utility) |
| 2026-03-19 | Used inline styles for character colors instead of Tailwind color classes | Dynamic colors from constants can't use arbitrary Tailwind class names at build time |
| 2026-03-19 | scheduleAIResponses checks human first before processing AI | Prevents AIs from firing before human has had a chance to respond |
| 2026-03-19 | Game config stored in localStorage | No server needed; /game page reads and calls startGame() |
