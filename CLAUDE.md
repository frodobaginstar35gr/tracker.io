# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint

# Prisma
npx prisma migrate dev --name <name>   # Create and apply a new migration
npx prisma migrate deploy              # Apply pending migrations
npx prisma studio                      # Open Prisma Studio GUI
npx prisma generate                    # Regenerate Prisma client after schema changes
```

There are no tests yet.

## Architecture

This is a **Next.js 16 App Router** project with **React 19**, **Prisma 6**, **SQLite** (local dev), and **Tailwind CSS v4**.

### Key architectural decisions

- **Single-page app**: All UI lives in `app/page.tsx` as a `"use client"` component with local state. There is no router-level page splitting yet.
- **API routes** live under `app/api/`. Currently only `app/api/foods/route.ts` (GET + POST for the `Food` model).
- **Prisma singleton** at `lib/prisma.ts` — uses `globalThis` to avoid connection pool exhaustion in dev hot-reload.
- **Database**: SQLite via `prisma/dev.db`. `DATABASE_URL` is set in `.env` as `file:./dev.db`. The Prisma config file is `prisma.config.ts` (root level, not inside `prisma/`).

### Data models (`prisma/schema.prisma`)

- `Food` — food item catalog (name, brand, macros per reference type)
- `FoodLogEntry` — daily meal log entries linked to a `Food` (supports grams or servings)
- `BodyWeightEntry` — standalone weight log

`ReferenceType` enum: `PER_100G` | `PER_SERVING`  
`MealType` enum: `BREAKFAST` | `LUNCH` | `DINNER` | `SNACK`  
`QuantityUnit` enum: `G` | `SERVING`

### Tailwind v4

This project uses Tailwind CSS v4 via `@tailwindcss/postcss`. The v4 config approach differs from v3 — there is no `tailwind.config.js`; configuration is done in CSS (`app/globals.css`) using `@theme` directives.
