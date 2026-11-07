import type { RouletteColor } from './api'

export const STARTING_BALANCE = 100

/** Same color rule as /roulette in app.py: 0 is green, even is black, odd is red. */
export function colorOf(n: number): RouletteColor {
  if (n === 0) return 'green'
  return n % 2 === 0 ? 'black' : 'red'
}

// Pocket order around the wheel, clockwise from the top. Because the API colors
// by parity, odds and evens are interleaved so red and black alternate like a
// real wheel.
const ODDS = [27, 9, 1, 33, 21, 15, 5, 29, 13, 35, 3, 19, 25, 7, 31, 11, 23, 17]
const EVENS = [32, 4, 18, 26, 12, 8, 36, 22, 2, 14, 30, 6, 20, 28, 10, 34, 16, 24]
export const WHEEL_ORDER: number[] = [0, ...EVENS.flatMap((even, i) => [even, ODDS[i]])]
export const POCKET_ANGLE = 360 / WHEEL_ORDER.length

export interface WheelSpin {
  rotation: number
  durationMs: number
}

const mod = (n: number, m: number) => ((n % m) + m) % m

/**
 * Plans a spin from the wheel's current rotation so that `target` ends up under
 * the pointer at the top, after several full turns.
 */
export function planWheelSpin(currentRotation: number, target: number): WheelSpin {
  const reduced = prefersReducedMotion()
  // Land somewhere inside the pocket rather than dead center, so it looks natural.
  const jitter = (Math.random() - 0.5) * POCKET_ANGLE * 0.7
  const fullTurns = reduced ? 1 : 5 + Math.floor(Math.random() * 3)
  // Rotating the wheel by -angle brings the pocket at that angle to the top.
  const goal = -(WHEEL_ORDER.indexOf(target) * POCKET_ANGLE + jitter)
  return {
    rotation: currentRotation + fullTurns * 360 + mod(goal - currentRotation, 360),
    durationMs: reduced ? 900 : 6000 + Math.random() * 1500,
  }
}

/** Multipliers and odds from /multiplier in app.py; used for the filler tiles in the strip. */
export const MULTIPLIER_TABLE: { value: number; weight: number }[] = [
  { value: 0.01, weight: 40 },
  { value: 0.1, weight: 25 },
  { value: 1, weight: 15 },
  { value: 2, weight: 10 },
  { value: 3, weight: 5 },
  { value: 5, weight: 3 },
  { value: 10, weight: 1.5 },
  { value: 100, weight: 0.5 },
]

export function randomMultiplier(): number {
  const total = MULTIPLIER_TABLE.reduce((sum, m) => sum + m.weight, 0)
  let roll = Math.random() * total
  for (const m of MULTIPLIER_TABLE) {
    roll -= m.weight
    if (roll < 0) return m.value
  }
  return MULTIPLIER_TABLE[0].value
}

/** CS:GO-style rarity tier for a multiplier, used for tile coloring. */
export function multiplierTier(value: number): string {
  if (value >= 100) return 'gold'
  if (value >= 10) return 'covert'
  if (value >= 5) return 'classified'
  if (value >= 3) return 'restricted'
  if (value >= 2) return 'milspec'
  if (value >= 1) return 'industrial'
  return 'consumer'
}

export const roundCents = (n: number) => Math.round(n * 100) / 100

export function formatMoney(n: number): string {
  const abs = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${n < 0 ? '-' : ''}$${abs}`
}

export function formatSigned(n: number): string {
  return `${n >= 0 ? '+' : ''}${formatMoney(n)}`
}

export const formatMultiplier = (m: number) => `${m}×`

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}
