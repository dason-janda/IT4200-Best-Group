import { useState } from 'react'
import { fetchBlackjack, type BlackjackResult } from '../api'

function PlayingCard({ card }: { card: string }) {
  const [value, suit] = card.split(' of ')
  const red = suit === 'Hearts' || suit === 'Diamonds'

  const symbol =
    suit === 'Hearts' ? '♥' :
    suit === 'Diamonds' ? '♦' :
    suit === 'Clubs' ? '♣' : '♠'

  return (
    <div className={`blackjack-card ${red ? 'card-red' : 'card-black'}`}>
      <span className="card-value">{value}</span>
      <span className="card-suit">{symbol}</span>
      <span className="card-corner">{symbol}</span>
    </div>
  )
}

export function BlackjackPage() {
  const [result, setResult] = useState<BlackjackResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function dealHand() {
    setLoading(true)
    setError(null)

    try {
      const hand = await fetchBlackjack()
      setResult(hand)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : String(caught),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="blackjack-table">
      <section className="blackjack-board">
        <h1>Blackjack</h1>

        <p className="blackjack-subtitle">
          Try your luck and see what the cards have in store.
        </p>

        <div className="blackjack-cards" aria-live="polite">
          {result ? (
            result.cards.map((card, index) => (
              <PlayingCard key={`${card}-${index}`} card={card} />
            ))
          ) : (
            <p className="blackjack-placeholder">
              Your cards will appear here.
            </p>
          )}
        </div>

        {result && (
          <div className="blackjack-result">
            <p className="blackjack-total">
              Hand Total: {result.total}
            </p>

            <h2 className={result.blackjack ? 'pos' : ''}>
              {result.blackjack ? 'BLACKJACK!' : 'No Blackjack'}
            </h2>

            <p>
              {result.blackjack
                ? 'You got 21! What a hand!'
                : 'Try another hand and see what you get.'}
            </p>
          </div>
        )}

        <button
          type="button"
          className="spin-button blackjack-deal"
          onClick={dealHand}
          disabled={loading}
        >
          {loading ? 'Dealing Cards...' : 'Deal Hand'}
        </button>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  )
}