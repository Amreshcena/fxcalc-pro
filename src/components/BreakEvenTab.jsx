import { useState } from 'react'
import { PAIRS, LOT_SIZES } from '../utils/constants'
import { calcPipValue } from '../utils/calculations'
import {
  Field, ResultRow, PairSelect, LotTypeSelect,
  AccountCcySelect, CalcButton, ResultsBlock,
} from './shared'
import styles from './tabs.module.css'

export default function BreakEvenTab({ rates }) {
  const [pair,       setPair      ] = useState('EUR/USD')
  const [lotType,    setLotType   ] = useState('Standard')
  const [lots,       setLots      ] = useState('1')
  const [acctCcy,    setAcctCcy   ] = useState('USD')
  const [spread,     setSpread    ] = useState('2')        // pips
  const [commission, setCommission] = useState('7')        // $ per round trip
  const [slippage,   setSlippage  ] = useState('0.5')      // pips
  const [result,     setResult    ] = useState(null)

  const calculate = () => {
    const lotsN    = parseFloat(lots)       || 1
    const spreadN  = parseFloat(spread)     || 0
    const commN    = parseFloat(commission) || 0
    const slipN    = parseFloat(slippage)   || 0

    const { pipValueInAccount } = calcPipValue(pair, lotType, lotsN, acctCcy, rates)
    const pipVal = pipValueInAccount / lotsN   // per lot pip value

    // Total cost in $
    const spreadCost = spreadN * pipVal * lotsN
    const slipCost   = slipN   * pipVal * lotsN
    const totalCost  = spreadCost + commN + slipCost

    // Break-even in pips
    const bePips = totalCost / (pipVal * lotsN)

    // Break-even price move
    const pipSize = PAIRS[pair]?.isJpy ? 0.01 : 0.0001
    const bePrice = bePips * pipSize

    setResult({ spreadCost, commN, slipCost, totalCost, bePips, bePrice, pipVal })
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
          <input className={styles.input} type="number" min="0.01" step="0.01"
            value={lots} onChange={e => setLots(e.target.value)} />
        </Field>
        <Field label="Account Currency">
          <AccountCcySelect value={acctCcy} onChange={setAcctCcy} />
        </Field>
        <Field label="Spread (pips)">
          <input className={styles.input} type="number" min="0" step="0.1"
            value={spread} onChange={e => setSpread(e.target.value)} />
        </Field>
        <Field label="Commission ($ round-trip)">
          <input className={styles.input} type="number" min="0" step="0.5"
            value={commission} onChange={e => setCommission(e.target.value)} />
        </Field>
        <Field label="Slippage (pips)">
          <input className={styles.input} type="number" min="0" step="0.1"
            value={slippage} onChange={e => setSlippage(e.target.value)} />
        </Field>
      </div>

      <CalcButton onClick={calculate}>Calculate Break-Even</CalcButton>

      {result && (
        <ResultsBlock>
          <ResultRow
            label="Break-Even Pips"
            value={`${result.bePips.toFixed(2)} pips`}
          />
          <ResultRow
            label="Break-Even Price Move"
            value={result.bePrice.toFixed(PAIRS[pair]?.isJpy ? 3 : 5)}
            color="blue"
          />
          <ResultRow
            label="Total Entry Cost"
            value={`${acctCcy} ${result.totalCost.toFixed(2)}`}
            color="red"
          />
          <ResultRow
            label="Spread Cost"
            value={`${acctCcy} ${result.spreadCost.toFixed(2)}`}
            color="red"
          />
          <ResultRow
            label="Commission"
            value={`${acctCcy} ${result.commN.toFixed(2)}`}
            color="red"
          />
          <ResultRow
            label="Slippage Cost"
            value={`${acctCcy} ${result.slipCost.toFixed(2)}`}
            color="red"
          />
          <ResultRow
            label="Pip Value"
            value={`${acctCcy} ${result.pipVal.toFixed(4)} / pip / lot`}
            color="blue"
          />
        </ResultsBlock>
      )}
    </div>
  )
}
