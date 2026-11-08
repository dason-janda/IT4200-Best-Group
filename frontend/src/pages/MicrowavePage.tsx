import { useState } from 'react'
import { fetchMicrowave, type MicrowaveResult } from '../api'

export function MicrowavePage() {
    const [microwave, setMicrowave] = useState<MicrowaveResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function openMicrowave() {
        setLoading(true)
        setError('')

        try {
            const result = await fetchMicrowave()
            setMicrowave(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="microwave-page">
            <h1>Microwave Mystery Box</h1>
            <p>Open a mystery box to discover a random microwave!</p>

            <button onClick={openMicrowave} disabled={loading}>
                {loading ? 'Opening...' : 'Open Mystery Box'}
            </button>

            {error && <p role="alert">{error}</p>}

            {microwave && (
                <div className="microwave-result">
                    <h2>{microwave.name}</h2>
                    <p>Rarity: {microwave.rarity.toUpperCase()}</p>
                    <p>Value: ${microwave.value}</p>
                    <p>Power: {microwave.power_watts} watts</p>
                    <p>Warranty: {microwave.warranty_months} months</p>
                    <p>Available: {microwave.available ? 'Yes' : 'No'}</p>
                </div>
            )}
        </div>
    )
}