import { useState } from 'react'
import { PAIRS } from '../utils/constants'
import { calcPipDiff } from '../utils/calculations'
import { Field, ResultRow, PairSelect, CalcButton, ResultsBlock } from './shared'
import styles from './tabs.module.css'

export default function PipDiffTab() {
  const [pair,   setPair  ] = useState('EUR/USD')
  const [entry,  setEntry ] = useState('')
  const [exit,   setExit  ] = useState('')
  const [result, setResult] = useState(null)

  const placeholder = PAIRS[pair]?.isJpy ? '150.500' : '1.08500'

  const calculate = () => {
    const e = parseFloat(entry)
    const x = parseFloat(exit)
    if (isNaN(e) || isNaN(x)) return
    setResult(calcPipDiff(pair, e, x))
  }

  return (
    <div>
      <div className={styles.grid3}>
        <Field label="Currency Pair">
          <PairSelect value={pair} onChange={v => { setPair(v); setResult(null) }} />
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
      </div>

      <CalcButton onClick={calculate}>Calculate Pip Difference</CalcButton>

      {result && (
        <ResultsBlock>
          <ResultRow label="Pip Difference" value={`${result.pips} pips`} />
          <ResultRow
            label="Price Difference"
            value={result.priceDiff.toFixed(PAIRS[pair].isJpy ? 3 : 5)}
            color="blue"
          />
          <ResultRow label="Pip Size" value={result.pipSize} color="blue" />
        </ResultsBlock>
      )}
    </div>
  )
}
