import { useEffect, useRef, useState, type TransitionEvent } from 'react'
import { formatMultiplier, multiplierTier, prefersReducedMotion, randomMultiplier } from '../game'

const TILE_COUNT = 60
const WIN_INDEX = 52
const TILE_WIDTH = 96
const TILE_GAP = 8
const PITCH = TILE_WIDTH + TILE_GAP

interface Props {
  /** The multiplier returned by the API; the strip always stops on it. */
  target: number
  onDone: () => void
}

/** Mounted fresh for each roll; scrolls on mount and calls onDone when it stops. */
export function MultiplierStrip({ target, onDone }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [tiles] = useState(() =>
    Array.from({ length: TILE_COUNT }, (_, i) => (i === WIN_INDEX ? target : randomMultiplier())),
  )
  const [offset, setOffset] = useState(0)
  const [duration, setDuration] = useState(0)
  const [stopped, setStopped] = useState(false)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const reduced = prefersReducedMotion()
    const jitter = (Math.random() - 0.5) * TILE_WIDTH * 0.8
    const center = WIN_INDEX * PITCH + TILE_WIDTH / 2
    const finalOffset = center - viewport.clientWidth / 2 + jitter

    // Reading clientWidth above flushed layout with the strip at 0, so changing
    // the transform on the next frame animates from there.
    const frame = requestAnimationFrame(() => {
      setDuration(reduced ? 900 : 5500)
      setOffset(finalOffset)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  function handleTransitionEnd(e: TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return
    setStopped(true)
    onDone()
  }

  return (
    <div className="strip-viewport" ref={viewportRef}>
      <div
        className="strip"
        style={{
          gap: TILE_GAP,
          transform: `translateX(${-offset}px)`,
          transition: duration ? `transform ${duration}ms cubic-bezier(0.08, 0.6, 0.12, 1)` : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {tiles.map((value, i) => (
          <div
            key={i}
            className={`tile tier-${multiplierTier(value)}${stopped && i === WIN_INDEX ? ' tile-win' : ''}`}
            style={{ width: TILE_WIDTH }}
          >
            {formatMultiplier(value)}
          </div>
        ))}
      </div>
      <div className="strip-marker" aria-hidden="true" />
      <div className="strip-fade strip-fade-left" aria-hidden="true" />
      <div className="strip-fade strip-fade-right" aria-hidden="true" />
    </div>
  )
}
