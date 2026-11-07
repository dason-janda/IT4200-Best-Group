import { useEffect, useRef, useState } from 'react'
import {
  fetchMultiplier,
  fetchRoulettePayout,
  type RouletteColor,
  type RoulettePayout,
} from '../api'
import { useBalance } from '../balance/useBalance'
import { MultiplierStrip } from '../components/MultiplierStrip'
import { RouletteWheel } from '../components/RouletteWheel'
import {
  formatMoney,
  formatMultiplier,
  formatSigned,
  planWheelSpin,
  roundCents,
  type WheelSpin,
} from '../game'

type Phase = 'betting' | 'spinning' | 'decide' | 'rolling' | 'result'

interface Round {
  id: number
  number: number
  color: RouletteColor
  net: number
  multiplier: number | null
}

const COLOR_OPTIONS: { color: RouletteColor; label: string; odds: string }[] = [
  { color: 'red', label: 'Red', odds: 'pays 1:1' },
  { color: 'black', label: 'Black', odds: 'pays 1:1' },
  { color: 'green', label: 'Green 0', odds: 'pays 35:1' },
]

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e))

export function RoulettePage() {
  const { balance, settle, resetNotice, clearResetNotice } = useBalance()
  const [betInput, setBetInput] = useState('10')
  const [color, setColor] = useState<RouletteColor>('red')
  const [phase, setPhase] = useState<Phase>('betting')
  const [spinId, setSpinId] = useState(0)
  const [spin, setSpin] = useState<RoulettePayout | null>(null)
  const [wheel, setWheel] = useState<WheelSpin>({ rotation: 0, durationMs: 0 })
  const [landed, setLanded] = useState<number | null>(null)
  const [multiplier, setMultiplier] = useState<number | null>(null)
  const [finalNet, setFinalNet] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [history, setHistory] = useState<Round[]>([])

  // The API has already decided the round once a result comes back; this holds
  // what it's worth until the animations finish and it's settled.
  const pendingNet = useRef<number | null>(null)

  // If you navigate away mid-round, settle it as if you'd watched it finish, so
  // leaving the page can't be used to dodge a loss.
  const settleRef = useRef(settle)
  useEffect(() => {
    settleRef.current = settle
  })
  useEffect(
    () => () => {
      if (pendingNet.current !== null) settleRef.current(pendingNet.current)
    },
    [],
  )

  const maxBet = Math.floor(balance)
  const busy = phase !== 'betting'

  function adjustBet(fn: (current: number) => number) {
    const current = Number.parseInt(betInput, 10) || 0
    setBetInput(String(Math.max(1, Math.min(maxBet, fn(current)))))
  }

  async function handleSpin() {
    const bet = Number(betInput)
    if (!Number.isInteger(bet) || bet < 1) {
      setError('Bet must be a whole number of at least $1.')
      return
    }
    if (bet > balance) {
      setError(`You only have ${formatMoney(balance)}.`)
      return
    }

    setError(null)
    clearResetNotice()
    setLanded(null)
    setPhase('spinning')
    try {
      const result = await fetchRoulettePayout(color, bet)
      pendingNet.current = result.winnings
      setSpin(result)
      setSpinId((id) => id + 1)
      setWheel(planWheelSpin(wheel.rotation, result.spin.number))
    } catch (e) {
      setError(errorMessage(e))
      setPhase('betting')
    }
  }

  function handleSpinEnd() {
    if (!spin) return
    setLanded(spin.spin.number)
    setModalError(null)
    setPhase('decide')
  }

  /** Applies the round's final result to the shared balance. */
  function finishRound(net: number, usedMultiplier: number | null) {
    if (!spin) return
    pendingNet.current = null
    const newBalance = settle(net)
    setBetInput((b) => String(Math.max(1, Math.min(Math.floor(newBalance), Number(b) || 1))))
    setFinalNet(net)
    setHistory((h) =>
      [
        {
          id: spinId,
          number: spin.spin.number,
          color: spin.spin.color,
          net,
          multiplier: usedMultiplier,
        },
        ...h,
      ].slice(0, 10),
    )
  }

  function handleKeep() {
    if (!spin) return
    finishRound(spin.winnings, null)
    setPhase('betting')
  }

  async function handleUseMultiplier() {
    if (!spin) return
    setModalError(null)
    setMultiplier(null)
    setPhase('rolling')
    try {
      const { multiplier } = await fetchMultiplier()
      pendingNet.current = roundCents(spin.winnings * multiplier)
      setMultiplier(multiplier)
    } catch (e) {
      setModalError(errorMessage(e))
      setPhase('decide')
    }
  }

  function handleStripDone() {
    if (!spin || multiplier === null) return
    finishRound(roundCents(spin.winnings * multiplier), multiplier)
    setPhase('result')
  }

  const modalOpen = phase === 'decide' || phase === 'rolling' || phase === 'result'

  return (
    <>
      <main className="table">
        <section className="wheel-panel">
          <RouletteWheel spin={wheel} landed={landed} onSpinEnd={handleSpinEnd} />
        </section>

        <section className="bet-panel" aria-label="Place your bet">
          <h2>Pick a color</h2>
          <div className="color-options" role="radiogroup">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.color}
                type="button"
                role="radio"
                aria-checked={color === opt.color}
                className={`color-option color-${opt.color}${color === opt.color ? ' selected' : ''}`}
                onClick={() => setColor(opt.color)}
                disabled={busy}
              >
                <span className="color-name">{opt.label}</span>
                <span className="color-odds">{opt.odds}</span>
              </button>
            ))}
          </div>

          <h2>
            <label htmlFor="bet">Bet amount</label>
          </h2>
          <div className="bet-input">
            <span>$</span>
            <input
              id="bet"
              type="number"
              inputMode="numeric"
              min={1}
              max={maxBet}
              step={1}
              value={betInput}
              onChange={(e) => setBetInput(e.target.value)}
              disabled={busy}
            />
          </div>
          <div className="bet-quick">
            <button type="button" onClick={() => adjustBet((b) => b + 1)} disabled={busy}>+1</button>
            <button type="button" onClick={() => adjustBet((b) => b + 10)} disabled={busy}>+10</button>
            <button type="button" onClick={() => adjustBet((b) => Math.floor(b / 2))} disabled={busy}>½</button>
            <button type="button" onClick={() => adjustBet((b) => b * 2)} disabled={busy}>2×</button>
            <button type="button" onClick={() => adjustBet(() => maxBet)} disabled={busy}>Max</button>
          </div>

          <button type="button" className="spin-button" onClick={handleSpin} disabled={busy}>
            {phase === 'spinning' ? 'Spinning…' : 'Spin'}
          </button>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </section>
      </main>

      {history.length > 0 && (
        <section className="history" aria-label="Recent rounds">
          <h2>Recent rounds</h2>
          <ol>
            {history.map((r) => (
              <li key={r.id}>
                <span className={`chip chip-sm chip-${r.color}`}>{r.number}</span>
                <span className={r.net >= 0 ? 'pos' : 'neg'}>{formatSigned(r.net)}</span>
                {r.multiplier !== null && <span className="history-mult">{formatMultiplier(r.multiplier)}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {modalOpen && spin && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <p className="modal-eyebrow">
              Landed on{' '}
              <span className={`chip chip-sm chip-${spin.spin.color}`}>{spin.spin.number}</span>{' '}
              ({spin.spin.color})
            </p>
            <h2 id="modal-title" className={spin.won ? 'pos' : 'neg'}>
              {spin.won ? `You won ${formatMoney(spin.winnings)}!` : `You lost ${formatMoney(-spin.winnings)}`}
            </h2>

            {phase === 'decide' && (
              <>
                <p className="modal-copy">
                  Want to roll the multiplier? It multiplies your result, so a win can get bigger
                  or shrink, and a loss can shrink or get much worse.
                </p>
                {modalError && (
                  <p className="error" role="alert">
                    {modalError}
                  </p>
                )}
                <div className="modal-actions">
                  <button type="button" className="btn-primary" onClick={handleUseMultiplier} autoFocus>
                    Roll the multiplier
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleKeep}>
                    {spin.won ? `Keep ${formatSigned(spin.winnings)}` : `Take the ${formatSigned(spin.winnings)}`}
                  </button>
                </div>
              </>
            )}

            {(phase === 'rolling' || phase === 'result') && (
              <>
                {multiplier === null ? (
                  <div className="strip-loading">Rolling…</div>
                ) : (
                  <MultiplierStrip key={spinId} target={multiplier} onDone={handleStripDone} />
                )}
                {phase === 'result' && finalNet !== null && multiplier !== null && (
                  <div className="modal-result">
                    <p>
                      {formatSigned(spin.winnings)} × {formatMultiplier(multiplier)} ={' '}
                      <strong className={finalNet >= 0 ? 'pos' : 'neg'}>{formatSigned(finalNet)}</strong>
                    </p>
                    {resetNotice && <p className="banner banner-reset">{resetNotice}</p>}
                    <button type="button" className="btn-primary" onClick={() => setPhase('betting')} autoFocus>
                      Continue
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
