import { useState } from 'react'
import { PAIRS, LOT_SIZES } from '../utils/constants'
import { calcPnL } from '../utils/calculations'
import {
  Field, ResultRow, PairSelect, LotTypeSelect,
  AccountCcySelect, CalcButton, ResultsBlock,
} from './shared'
import styles from './tabs.module.css'

export default function PnLTab({ rates }) {
  const [pair,      setPair     ] = useState('EUR/USD')
  const [lotType,   setLotType  ] = useState('Standard')
  const [lots,      setLots     ] = useState('1')
  const [entry,     setEntry    ] = useState('')
  const [exit,      setExit     ] = useState('')
  const [direction, setDirection] = useState('buy')
  const [acctCcy,   setAcctCcy  ] = useState('USD')
  const [result,    setResult   ] = useState(null)

  const placeholder = PAIRS[pair]?.isJpy ? '150.500' : '1.08500'

  const calculate = () => {
    const e = parseFloat(entry)
    const x = parseFloat(exit)
    if (isNaN(e) || isNaN(x)) return
    const r = calcPnL(pair, lotType, parseFloat(lots) || 1, e, x, direction, acctCcy, rates)
    setResult(r)
  }

  return (
    <div>
      <div className={styles.grid2}>
        <Field label="Currency Pair">
          <PairSelect value={pair} onChange={v => { setPair(v); setResult(null) }} />
        </Field>
        <Field label="Lot Type">
          <LotTypeSelect value={lotType} onChange={setLotType} />
        </Field>
        <Field label="Number of Lots">
          <input
            className={styles.input}
            type="number"
            min="0.01"
            step="0.01"
            value={lots}
            onChange={e => setLots(e.target.value)}
          />
        </Field>
        <Field label="Account Currency">
          <AccountCcySelect value={acctCcy} onChange={setAcctCcy} />
        </Field>
        <Field label="Entry Price">
          <input
            className={styles.input}
            type="number"
            step="0.00001"
            placeholder={placeholder}
            value={entry}
            onChange={e => setEntry(e.target.value)}
          />
        </Field>
        <Field label="Exit Price">
          <input
            className={styles.input}
            type="number"
            step="0.00001"
            placeholder={placeholder}
            value={exit}
            onChange={e => setExit(e.target.value)}
          />
        </Field>
        <Field label="Direction">
          <div className={styles.radioGroup}>
            <button
              className={`${styles.radioBtn} ${styles.buy} ${direction === 'buy' ? styles.buyActive : ''}`}
              onClick={() => setDirection('buy')}
            >
              ▲ BUY / LONG
            </button>
            <button
              className={`${styles.radioBtn} ${styles.sell} ${direction === 'sell' ? styles.sellActive : ''}`}
              onClick={() => setDirection('sell')}
            >
              ▼ SELL / SHORT
            </button>
          </div>
        </Field>
      </div>

      <CalcButton onClick={calculate}>Calculate P&amp;L</CalcButton>

      {result && (
        <ResultsBlock>
          <ResultRow
            label="Profit / Loss"
            value={`${result.pnl >= 0 ? '+' : ''}${acctCcy} ${result.pnl.toFixed(2)}`}
            color={result.pnl >= 0 ? 'green' : 'red'}
          />
          <ResultRow
            label="Pips"
            value={`${result.pips >= 0 ? '+' : ''}${result.pips} pips`}
            color={result.pips >= 0 ? 'green' : 'red'}
          />
          <ResultRow
            label="Units Traded"
            value={result.units.toLocaleString()}
            color="blue"
          />
        </ResultsBlock>
      )}
    </div>
  )
}
