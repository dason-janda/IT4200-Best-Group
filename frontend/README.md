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

The wheel colors pockets the same way `/roulette` does (0 is green, even
numbers are black, odd numbers are red), so the numbers aren't in standard
casino order. If you leave the page mid-round, the round is still settled as
if you'd watched it finish.

## Running it

1. Start the API (it listens on port 8000):

   ```sh
   cd 2026-IT4200-Fall
   pip install -r requirements.txt
   python app.py
   ```

2. Start the frontend:

   ```sh
   cd IT4200-Best-Group/frontend
   npm install
   npm run dev
   ```

3. Open http://localhost:5173.

The dev server proxies `/api/*` to `http://localhost:8000`, because `app.py`
doesn't send CORS headers. If the API runs somewhere else, set `API_TARGET`
(for example, `API_TARGET=http://192.168.1.20:8000 npm run dev`).

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
