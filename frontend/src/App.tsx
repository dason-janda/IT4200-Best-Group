import { Navigate, Route, Routes } from 'react-router'
import { useBalance } from './balance/useBalance'
import { Header } from './components/Header'
import { RoulettePage } from './pages/RoulettePage'
import { CrapsPage } from './pages/CrapsPage'
import { BlackjackPage } from './pages/BlackjackPage'
import { MicrowavePage } from './pages/MicrowavePage'
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
        <Route path="/blackjack" element={<BlackjackPage />} />
        <Route path="/craps" element={<CrapsPage />} />
        <Route path="*" element={<Navigate to="/roulette" replace />} />
        <Route path="/microwave" element={<MicrowavePage />} />
      </Routes>
    </div>
  )
}