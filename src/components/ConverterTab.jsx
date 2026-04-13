import { useState } from 'react'
import styles from './ConverterTab.module.css'

const CURRENCIES = [
  'USD','EUR','GBP','JPY','CHF','AUD','CAD','NZD',
  'SEK','NOK','DKK','SGD','HKD','MXN','ZAR','TRY',
  'INR','BRL','PLN','CZK','HUF','CNY',
]

export default function ConverterTab({ rates }) {
  const [amount, setAmount] = useState('1000')
  const [from,   setFrom  ] = useState('USD')
  const [to,     setTo    ] = useState('EUR')

  const convert = () => {
    const key = `${from}/${to}`
    const rate = rates[key]
    if (!rate) return null
    return parseFloat(amount) * rate
  }

  const swap = () => { setFrom(to); setTo(from) }

  const result   = convert()
  const rateDisp = rates[`${from}/${to}`]

  // Build quick conversion table for popular amounts
  const quickAmounts = [1, 100, 500, 1000, 5000, 10000, 50000, 100000]

  return (
    <div>
      <div className={styles.converterCard}>
        {/* Amount + From */}
        <div className={styles.row}>
          <div className={styles.amountField}>
            <label className={styles.lbl}>Amount</label>
            <input
              className={styles.amountInput}
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div className={styles.ccyField}>
            <label className={styles.lbl}>From</label>
            <select className={styles.ccySelect} value={from} onChange={e => setFrom(e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Swap button */}
        <div className={styles.swapRow}>
          <div className={styles.swapLine} />
          <button className={styles.swapBtn} onClick={swap} title="Swap currencies">⇅</button>
          <div className={styles.swapLine} />
        </div>

        {/* Result + To */}
        <div className={styles.row}>
          <div className={styles.amountField}>
            <label className={styles.lbl}>Result</label>
            <div className={styles.resultBox}>
              {result != null
                ? result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                : <span style={{ color: 'var(--muted)' }}>—</span>}
            </div>
          </div>
          <div className={styles.ccyField}>
            <label className={styles.lbl}>To</label>
            <select className={styles.ccySelect} value={to} onChange={e => setTo(e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Exchange rate line */}
        {rateDisp && (
          <div className={styles.rateRow}>
            <span className={styles.rateTxt}>
              1 {from} = <strong>{rateDisp.toFixed(from === 'JPY' || to === 'JPY' ? 3 : 5)}</strong> {to}
            </span>
            <span className={styles.rateTxt}>
              1 {to} = <strong>{(1 / rateDisp).toFixed(from === 'JPY' || to === 'JPY' ? 3 : 5)}</strong> {from}
            </span>
          </div>
        )}
      </div>

      {/* Quick reference table */}
      {rateDisp && (
        <div className={styles.quickWrap}>
          <div className={styles.quickTitle}>◈ Quick Reference — {from} → {to}</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>{from}</th>
                  <th className={styles.th}>{to}</th>
                </tr>
              </thead>
              <tbody>
                {quickAmounts.map(amt => (
                  <tr key={amt} className={styles.tr}>
                    <td className={styles.td}>
                      <span className={styles.mono}>{amt.toLocaleString()}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.mono} style={{ color: 'var(--green)' }}>
                        {(amt * rateDisp).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
