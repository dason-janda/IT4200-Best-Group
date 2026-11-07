import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { useBalance } from '../balance/useBalance'
import { formatMoney } from '../game'
import { NAV_ITEMS } from '../navigation'

/** Smoothly counts a displayed number toward its new value. */
function useAnimatedNumber(value: number, ms = 700) {
  const [display, setDisplay] = useState(value)
  const current = useRef(value)
  const frame = useRef(0)

  useEffect(() => {
    const from = current.current
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      current.current = from + (value - from) * (1 - (1 - t) ** 3)
      setDisplay(current.current)
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [value, ms])

  return display
}

export function Header() {
  const { balance, flash } = useBalance()
  const shownBalance = useAnimatedNumber(balance)

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        Best Group <span>Casino</span>
      </Link>

      <nav className="nav" aria-label="Games">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} className="nav-link">
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="balance" aria-live="polite">
        <span className="balance-label">Balance</span>
        <span
          key={flash?.key}
          className={`balance-amount${flash ? ` flash-${flash.dir}` : ''}`}
        >
          {formatMoney(shownBalance)}
        </span>
      </div>
    </header>
  )
}
