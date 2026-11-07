import type { TransitionEvent } from 'react'
import { POCKET_ANGLE, WHEEL_ORDER, colorOf, type WheelSpin } from '../game'

const POCKET_OUTER = 94
const POCKET_INNER = 64

/** Point on a circle, with 0° at the top and angles increasing clockwise. */
function polar(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180
  return [r * Math.sin(a), -r * Math.cos(a)]
}

function wedgePath(inner: number, outer: number, from: number, to: number): string {
  const [x0, y0] = polar(outer, from)
  const [x1, y1] = polar(outer, to)
  const [x2, y2] = polar(inner, to)
  const [x3, y3] = polar(inner, from)
  return `M${x0} ${y0} A${outer} ${outer} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${inner} ${inner} 0 0 0 ${x3} ${y3}Z`
}

const POCKETS = WHEEL_ORDER.map((number, i) => ({
  number,
  angle: i * POCKET_ANGLE,
  color: colorOf(number),
  path: wedgePath(POCKET_INNER, POCKET_OUTER, (i - 0.5) * POCKET_ANGLE, (i + 0.5) * POCKET_ANGLE),
}))

interface Props {
  /** Target rotation from planWheelSpin; changing it starts a CSS transition. */
  spin: WheelSpin
  /** Pocket to highlight once the wheel has stopped. */
  landed: number | null
  onSpinEnd: () => void
}

export function RouletteWheel({ spin, landed, onSpinEnd }: Props) {
  function handleTransitionEnd(e: TransitionEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && e.propertyName === 'transform') onSpinEnd()
  }

  return (
    <div className="wheel-wrap">
      <div className="wheel-pointer" aria-hidden="true" />
      <div
        className="wheel"
        style={{
          transform: `rotate(${spin.rotation}deg)`,
          transition: spin.durationMs
            ? `transform ${spin.durationMs}ms cubic-bezier(0.12, 0.75, 0.15, 1)`
            : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <svg viewBox="-100 -100 200 200" role="img" aria-label="Roulette wheel">
          <defs>
            <radialGradient id="hub" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#7a4a22" />
              <stop offset="100%" stopColor="#3a1f0c" />
            </radialGradient>
          </defs>
          <circle r="99" className="wheel-rim" />
          <circle r="95.5" className="wheel-rim-inner" />
          {POCKETS.map((p) => (
            <g key={p.number}>
              <path
                d={p.path}
                className={`pocket pocket-${p.color}${landed === p.number ? ' pocket-win' : ''}`}
              />
              <text
                className="pocket-label"
                transform={`rotate(${p.angle}) translate(0 ${-(POCKET_OUTER - 11)})`}
              >
                {p.number}
              </text>
            </g>
          ))}
          <circle r={POCKET_INNER} className="wheel-track" />
          <circle r="50" fill="url(#hub)" className="wheel-hub" />
          {[0, 45, 90, 135].map((deg) => (
            <rect
              key={deg}
              x="-2"
              y="-44"
              width="4"
              height="88"
              rx="2"
              className="wheel-spoke"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle r="10" className="wheel-cap" />
        </svg>
      </div>
      {landed !== null && (
        <div className="wheel-result" aria-live="polite">
          <span className={`chip chip-${colorOf(landed)}`}>{landed}</span>
        </div>
      )}
    </div>
  )
}
