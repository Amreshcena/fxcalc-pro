import { useState } from 'react'
import { PAIRS, LOT_SIZES } from '../utils/constants'
import {
  Field, ResultRow, PairSelect, LotTypeSelect,
  AccountCcySelect, CalcButton, ResultsBlock,
} from './shared'
import styles from './tabs.module.css'
import sw from './SwapTab.module.css'

// Approximate typical swap rates (points per standard lot per night)
// Positive = you receive, Negative = you pay
// These are illustrative defaults — user can override
const DEFAULT_SWAPS = {
  'EUR/USD': { long: -7.5,   short:  2.1  },
  'GBP/USD': { long: -3.2,   short: -1.8  },
  'USD/JPY': { long:  2.8,   short: -8.4  },
  'USD/CHF': { long:  1.9,   short: -7.2  },
  'AUD/USD': { long: -1.4,   short: -3.6  },
  'USD/CAD': { long: -2.1,   short: -3.0  },
  'NZD/USD': { long: -0.9,   short: -4.1  },
  'EUR/GBP': { long: -4.5,   short:  1.2  },
  'EUR/JPY': { long: -3.8,   short: -2.9  },
  'GBP/JPY': { long:  1.5,   short: -9.3  },
  'AUD/JPY': { long:  2.1,   short: -7.8  },
  'EUR/AUD': { long: -5.6,   short:  0.8  },
  'EUR/CHF': { long: -2.3,   short: -4.1  },
  'EUR/CAD': { long: -4.9,   short: -0.7  },
  'GBP/CHF': { long: -0.8,   short: -5.6  },
  'GBP/AUD': { long: -2.4,   short: -4.2  },
  'USD/MXN': { long: 42.1,   short:-68.4  },
  'USD/ZAR': { long: 31.5,   short:-58.2  },
  'USD/TRY': { long: 68.3,   short:-89.1  },
}

function getSwapDefault(pair, dir) {
  const d = DEFAULT_SWAPS[pair]
  if (d) return dir === 'long' ? d.long : d.short
  return dir === 'long' ? -5.0 : -5.0
}

export default function SwapTab() {
  const [pair,      setPair     ] = useState('EUR/USD')
  const [lotType,   setLotType  ] = useState('Standard')
  const [lots,      setLots     ] = useState('1')
  const [acctCcy,   setAcctCcy  ] = useState('USD')
  const [direction, setDirection] = useState('long')
  const [swapRate,  setSwapRate ] = useState(getSwapDefault('EUR/USD', 'long').toString())
  const [nights,    setNights   ] = useState('1')
  const [result,    setResult   ] = useState(null)

  const handlePairChange = (p) => {
    setPair(p)
    setSwapRate(getSwapDefault(p, direction).toString())
    setResult(null)
  }

  const handleDirChange = (d) => {
    setDirection(d)
    setSwapRate(getSwapDefault(pair, d).toString())
    setResult(null)
  }

  const calculate = () => {
    const lotsN    = parseFloat(lots)   || 1
    const nightsN  = parseInt(nights)   || 1
    const rateN    = parseFloat(swapRate)
    const unitSize = LOT_SIZES[lotType]

    // Swap cost = swap_rate_per_std_lot × (units / 100000) × nights
    // swap rate is in price points (e.g. -7.5 means -$0.75 per standard lot)
    const lotMultiplier = unitSize / 100000
    const swapPerNight  = rateN * lotMultiplier * lotsN
    const totalSwap     = swapPerNight * nightsN

    // Weekly (5 nights trading, Wednesday triple swap)
    const weeklySwap = swapPerNight * 7  // brokers charge triple on Wednesday

    setResult({ swapPerNight, totalSwap, weeklySwap, nightsN, lotsN })
  }

  return (
    <div>
      <div className={sw.infoBar}>
        <span className={sw.infoIcon}>ℹ</span>
        <span>Swap rates are indicative defaults. Enter your broker's exact rates for precise results.</span>
      </div>

      <div className={styles.grid2}>
        <Field label="Currency Pair">
          <PairSelect value={pair} onChange={handlePairChange} />
        </Field>
        <Field label="Direction">
          <div className={styles.radioGroup}>
            <button className={`${styles.radioBtn} ${styles.buy} ${direction==='long'?styles.buyActive:''}`}
              onClick={() => handleDirChange('long')}>▲ LONG</button>
            <button className={`${styles.radioBtn} ${styles.sell} ${direction==='short'?styles.sellActive:''}`}
              onClick={() => handleDirChange('short')}>▼ SHORT</button>
          </div>
        </Field>
        <Field label="Lot Type">
          <LotTypeSelect value={lotType} onChange={setLotType} />
        </Field>
        <Field label="Number of Lots">
          <input className={styles.input} type="number" min="0.01" step="0.01"
            value={lots} onChange={e => setLots(e.target.value)} />
        </Field>
        <Field label="Swap Rate (pts / std lot / night)">
          <input className={styles.input} type="number" step="0.1"
            value={swapRate} onChange={e => setSwapRate(e.target.value)} />
        </Field>
        <Field label="Number of Nights">
          <input className={styles.input} type="number" min="1" max="365"
            value={nights} onChange={e => setNights(e.target.value)} />
        </Field>
        <Field label="Account Currency">
          <AccountCcySelect value={acctCcy} onChange={setAcctCcy} />
        </Field>
      </div>

      <CalcButton onClick={calculate}>Calculate Swap Cost</CalcButton>

      {result && (
        <ResultsBlock>
          <ResultRow
            label="Swap Per Night"
            value={`${result.swapPerNight >= 0 ? '+' : ''}${acctCcy} ${result.swapPerNight.toFixed(4)}`}
            color={result.swapPerNight >= 0 ? 'green' : 'red'}
          />
          <ResultRow
            label={`Total Swap (${result.nightsN} nights)`}
            value={`${result.totalSwap >= 0 ? '+' : ''}${acctCcy} ${result.totalSwap.toFixed(4)}`}
            color={result.totalSwap >= 0 ? 'green' : 'red'}
          />
          <ResultRow
            label="Weekly Swap (incl. triple Wed)"
            value={`${result.weeklySwap >= 0 ? '+' : ''}${acctCcy} ${result.weeklySwap.toFixed(4)}`}
            color={result.weeklySwap >= 0 ? 'green' : 'red'}
          />
          <ResultRow
            label="Annual Swap Estimate"
            value={`${result.swapPerNight * 365 >= 0 ? '+' : ''}${acctCcy} ${(result.swapPerNight * 365).toFixed(2)}`}
            color={result.swapPerNight >= 0 ? 'green' : 'red'}
          />
        </ResultsBlock>
      )}
    </div>
  )
}
