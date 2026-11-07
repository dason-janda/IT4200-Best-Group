import { useRef, useState, type ReactNode } from 'react'
import { STARTING_BALANCE, formatMoney, roundCents } from '../game'
import { BalanceContext, type BalanceContextValue } from './balanceContext'

/** One balance shared by every game page. Starts at $100 on each page load. */
export function BalanceProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(STARTING_BALANCE)
  // Mirrors `balance` so settle() is always correct, even when called from a
  // stale closure (e.g. a game page settling its last round as it unmounts).
  const balanceRef = useRef(STARTING_BALANCE)
  const [flash, setFlash] = useState<BalanceContextValue['flash']>(null)
  const [resetNotice, setResetNotice] = useState<string | null>(null)

  function settle(net: number) {
    const next = roundCents(balanceRef.current + net)
    // Reset below $0, and also below the $1 minimum bet so you're never stuck.
    const broke = next < 1
    const newBalance = broke ? STARTING_BALANCE : next

    balanceRef.current = newBalance
    setBalance(newBalance)
    setFlash({ dir: net >= 0 ? 'up' : 'down', key: Date.now() })
    setResetNotice(
      broke
        ? `You hit ${formatMoney(next)}. The house took pity and reset you to ${formatMoney(STARTING_BALANCE)}.`
        : null,
    )
    return newBalance
  }

  const value: BalanceContextValue = {
    balance,
    flash,
    resetNotice,
    settle,
    clearResetNotice: () => setResetNotice(null),
  }

  return <BalanceContext value={value}>{children}</BalanceContext>
}
