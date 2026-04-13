import { useState } from 'react'
import { PAIRS } from '../utils/constants'
import { calcLeverage } from '../utils/calculations'
import { Field, ResultRow, PairSelect, LotTypeSelect, CalcButton, ResultsBlock } from './shared'
import styles from './tabs.module.css'

function riskLabel(lev) {
  if (lev > 200) return { text: '⚠ EXTREME', color: 'red' }
  if (lev > 100) return { text: '⚠ VERY HIGH', color: 'red' }
  if (lev > 50)  return { text: 'HIGH', color: 'red' }
  if (lev > 20)  return { text: 'MODERATE', color: 'blue' }
  return           { text: 'LOW / CONSERVATIVE', color: 'green' }
}

export default function LeverageTab() {
  const [pair,    setPair   ] = useState('EUR/USD')
  const [lotType, setLotType] = useState('Standard')
  const [lots,    setLots   ] = useState('1')
  const [price,   setPrice  ] = useState('')
  const [balance, setBalance] = useState('10000')
  const [result,  setResult ] = useState(null)

  const calculate = () => {
    const r = calcLeverage(lotType, parseFloat(lots) || 1, parseFloat(price), parseFloat(balance))
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
        <Field label="Account Balance" span2>
          <input
            className={styles.input}
            type="number"
            min="1"
            value={balance}
            onChange={e => setBalance(e.target.value)}
          />
        </Field>
      </div>

      <CalcButton onClick={calculate}>Calculate Leverage</CalcButton>

      {result && (() => {
        const risk = riskLabel(result.leverage)
        return (
          <ResultsBlock>
            <ResultRow label="Leverage Ratio"  value={`1 : ${result.leverage.toFixed(1)}`} />
            <ResultRow
              label="Position Value"
              value={`$${result.positionValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              color="blue"
            />
            <ResultRow label="Units"      value={result.units.toLocaleString()} color="blue" />
            <ResultRow label="Risk Level" value={risk.text}                     color={risk.color} />
          </ResultsBlock>
        )
      })()}
    </div>
  )
}
