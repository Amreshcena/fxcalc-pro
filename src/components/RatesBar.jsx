import { PAIRS, TICKER_PAIRS } from '../utils/constants'
import styles from './RatesBar.module.css'

export default function RatesBar({ rates, loading }) {
  const chips = TICKER_PAIRS.map(pair => {
    const { base, quote, isJpy } = PAIRS[pair]
    const key      = `${base}/${quote}`
    const val      = rates[key]
    const decimals = isJpy ? 3 : 5
    return { pair, val: val ? val.toFixed(decimals) : null }
  })

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
