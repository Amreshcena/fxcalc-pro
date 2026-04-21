import { PAIRS, TICKER_PAIRS } from '../utils/constants'
import { useFavorites } from '../hooks/useFavorites'
import styles from './RatesBar.module.css'

const MAX_TICKER = 20

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

  const chips = tickerPairs.map(pair => {  //  was TICKER_PAIRS, must be tickerPairs
    const meta = PAIRS[pair]
    if (!meta) return null  //safety guard for crypto/commodity pairs not in PAIRS
    const { base, quote, isJpy } = meta
    const key = `${base}/${quote}`
    const val = rates[key]
    const decimals = isJpy ? 3 : 5
    return { pair, val: val ? val.toFixed(decimals) : null }
  }).filter(Boolean)  // ✅ removes null entries from safety guard above

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
