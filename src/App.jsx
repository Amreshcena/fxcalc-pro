import { AuthProvider } from './context/AuthContext'
import ForexCalculator from './components/ForexCalculator'

export default function App() {
  return (
    <AuthProvider>
      <ForexCalculator />
    </AuthProvider>
  )
}
