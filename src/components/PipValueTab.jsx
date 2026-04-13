import { useState } from 'react'
import { PAIRS, LOT_SIZES } from '../utils/constants'
import { calcPipValue } from '../utils/calculations'
import {
  Field, ResultRow, PairSelect, LotTypeSelect,
  AccountCcySelect, CalcButton, ResultsBlock,
} from './shared'
import styles from './tabs.module.css'

export default function PipValueTab({ rates }) {
  const [pair,    setPair   ] = useState('EUR/USD')
  const [lotType, setLotType] = useState('Standard')
  const [lots,    setLots   ] = useState('1')
  const [acctCcy, setAcctCcy] = useState('USD')
  const [result,  setResult ] = useState(null)

  const calculate = () => {
    const r = calcPipValue(pair, lotType, parseFloat(lots) || 1, acctCcy, rates)
    setResult(r)
  }

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
        <Field label="Account Currency">
          <AccountCcySelect value={acctCcy} onChange={setAcctCcy} />
        </Field>
      </div>

      <CalcButton onClick={calculate}>Calculate Pip Value</CalcButton>

      {result && (
        <ResultsBlock>
          <ResultRow
            label="Pip Value (Quote CCY)"
            value={`${result.pipValueInQuote.toFixed(2)} ${PAIRS[pair].quote}`}
          />
          <ResultRow
            label={`Pip Value (${acctCcy})`}
            value={`${acctCcy} ${result.pipValueInAccount.toFixed(4)}`}
            color="blue"
          />
          <ResultRow
            label="Units Traded"
            value={result.units.toLocaleString()}
            color="blue"
          />
          <ResultRow
            label="Pip Size"
            value={result.pipSize}
            color="blue"
          />
        </ResultsBlock>
      )}
    </div>
  )
}
