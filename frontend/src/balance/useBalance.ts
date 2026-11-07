import { useContext } from 'react'
import { BalanceContext } from './balanceContext'

export function useBalance() {
  const ctx = useContext(BalanceContext)
  if (!ctx) throw new Error('useBalance must be used inside <BalanceProvider>')
  return ctx
}
