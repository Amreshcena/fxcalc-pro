import { useState } from 'react'
import { LOT_SIZES } from '../utils/constants'
import { calcPipValue, calcPositionSize } from '../utils/calculations'
import {
  Field, ResultRow, PairSelect, LotTypeSelect,
  AccountCcySelect, CalcButton, ResultsBlock,
} from './shared'
import styles from './tabs.module.css'

export default function PositionSizeTab({ rates }) {
  const [pair,    setPair   ] = useState('EUR/USD')
  const [lotType, setLotType] = useState('Standard')
  const [balance, setBalance] = useState('10000')
  const [riskPct, setRiskPct] = useState('2')
  const [slPips,  setSlPips ] = useState('50')
  const [acctCcy, setAcctCcy] = useState('USD')
  const [result,  setResult ] = useState(null)

  const calculate = () => {
    // Pip value for 1 lot in account currency
    const { pipValueInAccount } = calcPipValue(pair, lotType, 1, acctCcy, rates)
    const r = calcPositionSize(
      parseFloat(balance),
      parseFloat(riskPct),
      parseFloat(slPips),
      pipValueInAccount
    )
    setResult({ ...r, pipValueInAccount, units: LOT_SIZES[lotType] * r.lots })
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
        <Field label="Account Balance">
          <input
            className={styles.input}
            type="number"
            min="1"
            value={balance}
            onChange={e => setBalance(e.target.value)}
          />
        </Field>
        <Field label="Risk %">
          <input
            className={styles.input}
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            value={riskPct}
            onChange={e => setRiskPct(e.target.value)}
          />
        </Field>
        <Field label="Stop Loss (Pips)">
          <input
            className={styles.input}
            type="number"
            min="1"
            value={slPips}
            onChange={e => setSlPips(e.target.value)}
          />
        </Field>
        <Field label="Account Currency">
          <AccountCcySelect value={acctCcy} onChange={setAcctCcy} />
        </Field>
      </div>

      <CalcButton onClick={calculate}>Calculate Position Size</CalcButton>

      {result && (
        <ResultsBlock>
          <ResultRow label="Recommended Lots"  value={result.lots.toFixed(2)} />
          <ResultRow
            label="Max Risk Amount"
            value={`${acctCcy} ${result.riskAmount.toFixed(2)}`}
            color="red"
          />
          <ResultRow
            label="Units"
            value={Math.round(result.units).toLocaleString()}
            color="blue"
          />
          <ResultRow
            label={`Pip Value / Lot (${acctCcy})`}
            value={`${acctCcy} ${result.pipValueInAccount.toFixed(4)}`}
            color="blue"
          />
        </ResultsBlock>
      )}
    </div>
  )
}
