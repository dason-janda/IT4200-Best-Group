import { useState } from 'react'
import { fetchCraps, type CrapsResult } from '../api'
import { useBalance } from '../balance/useBalance'
import { formatMoney } from '../game'

const errorMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error)

function getNetResult(result: CrapsResult, bet: number) {
    const outcome = [result['4. Outcome'], result['9. Final Outcome']]
        .filter((value) => value !== undefined)
        .join(' ')
    if (/\b(draw|tie|push)\b/i.test(outcome)) return 0

    const comeOutTotal = result['3. Total']
    if (comeOutTotal === 7 || comeOutTotal === 11) return bet
    if (comeOutTotal === 2 || comeOutTotal === 3 || comeOutTotal === 12) return -bet

    const point = result['5. Point']
    const pointRoll = result['8. New Total']
    if (point === undefined || pointRoll === undefined) {
        throw new Error('The craps result did not include a complete point roll.')
    }
    if (pointRoll === point) return bet
    if (pointRoll === 7) return -bet

    throw new Error('The craps result did not resolve the point.')
}

function DicePair({ first, second }: { first: number; second: number }) {
    return (
        <div className="craps-dice" aria-label={`Dice show ${first} and ${second}`}>
            <span className="craps-die">{first}</span>
            <span className="craps-die">{second}</span>
        </div>
    )
}

export function CrapsPage() {
    const { balance, settle, clearResetNotice } = useBalance()
    const [betInput, setBetInput] = useState('10')
    const [result, setResult] = useState<CrapsResult | null>(null)
    const [netResult, setNetResult] = useState<number | null>(null)
    const [rolling, setRolling] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const maxBet = Math.floor(balance)

    function adjustBet(fn: (current: number) => number) {
        const current = Number.parseInt(betInput, 10) || 0
        setBetInput(String(Math.max(1, Math.min(maxBet, fn(current)))))
    }

    async function handleRoll() {
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
        setRolling(true)
        try {
            const round = await fetchCraps()
            const net = getNetResult(round, bet)
            setResult(round)
            setNetResult(net)
            if (net !== 0) {
                const newBalance = settle(net)
                setBetInput((current) =>
                    String(Math.max(1, Math.min(Math.floor(newBalance), Number(current) || 1))),
                )
            }
        } catch (caught) {
            setError(errorMessage(caught))
        } finally {
            setRolling(false)
        }
    }

    return (
        <main className="table craps-table">
            <section className="craps-board" aria-label="Craps roll result" aria-live="polite">
                {result ? (
                    <>
                        <div className="craps-roll-section">
                            <h2>Come-out roll</h2>
                            <DicePair first={result['1. Dice1']} second={result['2. Dice2']} />
                            <p className="craps-total">Total: {result['3. Total']}</p>
                            <p>{result['4. Outcome']}</p>
                        </div>
                        {result['5. Point'] !== undefined && (
                            <div className="craps-roll-section">
                                <h2>Point roll</h2>
                                <p className="craps-point">Point: {result['5. Point']}</p>
                                <DicePair first={result['6. Dice3']!} second={result['7. Dice4']!} />
                                <p className="craps-total">Total: {result['8. New Total']}</p>
                                <p className="craps-outcome">{result['9. Final Outcome']}</p>
                            </div>
                        )}
                        {netResult !== null && (
                            <p className={netResult >= 0 ? 'pos' : 'neg'}>
                                {netResult === 0
                                    ? 'Draw — your bet is returned.'
                                    : netResult > 0
                                    ? `You won ${formatMoney(netResult)}!`
                                    : `You lost ${formatMoney(-netResult)}.`}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="craps-placeholder">Roll the dice to play.</p>
                )}
            </section>

            <section className="bet-panel" aria-label="Play craps">
                <h1>Craps</h1>
                <p>Roll two dice. A come-out 7 or 11 wins; 2, 3, or 12 loses. Any other total becomes the point.</p>
                <h2>
                    <label htmlFor="craps-bet">Bet amount</label>
                </h2>
                <div className="bet-input">
                    <span>$</span>
                    <input
                        id="craps-bet"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={maxBet}
                        step={1}
                        value={betInput}
                        onChange={(event) => setBetInput(event.target.value)}
                        disabled={rolling}
                    />
                </div>
                <div className="bet-quick">
                    <button type="button" onClick={() => adjustBet((bet) => bet + 1)} disabled={rolling}>+1</button>
                    <button type="button" onClick={() => adjustBet((bet) => bet + 10)} disabled={rolling}>+10</button>
                    <button type="button" onClick={() => adjustBet((bet) => Math.floor(bet / 2))} disabled={rolling}>½</button>
                    <button type="button" onClick={() => adjustBet((bet) => bet * 2)} disabled={rolling}>2×</button>
                    <button type="button" onClick={() => adjustBet(() => maxBet)} disabled={rolling}>Max</button>
                </div>
                <button type="button" className="spin-button" onClick={handleRoll} disabled={rolling}>
                    {rolling ? 'Rolling...' : 'Roll Dice'}
                </button>
                {error && <p className="error" role="alert">{error}</p>}
            </section>
        </main>
    )
}
