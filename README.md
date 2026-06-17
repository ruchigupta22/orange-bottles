<div align="center">
  <h1>🍊 orange</h1>
  <p><em>write to who you were. write to who you'll be.</em></p>

  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/Supabase-backend-3ECF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/Framer_Motion-animations-FF0055?style=flat-square" />
  <img src="https://img.shields.io/badge/deployed-Vercel-black?style=flat-square&logo=vercel" />

  <br /><br />

  <strong>Live →</strong> <a href="https://orange-bottles.vercel.app">orange-bottles.vercel.app</a>

</div>

---

## What is this?

**Orange** is an anonymous time-capsule web app inspired by the anime *Orange*,
where letters from the future arrive to change the present.

You write a letter — to your past self or your future self — seal it in a bottle,
and set it adrift. It stays hidden until its delivery date. Anyone can read bottles
that have arrived. Nobody can reply. You can only react.

No accounts. No usernames. Just words and time.

---

## Features

| Feature | Detail |
|---|---|
| ✍️ Write a letter | To your past or future self, up to 500 words |
| 🍶 Seal & set adrift | Choose delivery: 7 days, 1 month, 6 months, or 1 year |
| ⏳ Time-gated feed | Bottles only appear after their `visible_at` timestamp |
| 🌊 Anonymous feed | Browse all arrived bottles — no accounts, no names |
| 💛 Reactions | React with 🌊 🍊 🥺 🕊 ✉️ — session-based, no login |
| 📍 My Journey | Track your own drifting bottles with live countdowns |
| 🎨 Orange aesthetic | Amber skies, parchment cards, Playfair Display typography |
| 📱 Responsive | Works on mobile and desktop |

---

## Tech Stack

```
Frontend    React 18 + Vite
Styling     Tailwind CSS + custom CSS design system
Animations  Framer Motion
Backend     Supabase (PostgreSQL + Row Level Security)
Auth        None — anonymous session IDs via localStorage
Hosting     Vercel
```

---

## Architecture

```
src/
├── components/
│   ├── Bottle.jsx          # Floating bottle animation
│   ├── BottleCard.jsx      # Feed card with reactions
│   ├── MyBottles.jsx       # Countdown tracker
│   ├── PageWrapper.jsx     # Route transition wrapper
│   └── WriteLetter.jsx     # Letter writing + seal flow
├── pages/
│   ├── Home.jsx            # Landing + write page
│   ├── Feed.jsx            # Browse arrived bottles
│   └── MyJourney.jsx       # Your bottles — drifting + arrived
├── lib/
│   ├── api.js              # All Supabase queries
│   ├── myBottles.js        # localStorage bottle tracking
│   ├── session.js          # Anonymous session UUID
│   └── supabase.js         # Supabase client
├── hooks/
│   └── useIsMobile.js
└── styles/
    └── orange.css          # Full design system
```

---

## Database Schema

```sql
bottles (
  id          uuid PK
  content     text          -- the letter
  type        text          -- 'future' | 'past'
  deliver_in  int           -- days
  visible_at  timestamptz   -- hidden until this timestamp
  created_at  timestamptz
)

reactions (
  id          uuid PK
  bottle_id   uuid FK → bottles
  emoji       text
  session_id  text          -- anonymous identifier
  UNIQUE (bottle_id, session_id, emoji)
)
```

RLS policies ensure bottles are only readable after `visible_at <= now()`.
All writes are anonymous — no authentication required.

---

## Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/orange-bottles.git
cd orange-bottles
npm install

# Create .env
echo "VITE_SUPABASE_URL=your_url" >> .env
echo "VITE_SUPABASE_ANON_KEY=your_key" >> .env

npm run dev
```

---

## Design Philosophy

The visual identity is built around three ideas from the anime:

- **Amber horizon** — a 3px gradient bar that runs between every section, evoking the golden-hour Matsumoto sky
- **Parchment & ink** — letter surfaces use warm cream tones; body text uses Crimson Pro italic to feel handwritten
- **Quiet animation** — bottles float, reactions ripple, nothing shouts

---

## Roadmap

- [ ] Email nudge when your bottle arrives (Supabase Edge Function + Resend)
- [ ] Bottle "drifting" visualisation — animated ocean on the feed
- [ ] Share a specific bottle via link
- [ ] Dark mode (night sky palette)

---

<div align="center">
  <p><em>"I wish I could go back and fix the mistakes I made."</em></p>
  <p>— Orange, 2016</p>
</div>