import { useState } from 'react'
import { PAIRS, LOT_SIZES } from '../utils/constants'
import { calcPipValue, calcMargin } from '../utils/calculations'
import { PairSelect, LotTypeSelect, AccountCcySelect } from './shared'
import styles from './tabs.module.css'
import e from './ExposureTab.module.css'

let nextId = 1

function emptyPosition() {
  return {
    id:        nextId++,
    pair:      'EUR/USD',
    direction: 'buy',
    lotType:   'Standard',
    lots:      '1',
    entryPrice:'',
    currentPrice:'',
    leverage:  '100',
  }
}

export default function ExposureTab({ rates }) {
  const [positions,  setPositions ] = useState([emptyPosition()])
  const [acctCcy,    setAcctCcy   ] = useState('USD')
  const [calculated, setCalculated] = useState(null)

  const addPosition = () => setPositions(ps => [...ps, emptyPosition()])

  const removePosition = (id) => setPositions(ps => ps.filter(p => p.id !== id))

  const updatePosition = (id, field, value) =>
    setPositions(ps => ps.map(p => p.id === id ? { ...p, [field]: value } : p))

  const calculate = () => {
    let totalExposure = 0
    let totalMargin   = 0
    let totalPnL      = 0
    const rows = []

    for (const pos of positions) {
      const lotsN    = parseFloat(pos.lots)        || 1
      const entryN   = parseFloat(pos.entryPrice)  || 0
      const currN    = parseFloat(pos.currentPrice)|| entryN
      const levN     = parseFloat(pos.leverage)    || 100
      const units    = LOT_SIZES[pos.lotType] * lotsN
      const pipSize  = PAIRS[pos.pair]?.isJpy ? 0.01 : 0.0001

      // Exposure = position value in base currency
      const exposure = units * (currN || entryN)

      // Margin
      const { margin } = calcMargin(pos.lotType, lotsN, entryN || 1, levN)

      // P&L
      const { pipValueInAccount } = calcPipValue(pos.pair, pos.lotType, lotsN, acctCcy, rates)
      const pips = pos.direction === 'buy'
        ? (currN - entryN) / pipSize
        : (entryN - currN) / pipSize
      const pnl = pips * (pipValueInAccount / lotsN)

      totalExposure += exposure
      totalMargin   += margin
      totalPnL      += isNaN(pnl) ? 0 : pnl

      rows.push({ ...pos, exposure, margin, pnl: isNaN(pnl) ? null : pnl, pips: isNaN(pips) ? null : pips })
    }

    setCalculated({ rows, totalExposure, totalMargin, totalPnL })
  }

  return (
    <div>
      {/* Account Currency */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>Account CCY</span>
        <select className={e.miniSelect} value={acctCcy} onChange={ev => setAcctCcy(ev.target.value)}>
          {['USD','EUR','GBP','JPY','CHF','AUD','CAD','NZD'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Position Rows */}
      <div className={e.positionsWrap}>
        {positions.map((pos, idx) => (
          <div key={pos.id} className={e.posCard}>
            <div className={e.posHeader}>
              <span className={e.posNum}>Position {idx + 1}</span>
              {positions.length > 1 && (
                <button className={e.removeBtn} onClick={() => removePosition(pos.id)}>✕ Remove</button>
              )}
            </div>
            <div className={styles.grid2} style={{ gap: 10 }}>
              <div className="field" style={{ display:'flex',flexDirection:'column',gap:5 }}>
                <span className={e.lbl}>Pair</span>
                <PairSelect value={pos.pair} onChange={v => updatePosition(pos.id, 'pair', v)} />
              </div>
              <div className="field" style={{ display:'flex',flexDirection:'column',gap:5 }}>
                <span className={e.lbl}>Direction</span>
                <div className={styles.radioGroup}>
                  <button className={`${styles.radioBtn} ${styles.buy} ${pos.direction==='buy'?styles.buyActive:''}`}
                    onClick={() => updatePosition(pos.id, 'direction', 'buy')}>▲ BUY</button>
                  <button className={`${styles.radioBtn} ${styles.sell} ${pos.direction==='sell'?styles.sellActive:''}`}
                    onClick={() => updatePosition(pos.id, 'direction', 'sell')}>▼ SELL</button>
                </div>
              </div>
              <div className="field" style={{ display:'flex',flexDirection:'column',gap:5 }}>
                <span className={e.lbl}>Lot Type</span>
                <LotTypeSelect value={pos.lotType} onChange={v => updatePosition(pos.id, 'lotType', v)} />
              </div>
              <div className="field" style={{ display:'flex',flexDirection:'column',gap:5 }}>
                <span className={e.lbl}>Lots</span>
                <input className={styles.input} type="number" min="0.01" step="0.01"
                  value={pos.lots} onChange={ev => updatePosition(pos.id, 'lots', ev.target.value)} />
              </div>
              <div className="field" style={{ display:'flex',flexDirection:'column',gap:5 }}>
                <span className={e.lbl}>Entry Price</span>
                <input className={styles.input} type="number" step="0.00001"
                  placeholder={PAIRS[pos.pair]?.isJpy ? '150.500' : '1.08500'}
                  value={pos.entryPrice} onChange={ev => updatePosition(pos.id, 'entryPrice', ev.target.value)} />
              </div>
              <div className="field" style={{ display:'flex',flexDirection:'column',gap:5 }}>
                <span className={e.lbl}>Current Price</span>
                <input className={styles.input} type="number" step="0.00001"
                  placeholder="for P&L"
                  value={pos.currentPrice} onChange={ev => updatePosition(pos.id, 'currentPrice', ev.target.value)} />
              </div>
              <div className="field" style={{ display:'flex',flexDirection:'column',gap:5 }}>
                <span className={e.lbl}>Leverage (1:X)</span>
                <input className={styles.input} type="number" min="1"
                  value={pos.leverage} onChange={ev => updatePosition(pos.id, 'leverage', ev.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={e.actionRow}>
        <button className={e.addBtn} onClick={addPosition}>+ Add Position</button>
        <button className={e.calcBtn} onClick={calculate}>Calculate Total Exposure</button>
      </div>

      {calculated && (
        <>
          {/* Per-position table */}
          <div className={e.tableWrap}>
            <table className={e.table}>
              <thead>
                <tr>
                  {['#','Pair','Dir','Lots','Exposure','Margin','P&L','Pips'].map(h => (
                    <th key={h} className={e.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calculated.rows.map((row, i) => (
                  <tr key={row.id} className={e.tr}>
                    <td className={e.td}><span className={e.mono}>{i + 1}</span></td>
                    <td className={e.td}><span className={e.pair}>{row.pair}</span></td>
                    <td className={e.td}>
                      <span style={{ color: row.direction === 'buy' ? 'var(--green)' : 'var(--red)', fontFamily:'var(--font-mono)', fontSize:12 }}>
                        {row.direction === 'buy' ? '▲' : '▼'}
                      </span>
                    </td>
                    <td className={e.td}><span className={e.mono}>{row.lots}</span></td>
                    <td className={e.td}><span className={e.mono}>${row.exposure.toLocaleString(undefined,{maximumFractionDigits:0})}</span></td>
                    <td className={e.td}><span className={e.mono} style={{color:'var(--blue)'}}>${row.margin.toFixed(2)}</span></td>
                    <td className={e.td}>
                      <span className={e.mono} style={{ color: row.pnl == null ? 'var(--muted)' : row.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {row.pnl != null ? `${row.pnl >= 0?'+':''}${acctCcy} ${row.pnl.toFixed(2)}` : '—'}
                      </span>
                    </td>
                    <td className={e.td}>
                      <span className={e.mono} style={{ color: row.pips == null ? 'var(--muted)' : row.pips >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {row.pips != null ? `${row.pips >= 0?'+':''}${row.pips.toFixed(1)}` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className={e.summaryGrid}>
            <div className={e.sumCard}>
              <span className={e.sumLabel}>Total Exposure</span>
              <span className={e.sumVal} style={{color:'var(--blue)'}}>
                ${calculated.totalExposure.toLocaleString(undefined,{maximumFractionDigits:0})}
              </span>
            </div>
            <div className={e.sumCard}>
              <span className={e.sumLabel}>Total Margin Used</span>
              <span className={e.sumVal} style={{color:'var(--blue)'}}>
                ${calculated.totalMargin.toFixed(2)}
              </span>
            </div>
            <div className={e.sumCard}>
              <span className={e.sumLabel}>Net P&L</span>
              <span className={e.sumVal} style={{ color: calculated.totalPnL >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {calculated.totalPnL >= 0 ? '+' : ''}{acctCcy} {calculated.totalPnL.toFixed(2)}
              </span>
            </div>
            <div className={e.sumCard}>
              <span className={e.sumLabel}>Open Positions</span>
              <span className={e.sumVal} style={{color:'var(--text)'}}>{positions.length}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
