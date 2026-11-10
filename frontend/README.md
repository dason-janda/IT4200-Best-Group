# Best Group Casino (frontend)

A React + Vite frontend for the class API in `2026-IT4200-Fall/app.py`. The
header navbar switches between game pages (React Router). Your balance lives in
the header and is shared by every page; it starts at $100 on each page load.

Right now **Roulette** is playable, and **Slots**, **Blackjack** and
**Rocket Ride** are placeholders.

## Roulette

You start with $100. Pick red, black or green and place a bet. The wheel calls
`/roulette-payout` and spins until it lands on the number the API returned. Then
a popup asks whether to roll the multiplier. If you do, it calls `/multiplier`,
and a CS:GO-style strip scrolls until it stops on that multiplier. The
multiplier applies to your result, so it also multiplies losses. If your balance
drops below $1 (including going negative), it resets to $100.

The wheel uses the standard European number order and colors, matching
`/roulette` (0 is green, and 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27,
30, 32, 34 and 36 are red). If you leave the page mid-round, the round is still settled as
if you'd watched it finish.

## Running it

```sh
npm install
npm run dev
```

Then open http://localhost:5173.

The API is hosted at https://two026-it4200-fall.onrender.com. It doesn't send
CORS headers, so the browser can't call it directly. Instead, the dev server
proxies `/api/*` to it (see `vite.config.ts`). To use a locally running copy of
the API, set `API_TARGET`:

```sh
API_TARGET=http://localhost:8000 npm run dev
```

The proxy only exists in `npm run dev` and `npm run preview`. If the site is
ever deployed as static files, it will need its own proxy, or the API will
need to allow CORS.

## Layout

| File | Purpose |
| --- | --- |
| `src/api.ts` | Fetch helpers and types for `/roulette-payout` and `/multiplier` |
| `src/game.ts` | Wheel pocket order, spin-angle math, multiplier odds, formatting |
| `src/components/RouletteWheel.tsx` | SVG wheel rotated with a CSS transition |
| `src/components/MultiplierStrip.tsx` | Scrolling multiplier strip, animated with a CSS transition |
| `src/App.tsx` | Page routes and the balance-reset banner |
| `src/components/Header.tsx` | Brand, navbar, and the animated balance |
| `src/navigation.ts` | Navbar entries (path + label) |
| `src/balance/` | Shared balance context: `settle()` and the $100 reset rule |
| `src/pages/RoulettePage.tsx` | Roulette betting and the multiplier popup |
| `src/pages/ComingSoonPage.tsx` | Placeholder used by the unbuilt games |

## Adding a game

1. Create `src/pages/YourGamePage.tsx`. Use `useBalance()` to read the balance
   and call `settle(net)` with the round's net win or loss.
2. Add `{ path: '/your-game', label: 'Your Game' }` to `src/navigation.ts`.
3. Add a matching `<Route>` in `src/App.tsx`, or point an existing placeholder
   route at your page.
