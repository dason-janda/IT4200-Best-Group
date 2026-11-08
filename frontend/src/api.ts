// Thin client for the IT4200 Fall 2026 class API (2026-IT4200-Fall/app.py).
// In dev, Vite proxies /api/* to the Flask server (see vite.config.ts), which
// sidesteps CORS since app.py doesn't send CORS headers.

export type RouletteColor = 'red' | 'black' | 'green'

export interface RoulettePayout {
  your_color: RouletteColor
  bet: number
  spin: { number: number; color: RouletteColor }
  won: boolean
  /** Net result of the bet: +bet * odds on a win, -bet on a loss. */
  winnings: number
  payout: number
}

export interface MultiplierResult {
  multiplier: number
}

export interface CrapsResult {
  "1. Dice1": number
  "2. Dice2": number
  "3. Total": number
  "4. Outcome": string
  "5. Point"?: number
  "6. Dice3"?: number
  "7. Dice4"?: number
  "8. New Total"?: number
  "9. Final Outcome"?: string
}

const API_BASE: string = import.meta.env.VITE_API_BASE ?? '/api'

async function getJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const query = params ? `?${new URLSearchParams(params)}` : ''
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}${query}`)
  } catch {
    throw new Error('Could not reach the API. Is the Flask server running on port 8000?')
  }

  const body = await res.json().catch(() => null)
  if (!res.ok || body === null) {
    throw new Error(
      body?.error ?? `API request failed (${res.status}). Is the Flask server running on port 8000?`,
    )
  }
  return body as T
}

export function fetchRoulettePayout(color: RouletteColor, bet: number) {
  return getJson<RoulettePayout>('/roulette-payout', { color, bet: String(bet) })
}

export function fetchMultiplier() {
  return getJson<MultiplierResult>('/multiplier')
}

export function fetchCraps() {
  return getJson<CrapsResult>('/craps')
}

export interface BlackjackResult {
  game: string
  cards: string[]
  total: number
  blackjack: boolean
}

export function fetchBlackjack() {
  return getJson<BlackjackResult>('/blackjack')
}

export interface MicrowaveResult {
  name: string
  value: number
  rarity: string
  available: boolean
  power_watts: number
  warranty_months: number
}

export function fetchMicrowave() {
  return getJson<MicrowaveResult>('/microwave')
}