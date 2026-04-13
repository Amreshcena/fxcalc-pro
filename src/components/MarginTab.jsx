import { useState } from 'react'
import { PAIRS } from '../utils/constants'
import { calcMargin } from '../utils/calculations'
import { Field, ResultRow, PairSelect, LotTypeSelect, CalcButton, ResultsBlock } from './shared'
import styles from './tabs.module.css'

export default function MarginTab() {
  const [pair,     setPair    ] = useState('EUR/USD')
  const [lotType,  setLotType ] = useState('Standard')
  const [lots,     setLots    ] = useState('1')
  const [price,    setPrice   ] = useState('')
  const [leverage, setLeverage] = useState('100')
  const [result,   setResult  ] = useState(null)

  const calculate = () => {
    const r = calcMargin(lotType, parseFloat(lots) || 1, parseFloat(price), parseFloat(leverage))
    setResult(r)
  }

  const marginPct = leverage ? (1 / parseFloat(leverage)) * 100 : 0

  return (
    <div>
      <div className={styles.grid2}>
        <Field label="Currency Pair">
          <PairSelect value={pair} onChange={setPair} />
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
        <Field label="Market Price">
          <input
            className={styles.input}
            type="number"
            step="0.00001"
            placeholder={PAIRS[pair]?.isJpy ? '150.500' : '1.08500'}
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </Field>
        <Field label="Leverage (1 : X)">
          <input
            className={styles.input}
            type="number"
            min="1"
            value={leverage}
            onChange={e => setLeverage(e.target.value)}
          />
        </Field>
        <Field label="Margin Rate">
          <input
            className={styles.input}
            type="text"
            readOnly
            value={`${marginPct.toFixed(2)}%`}
            style={{ color: 'var(--muted)', cursor: 'default' }}
          />
        </Field>
      </div>

      <CalcButton onClick={calculate}>Calculate Margin Required</CalcButton>

      {result && (
        <ResultsBlock>
          <ResultRow
            label="Margin Required"
            value={`$${result.margin.toFixed(2)}`}
          />
          <ResultRow
            label="Position Value"
            value={`$${result.positionValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            color="blue"
          />
          <ResultRow label="Units"        value={result.units.toLocaleString()}  color="blue" />
          <ResultRow label="Margin Rate"  value={`${marginPct.toFixed(2)}%`}     color="blue" />
        </ResultsBlock>
      )}
    </div>
  )
}
