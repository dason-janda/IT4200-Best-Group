import { createContext } from 'react'

export interface BalanceContextValue {
  balance: number
  /** Changes on every settle so the header can replay its win/loss flash. */
  flash: { dir: 'up' | 'down'; key: number } | null
  /** Set when the last settle reset the balance; cleared when a new round starts. */
  resetNotice: string | null
  /** Adds a round's net result to the balance and returns the new balance. */
  settle: (net: number) => number
  clearResetNotice: () => void
}

export const BalanceContext = createContext<BalanceContextValue | null>(null)
