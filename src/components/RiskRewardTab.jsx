import { useState } from 'react'
import { PAIRS, LOT_SIZES } from '../utils/constants'
import { calcPipValue, getPipSize } from '../utils/calculations'
import {
  Field, ResultRow, PairSelect, LotTypeSelect,
  AccountCcySelect, CalcButton, ResultsBlock,
} from './shared'
import styles from './tabs.module.css'
import rrStyles from './RiskRewardTab.module.css'
import { useJournal } from '../hooks/useJournal'

export default function RiskRewardTab({ rates }) {
  const { addEntry } = useJournal()
  const [saved, setSaved] = useState(false)
  const [pair,      setPair     ] = useState('EUR/USD')
  const [lotType,   setLotType  ] = useState('Standard')
  const [lots,      setLots     ] = useState('1')
  const [acctCcy,   setAcctCcy  ] = useState('USD')
  const [entry,     setEntry    ] = useState('')
  const [stopLoss,  setStopLoss ] = useState('')
  const [takeProfit,setTakeProfit] = useState('')
  const [direction, setDirection] = useState('buy')
  const [result,    setResult   ] = useState(null)

  const placeholder = PAIRS[pair]?.isJpy ? '150.500' : '1.08500'

  const calculate = () => {
    const e  = parseFloat(entry)
    const sl = parseFloat(stopLoss)
    const tp = parseFloat(takeProfit)
    if (isNaN(e) || isNaN(sl) || isNaN(tp)) return

    const pipSize = getPipSize(pair)

    const riskPips   = direction === 'buy' ? (e - sl) / pipSize : (sl - e) / pipSize
    const rewardPips = direction === 'buy' ? (tp - e) / pipSize : (e - tp) / pipSize

    if (riskPips <= 0 || rewardPips <= 0) {
      setResult({ error: 'Check price levels — SL/TP direction mismatch.' })
      return
    }

    const rrRatio = rewardPips / riskPips

    const { pipValueInAccount } = calcPipValue(pair, lotType, parseFloat(lots) || 1, acctCcy, rates)
    const pipValPerLot = pipValueInAccount / (parseFloat(lots) || 1)

    const riskAmount   = riskPips   * pipValPerLot * (parseFloat(lots) || 1)
    const rewardAmount = rewardPips * pipValPerLot * (parseFloat(lots) || 1)

    setResult({ riskPips, rewardPips, rrRatio, riskAmount, rewardAmount, error: null })
  }

  const rrColor = result && !result.error
    ? result.rrRatio >= 2   ? 'var(--green)'
    : result.rrRatio >= 1   ? '#f0c040'
    : 'var(--red)'
    : 'var(--muted)'

  const riskBarPct   = result && !result.error ? Math.min(100, (result.riskPips   / (result.riskPips + result.rewardPips)) * 100) : 50
  const rewardBarPct = 100 - riskBarPct

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
        <Field label="Direction">
          <div className={styles.radioGroup}>
            <button className={`${styles.radioBtn} ${styles.buy} ${direction==='buy'?styles.buyActive:''}`}
              onClick={() => setDirection('buy')}>▲ BUY / LONG</button>
            <button className={`${styles.radioBtn} ${styles.sell} ${direction==='sell'?styles.sellActive:''}`}
              onClick={() => setDirection('sell')}>▼ SELL / SHORT</button>
          </div>
        </Field>
        <Field label="Entry Price">
          <input className={styles.input} type="number" step="0.00001"
            placeholder={placeholder} value={entry} onChange={e => setEntry(e.target.value)} />
        </Field>
        <Field label="Stop Loss Price">
          <input className={styles.input} type="number" step="0.00001"
            placeholder={placeholder} value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
        </Field>
        <Field label="Take Profit Price">
          <input className={styles.input} type="number" step="0.00001"
            placeholder={placeholder} value={takeProfit} onChange={e => setTakeProfit(e.target.value)} />
        </Field>
      </div>

      <CalcButton onClick={calculate}>Calculate Risk / Reward</CalcButton>

      {result?.error && (
        <div className={rrStyles.errorMsg}>{result.error}</div>
      )}

      {result && !result.error && (
        <>
          {/* Visual R/R bar */}
          <div className={rrStyles.rrBarWrap}>
            <div className={rrStyles.rrBarLabel}>
              <span style={{ color: 'var(--red)' }}>RISK</span>
              <span style={{ color: rrColor, fontSize: 20, fontWeight: 700 }}>
                1 : {result.rrRatio.toFixed(2)}
              </span>
              <span style={{ color: 'var(--green)' }}>REWARD</span>
            </div>
            <div className={rrStyles.rrBar}>
              <div className={rrStyles.rrRisk}   style={{ width: `${riskBarPct}%` }} />
              <div className={rrStyles.rrReward} style={{ width: `${rewardBarPct}%` }} />
            </div>
            <div className={rrStyles.rrBarSub}>
              <span>{result.riskPips.toFixed(1)} pips</span>
              <span>{result.rewardPips.toFixed(1)} pips</span>
            </div>
          </div>

          <ResultsBlock>
            <ResultRow label="R/R Ratio"     value={`1 : ${result.rrRatio.toFixed(2)}`}
              color={result.rrRatio >= 2 ? 'green' : result.rrRatio >= 1 ? 'blue' : 'red'} />
            <ResultRow label="Risk (pips)"    value={`${result.riskPips.toFixed(1)} pips`}   color="red" />
            <ResultRow label="Reward (pips)"  value={`${result.rewardPips.toFixed(1)} pips`} color="green" />
            <ResultRow label="Max Risk"       value={`${acctCcy} ${result.riskAmount.toFixed(2)}`}   color="red" />
            <ResultRow label="Max Reward"     value={`${acctCcy} ${result.rewardAmount.toFixed(2)}`} color="green" />
            <ResultRow
              label="Trade Quality"
              value={
                result.rrRatio >= 3 ? '★★★ EXCELLENT'
                : result.rrRatio >= 2 ? '★★☆ GOOD'
                : result.rrRatio >= 1 ? '★☆☆ ACCEPTABLE'
                : '✗ POOR — SKIP THIS TRADE'
              }
              color={result.rrRatio >= 2 ? 'green' : result.rrRatio >= 1 ? 'blue' : 'red'}
            />
          </ResultsBlock>

          {/* Save to Journal */}
          <button
            className={rrStyles.saveBtn}
            onClick={() => {
              addEntry({
                pair, direction, lotType,
                lots:      parseFloat(lots) || 1,
                acctCcy,
                entry:     parseFloat(entry),
                sl:        parseFloat(stopLoss) || null,
                tp:        parseFloat(takeProfit) || null,
                riskAmt:   result.riskAmount,
                rewardAmt: result.rewardAmount,
                rrRatio:   result.rrRatio,
                result:    'open',
                pnl:       null,
                notes:     '',
              })
              setSaved(true)
              setTimeout(() => setSaved(false), 2500)
            }}
          >
            {saved ? '✓ Saved to Journal' : '+ Save to Journal'}
          </button>
        </>
      )}
    </div>
  )
}
