import { useState, useRef } from 'react'
import { CalcButton } from './shared'
import styles from './tabs.module.css'
import c from './CompoundTab.module.css'

function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(2)}K`
  return `$${n.toFixed(2)}`
}

function MiniChart({ data }) {
  if (!data || data.length < 2) return null
  const W = 600, H = 180, PAD = { top: 16, right: 16, bottom: 32, left: 56 }
  const vals = data.map(d => d.balance)
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  const rangeV = maxV - minV || 1

  const toX = i  => PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right)
  const toY = v  => H - PAD.bottom - ((v - minV) / rangeV) * (H - PAD.top - PAD.bottom)

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.balance).toFixed(1)}`).join(' ')
  const fillPath = `${linePath} L${toX(data.length - 1).toFixed(1)},${(H - PAD.bottom).toFixed(1)} L${toX(0).toFixed(1)},${(H - PAD.bottom).toFixed(1)} Z`

  // Y axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y: toY(minV + t * rangeV),
    label: fmt(minV + t * rangeV),
  }))

  // X axis labels — show every N months
  const step = data.length <= 12 ? 1 : data.length <= 24 ? 3 : data.length <= 60 ? 6 : 12
  const xTicks = data.filter((_, i) => i % step === 0 || i === data.length - 1)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={c.chart} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00ff9d" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00ff9d" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y}
            stroke="#0d2235" strokeWidth="1" />
          <text x={PAD.left - 6} y={t.y + 4}
            fill="#4a6a8a" fontSize="10" textAnchor="end" fontFamily="monospace">
            {t.label}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={fillPath} fill="url(#chartFill)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#00ff9d" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* X ticks */}
      {xTicks.map((d, i) => {
        const idx = data.indexOf(d)
        return (
          <text key={i} x={toX(idx)} y={H - PAD.bottom + 16}
            fill="#4a6a8a" fontSize="10" textAnchor="middle" fontFamily="monospace">
            M{d.month}
          </text>
        )
      })}

      {/* Final dot */}
      <circle cx={toX(data.length - 1)} cy={toY(vals[vals.length - 1])}
        r="4" fill="#00ff9d" stroke="#050a0e" strokeWidth="2" />
    </svg>
  )
}

