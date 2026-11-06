# Gabriella & Zachary — Wedding Invitation (React + Vite)

```bash
npm install
npm run dev      # preview locally
npm run build    # production files in /dist
```

## Images (to get the exact video look)
See **AI_IMAGE_PROMPTS.md** — 9 prompts with exact file names. Put the generated files into
`public/images/`. Each one replaces its drawn stand-in automatically; nothing else to change.

## Content
All text, times and the venue live in `src/data.js`.
The countdown target is `countdown.targetISO` — set it to your real wedding date/time.

## Music
Put `public/music.mp3`. It starts when the seal is tapped; the burgundy button (bottom-right) pauses/plays.

## Flow
Burgundy damask envelope + wax seal → tap → gold leaves glow through the envelope → flaps open with a
beam of golden light → light flash → painted arch hero (names fade in) → rose border + invitation →
"The Celebration Begins In" countdown → "Schedule of Events" (red rose travels down the timeline as you
scroll) → Location with venue painting.
