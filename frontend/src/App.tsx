import { Navigate, Route, Routes } from 'react-router'
import { useBalance } from './balance/useBalance'
import { Header } from './components/Header'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { RoulettePage } from './pages/RoulettePage'
import { CrapsPage } from './pages/CrapsPage'
import { BlackjackPage } from './pages/BlackjackPage'
import './App.css'

export default function App() {
  const { resetNotice } = useBalance()

  return (
    <div className="app">
      <Header />
      {resetNotice && <div className="banner banner-reset">{resetNotice}</div>}

      <Routes>
        <Route index element={<Navigate to="/roulette" replace />} />
        <Route path="/roulette" element={<RoulettePage />} />
        <Route path="/slots" element={<ComingSoonPage title="Slots" />} />
        <Route path="/blackjack" element={<BlackjackPage />} />
        <Route path="/rocket-ride" element={<ComingSoonPage title="Rocket Ride" />} />
        <Route path="/craps" element={<CrapsPage />} />
        <Route path="*" element={<Navigate to="/roulette" replace />} />
      </Routes>
    </div>
  )
}