export default function CompoundTab() {
  const [startBal,   setStartBal  ] = useState('10000')
  const [monthlyPct, setMonthlyPct] = useState('5')
  const [months,     setMonths    ] = useState('24')
  const [monthlyAdd, setMonthlyAdd] = useState('0')
  const [drawdown,   setDrawdown  ] = useState('0')
  const [result,     setResult    ] = useState(null)

  const calculate = () => {
    const bal    = parseFloat(startBal)   || 0
    const pct    = parseFloat(monthlyPct) / 100
    const mo     = parseInt(months)       || 12
    const add    = parseFloat(monthlyAdd) || 0
    const dd     = parseFloat(drawdown)   / 100

    if (bal <= 0 || pct <= 0 || mo <= 0) return

    const data = []
    let balance = bal

    for (let m = 1; m <= mo; m++) {
      // Apply monthly gain
      balance = balance * (1 + pct)
      // Apply monthly deposit
      balance += add
      // Apply drawdown months (every 6 months simulate a drawdown)
      if (dd > 0 && m % 6 === 0) {
        balance = balance * (1 - dd)
      }
      data.push({ month: m, balance: Math.max(0, balance) })
    }

    const finalBal   = data[data.length - 1].balance
    const totalGain  = finalBal - bal - (add * mo)
    const totalAdded = add * mo
    const roi        = ((finalBal - bal) / bal) * 100
    const cagr       = (Math.pow(finalBal / bal, 12 / mo) - 1) * 100

    setResult({ data, finalBal, totalGain, totalAdded, roi, cagr, startBal: bal })
  }

  return (
    <div>
      <div className={styles.grid2}>
        <div className="field" style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>
            Starting Balance ($)
          </span>
          <input className={styles.input} type="number" min="1"
            value={startBal} onChange={e => setStartBal(e.target.value)} />
        </div>

        <div className="field" style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>
            Monthly Return (%)
          </span>
          <input className={styles.input} type="number" min="0.1" max="200" step="0.1"
            value={monthlyPct} onChange={e => setMonthlyPct(e.target.value)} />
        </div>

        <div className="field" style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>
            Number of Months
          </span>
          <input className={styles.input} type="number" min="1" max="360"
            value={months} onChange={e => setMonths(e.target.value)} />
        </div>

        <div className="field" style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>
            Monthly Deposit ($ optional)
          </span>
          <input className={styles.input} type="number" min="0" step="100"
            value={monthlyAdd} onChange={e => setMonthlyAdd(e.target.value)} />
        </div>

        <div className="field" style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>
            Drawdown per 6 Months (% optional)
          </span>
          <input className={styles.input} type="number" min="0" max="99" step="0.5"
            value={drawdown} onChange={e => setDrawdown(e.target.value)} />
        </div>
      </div>

      <CalcButton onClick={calculate}>Project Account Growth</CalcButton>

      {result && (
        <>
          {/* Chart */}
          <div className={c.chartWrap}>
            <MiniChart data={result.data} />
          </div>

          {/* Key stats */}
          <div className={c.statsGrid}>
            <div className={c.statBox}>
              <span className={c.statLabel}>Final Balance</span>
              <span className={c.statVal} style={{ color: 'var(--green)' }}>{fmt(result.finalBal)}</span>
            </div>
            <div className={c.statBox}>
              <span className={c.statLabel}>Total Profit</span>
              <span className={c.statVal} style={{ color: 'var(--green)' }}>+{fmt(result.totalGain)}</span>
            </div>
            <div className={c.statBox}>
              <span className={c.statLabel}>Total ROI</span>
              <span className={c.statVal} style={{ color: 'var(--blue)' }}>{result.roi.toFixed(1)}%</span>
            </div>
            <div className={c.statBox}>
              <span className={c.statLabel}>Annualised Return</span>
              <span className={c.statVal} style={{ color: 'var(--blue)' }}>{result.cagr.toFixed(1)}%</span>
            </div>
            {result.totalAdded > 0 && (
              <div className={c.statBox}>
                <span className={c.statLabel}>Total Deposited</span>
                <span className={c.statVal} style={{ color: 'var(--muted)' }}>{fmt(result.totalAdded)}</span>
              </div>
            )}
            <div className={c.statBox}>
              <span className={c.statLabel}>Multiplier</span>
              <span className={c.statVal} style={{ color: 'var(--blue)' }}>
                ×{(result.finalBal / result.startBal).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Milestone table */}
          <div className={c.milestoneWrap}>
            <div className={c.milestoneTitle}>◈ Monthly Breakdown (key milestones)</div>
            <div className={c.tableWrap}>
              <table className={c.table}>
                <thead>
                  <tr>
                    {['Month', 'Balance', 'Gain from Start', 'Monthly Gain'].map(h => (
                      <th key={h} className={c.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data
                    .filter((_, i) => {
                      const total = result.data.length
                      if (total <= 12) return true
                      if (total <= 24) return i % 2 === 0
                      return i % Math.ceil(total / 12) === 0 || i === total - 1
                    })
                    .map((row, i, arr) => {
                      const prev   = i === 0 ? result.startBal : arr[i - 1].balance
                      const mGain  = row.balance - prev
                      const tGain  = row.balance - result.startBal
                      return (
                        <tr key={row.month} className={c.tr}>
                          <td className={c.td}>
                            <span className={c.mono}>Month {row.month}</span>
                          </td>
                          <td className={c.td}>
                            <span className={c.mono} style={{ color: '#fff' }}>{fmt(row.balance)}</span>
                          </td>
                          <td className={c.td}>
                            <span className={c.mono} style={{ color: 'var(--green)' }}>+{fmt(tGain)}</span>
                          </td>
                          <td className={c.td}>
                            <span className={c.mono} style={{ color: mGain >= 0 ? 'var(--green)' : 'var(--red)' }}>
                              {mGain >= 0 ? '+' : ''}{fmt(mGain)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
