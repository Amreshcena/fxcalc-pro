import { PAIRS, TICKER_PAIRS } from '../utils/constants'
import { useFavorites } from '../hooks/useFavorites'
import styles from './RatesBar.module.css'

const MAX_TICKER = 30

// Smart decimal places based on pair type and magnitude
function formatRate(val, meta) {
  if (!val) return null
  if (meta.isCrypto) {
    // BTC ~90k: 2dp; mid-range (SOL, BNB): 2dp; small (XRP, DOGE, ADA): 4dp
    if (val >= 1000) return val.toFixed(2)
    if (val >= 1)    return val.toFixed(4)
    return val.toFixed(6)
  }
  if (meta.isCommodity) {
    // Gold ~3300, Silver ~33, Oil ~70: 2dp is right
    if (val >= 100) return val.toFixed(2)
    if (val >= 1)   return val.toFixed(3)
    return val.toFixed(5)
  }
  // Standard forex
  return val.toFixed(meta.isJpy ? 3 : 5)
}

export default function RatesBar({ rates, loading, lastUpdated }) {
  const { favorites } = useFavorites()

  const tickerPairs = (() => {
    if (!favorites || favorites.length === 0) {
      return TICKER_PAIRS.slice(0, MAX_TICKER)
    }
    const result = [...favorites]
    for (const pair of TICKER_PAIRS) {
      if (result.length >= MAX_TICKER) break
      if (!result.includes(pair)) {
        result.push(pair)
      }
    }
    return result.slice(0, MAX_TICKER)
  })()

  const chips = tickerPairs.map(pair => {
    const meta = PAIRS[pair]
    if (!meta) return null
    const { base, quote } = meta
    const key = `${base}/${quote}`
    const val = rates[key]
    return { pair, val: val ? formatRate(val, meta) : null }
  }).filter(Boolean)

  return (
    <div className={styles.bar}>
      {chips.map(({ pair, val }) => (
        <div className={styles.chip} key={pair}>
          <span className={styles.pairLabel}>{pair}</span>
          {loading || !val
            ? <span className={styles.skeleton} />
            : <span className={styles.rateVal}>{val}</span>
          }
        </div>
      ))}
    </div>
  )
}
